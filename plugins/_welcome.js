 import { WAMessageStubType } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

export async function before(m, { conn, participants, groupMetadata }) {
  try {
    // sólo grupos
    if (!m.isGroup) return true

    // si no hay stub type, no nos interesa
    if (!m.messageStubType) return true

    // DEBUG: para ver qué stub llegó (quita o comenta en producción)
    console.log('[before hook] messageStubType:', m.messageStubType)
    console.log('[before hook] messageStubParameters:', m.messageStubParameters)

    const chat = global.db?.data?.chats?.[m.chat] || {}

    // parámetros del stub (puede venir varios cuando entran/ salen varios)
    const params = Array.isArray(m.messageStubParameters) ? m.messageStubParameters : []

    // Si no hay parámetros intentamos otros campos (fallback)
    if (params.length === 0) {
      const fallback = m.key?.participant || m.participant || m.sender
      if (fallback) params.push(fallback)
    }

    if (params.length === 0) return true // nada que hacer

    // precarga de thumbnail (seguro)
    let thumbBuffer = Buffer.alloc(0)
    try {
      thumbBuffer = await fetch('https://files.catbox.moe/crdknj.jpg')
        .then(r => r.buffer())
    } catch (e) {
      thumbBuffer = Buffer.alloc(0)
    }

    // contacto citado (fake contact) usado en quoted
    const fkontak = {
      key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        remoteJid: "status@broadcast"
      },
      message: {
        contactMessage: {
          displayName: "MiyukiBot-MD 🌸",
          vcard: `
BEGIN:VCARD
VERSION:3.0
FN:MiyukiBot-MD
TEL;TYPE=CELL:0
END:VCARD`
        }
      }
    }

    // fecha/hora en zona America/Lima
    const fechaObj = new Date()
    const hora = fechaObj.toLocaleTimeString('es-PE', { timeZone: 'America/Lima' })
    const fecha = fechaObj.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Lima' })
    const dia = fechaObj.toLocaleDateString('es-PE', { weekday: 'long', timeZone: 'America/Lima' })

    const groupSize = participants?.length || 0

    // mensajes (plantillas)
    const makeWelcome = (numeroUsuario) => `
╔═══════❀༺🌸༻❀═══════╗
            *ＢＩＥＮＶＥＮＩＤＯ／Ａ*
╚═══════❀༺🌸༻❀═══════╝

✨ *Usuario:* @${numeroUsuario}
🎉 *Grupo:* ${groupMetadata?.subject || ''}
👥 *Miembros:* ${groupSize}

📅 *Fecha:* ${dia}, ${fecha}
🕒 *Hora:* ${hora}

📌 Usa _.menu_ para ver los comandos.
> 🌸 MiyukiBot-MD | By OmarGranda
`

    const makeBye = (numeroUsuario) => `
╔═══════❀༺🍁༻❀═══════╗
                        *ＡＤＩＯＳ*
╚═══════❀༺🍁༻❀═══════╝

👋 *Usuario:* @${numeroUsuario}
🌷 *Grupo:* ${groupMetadata?.subject || ''}
👥 *Miembros:* ${groupSize}

📅 *Fecha:* ${dia}, ${fecha}
🕒 *Hora:* ${hora}

🫶 Gracias por haber sido parte del grupo.
> 🌸 MiyukiBot-MD | By OmarGranda
`

    // contexto "falso" para reply enriquecido
    const fakeContext = {
      contextInfo: {
        externalAdReply: {
          title: "MiyukiBot-MD 🌸",
          body: "Bienvenid@ a la mejor experiencia ✨",
          thumbnail: thumbBuffer,
          sourceUrl: "https://whatsapp.com",
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }

    // función para obtener nombre y foto de perfil segura
    async function getUserData(jid) {
      let nombre = jid.split('@')[0]
      try {
        const n = await conn.getName(jid)
        if (n) nombre = n
      } catch (e) {
        // ignore
      }

      let ppUrl = ''
      try {
        ppUrl = await conn.profilePictureUrl(jid, 'image')
      } catch (e) {
        ppUrl = 'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745522645448.jpeg'
      }

      return { nombre, ppUrl }
    }

    // Comprueba y envía para cada parámetro -> puede haber varios participantes
    for (const parametro of params) {
      // algunos parámetros pueden venir como "1234567890" o "1234567890@s.whatsapp.net"
      const usuarioJid = parametro.includes('@') ? parametro : `${parametro}@s.whatsapp.net`
      if (!usuarioJid || usuarioJid === 'status@broadcast') continue

      const numeroUsuario = usuarioJid.split('@')[0]
      const { nombre, ppUrl } = await getUserData(usuarioJid)

      // Welcome: varios tipos de stub pueden indicar adición
      if (chat.welcome && m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
        const welcomeMessage = makeWelcome(numeroUsuario)
        try {
          await conn.sendMessage(m.chat, {
            image: { url: ppUrl },
            caption: welcomeMessage,
            mentions: [usuarioJid],
            ...fakeContext
          }, { quoted: fkontak })
        } catch (err) {
          console.error('[before hook] error sending welcome:', err)
        }
      }

      // Leave / Remove
      if (chat.welcome && (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE ||
          m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE)) {
        const byeMessage = makeBye(numeroUsuario)
        try {
          await conn.sendMessage(m.chat, {
            image: { url: ppUrl },
            caption: byeMessage,
            mentions: [usuarioJid],
            ...fakeContext
          }, { quoted: fkontak })
        } catch (err) {
          console.error('[before hook] error sending bye:', err)
        }
      }
    }

    return true
  } catch (err) {
    console.error('[before hook error]:', err)
    return true
  }
}