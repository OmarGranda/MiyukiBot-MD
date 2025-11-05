import { WAMessageStubType } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

export async function before(m, { conn, participants, groupMetadata }) {
  try {
    if (!m.messageStubType || !m.isGroup) return true

    const chat = global.db?.data?.chats?.[m.chat] ?? {}

    // ─── Obtener datos del usuario ───
    const usuarioJid = (Array.isArray(m.messageStubParameters) && m.messageStubParameters[0])
      || m.key?.participant
      || m.participant
      || m.sender
    if (!usuarioJid) return true

    const numeroUsuario = usuarioJid.split('@')[0]
    let nombre = numeroUsuario
    try {
      const n = await conn.getName?.(usuarioJid)
      if (n && typeof n === 'string' && n.trim()) nombre = n
    } catch { }

    // ─── Foto de perfil con fallback ───
    let ppUrl = ''
    try {
      ppUrl = await conn.profilePictureUrl?.(usuarioJid, 'image')
    } catch {
      ppUrl = 'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745522645448.jpeg'
    }

    // ─── Miniatura para el mensaje ───
    const thumbBuffer = await fetch('https://files.catbox.moe/crdknj.jpg').then(r => r.buffer()).catch(() => Buffer.alloc(0))
    const fkontak = {
      key: { participants: "0@s.whatsapp.net", remoteJid: "status@broadcast", fromMe: false, id: "Halo" },
      message: { locationMessage: { name: "MiyukiBot-MD 🌸", jpegThumbnail: thumbBuffer } },
      participant: "0@s.whatsapp.net"
    }

    // ─── Fecha y hora ───
    const fechaObj = new Date()
    const hora = fechaObj.toLocaleTimeString('es-PE', { timeZone: 'America/Lima' })
    const fecha = fechaObj.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Lima' })
    const dia = fechaObj.toLocaleDateString('es-PE', { weekday: 'long', timeZone: 'America/Lima' })
    const groupSize = (participants?.length ?? 0) + (
      (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) ? 1 :
      ((m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE || m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE) ? -1 : 0)
    )

    // ─── Frases motivadoras y estados ───
    const frasesMotivadoras = [
      "🌟 ¡Hoy es un gran día para brillar!",
      "🔥 Recuerda: cada paso te acerca a tu meta.",
      "💫 Mantén la energía alta y la vibra positiva.",
      "🌈 ¡Sé tú mismo y disfruta del momento!",
      "⚡ El éxito comienza con una sonrisa."
    ]
    const estadosUsuario = ["🟢 Activo", "💤 Durmiendo", "💻 En modo gamer", "🎧 Escuchando música", "🌙 Meditando", "🍕 Comiendo pizza"]
    const nivelesEnergia = ["💥 Máxima", "⚡ Alta", "✨ Media", "🪫 Baja"]

    const fraseRandom = frasesMotivadoras[Math.floor(Math.random() * frasesMotivadoras.length)]
    const estadoRandom = estadosUsuario[Math.floor(Math.random() * estadosUsuario.length)]
    const energiaRandom = nivelesEnergia[Math.floor(Math.random() * nivelesEnergia.length)]

    // ─── Mensaje de bienvenida ───
    const welcomeMessage = `
╔═══════❀༺🌸༻❀═══════╗
            *ＢＩＥＮＶＥＮＩＤＯ／Ａ*
╚═══════❀༺🌸༻❀═══════╝

✨ *Usuario:* @${numeroUsuario}
🎉 *Grupo:* ${groupMetadata?.subject ?? 'Grupo'}
👥 *Miembros:* ${groupSize}

📅 *Fecha:* ${dia}, ${fecha}
🕒 *Hora:* ${hora}

⚙️ *Estado:* ${estadoRandom}
🔋 *Energía:* ${energiaRandom}

${fraseRandom}

📌 Usa _.menu_ para ver los comandos.
> 🌸 𝘔𝘪𝘺𝘶𝘬𝘪𝘉𝘰𝘵-𝘔𝘋 | 𝘉𝘺 𝘖𝘮𝘢𝘳𝘎𝘳𝘢𝘯𝘥𝘢 🌸
`

    // ─── Mensaje de despedida ───
    const byeMessage = `
╔═══════❀༺🍁༻❀═══════╗
                        *ＡＤＩＯＳ*
╚═══════❀༺🍁༻❀═══════╝

👋 *Usuario:* @${numeroUsuario}
🌷 *Grupo:* ${groupMetadata?.subject ?? 'Grupo'}
👥 *Miembros restantes:* ${groupSize}

📅 *Fecha:* ${dia}, ${fecha}
🕒 *Hora:* ${hora}

🫶 Gracias por haber sido parte de esta comunidad.
💖 ¡Esperamos verte pronto de nuevo!

> 🌸 𝘔𝘪𝘺𝘶𝘬𝘪𝘉𝘰𝘵-𝘔𝘋 | 𝘉𝘺 𝘖𝘮𝘢𝘳𝘎𝘳𝘢𝘯𝘥𝘢 🌸
`

    // ─── Contexto visual ───
    const fakeContext = {
      contextInfo: {
        mentionedJid: [usuarioJid],
        externalAdReply: {
          title: "MiyukiBot-MD 🌸",
          body: "Bienvenid@ a la mejor experiencia ✨",
          thumbnailUrl: "https://qu.ax/gauVK.jpg",
          sourceUrl: "https://whatsapp.com",
          mediaType: 1,
          renderLargerThumbnail: false
        }
      }
    }

    // ─── Envío de mensajes ───
    if (chat?.welcome && m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
      try {
        await conn.sendMessage(m.chat, {
          image: { url: ppUrl },
          caption: welcomeMessage,
          mentions: [usuarioJid],
          ...fakeContext
        }, { quoted: fkontak })
      } catch {
        await conn.sendMessage(m.chat, {
          text: welcomeMessage,
          mentions: [usuarioJid],
          ...fakeContext
        }, { quoted: fkontak })
      }
    }

    if (chat?.welcome && (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE ||
      m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE)) {
      try {
        await conn.sendMessage(m.chat, {
          image: { url: ppUrl },
          caption: byeMessage,
          mentions: [usuarioJid],
          ...fakeContext
        }, { quoted: fkontak })
      } catch {
        await conn.sendMessage(m.chat, {
          text: byeMessage,
          mentions: [usuarioJid],
          ...fakeContext
        }, { quoted: fkontak })
      }
    }
  } catch (err) {
    console.error('[before hook error]:', err)
    return true
  }
}