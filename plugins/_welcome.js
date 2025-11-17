import { WAMessageStubType } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

export async function before(m, { conn, participants, groupMetadata }) {
  try {
    if (!m.isGroup) return true
    if (!m.messageStubType) return true

    const chat = global.db?.data?.chats?.[m.chat] || {}
    const usuarioJid =
      m.messageStubParameters?.[0] ||
      m.key?.participant ||
      m.participant ||
      m.sender

    if (!usuarioJid) return true

    const numeroUsuario = usuarioJid.split('@')[0]

    let nombre = numeroUsuario
    try {
      const n = await conn.getName(usuarioJid)
      if (n) nombre = n
    } catch { }

    let ppUrl = ''
    try {
      ppUrl = await conn.profilePictureUrl(usuarioJid, 'image')
    } catch {
      ppUrl = 'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745522645448.jpeg'
    }

    const thumbBuffer = await fetch('https://files.catbox.moe/crdknj.jpg')
      .then(r => r.buffer())
      .catch(() => Buffer.alloc(0))

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

    const fechaObj = new Date()
    const hora = fechaObj.toLocaleTimeString('es-PE', { timeZone: 'America/Lima' })
    const fecha = fechaObj.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Lima' })
    const dia = fechaObj.toLocaleDateString('es-PE', { weekday: 'long', timeZone: 'America/Lima' })

    const groupSize = participants?.length || 0

    const welcomeMessage = `
╔═══════❀༺🌸༻❀═══════╗
            *ＢＩＥＮＶＥＮＩＤＯ／Ａ*
╚═══════❀༺🌸༻❀═══════╝

✨ *Usuario:* @${numeroUsuario}
🎉 *Grupo:* ${groupMetadata?.subject}
👥 *Miembros:* ${groupSize}

📅 *Fecha:* ${dia}, ${fecha}
🕒 *Hora:* ${hora}

📌 Usa _.menu_ para ver los comandos.
> 🌸 MiyukiBot-MD | By OmarGranda
`

    const byeMessage = `
╔═══════❀༺🍁༻❀═══════╗
                        *ＡＤＩＯＳ*
╚═══════❀༺🍁༻❀═══════╝

👋 *Usuario:* @${numeroUsuario}
🌷 *Grupo:* ${groupMetadata?.subject}
👥 *Miembros:* ${groupSize}

📅 *Fecha:* ${dia}, ${fecha}
🕒 *Hora:* ${hora}

🫶 Gracias por haber sido parte del grupo.
> 🌸 MiyukiBot-MD | By OmarGranda
`

    const fakeContext = {
      contextInfo: {
        mentionedJid: [usuarioJid],
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

    if (chat.welcome && m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
      await conn.sendMessage(m.chat, {
        image: { url: ppUrl },
        caption: welcomeMessage,
        mentions: [usuarioJid],
        ...fakeContext
      }, { quoted: fkontak })
    }

    if (
      chat.welcome &&
      (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE ||
       m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE)
    ) {
      await conn.sendMessage(m.chat, {
        image: { url: ppUrl },
        caption: byeMessage,
        mentions: [usuarioJid],
        ...fakeContext
      }, { quoted: fkontak })
    }

  } catch (err) {
    console.error('[before hook error]:', err)
    return true
  }
}