import db from '../lib/database.js'
import fs from 'fs'
import PhoneNumber from 'awesome-phonenumber'
import { createHash } from 'crypto'
import fetch from 'node-fetch'

const REG_NAME_AGE = /\|?(.*)([.|] *?)([0-9]*)$/i


let handler = async (m, { conn, text, usedPrefix, command }) => {

  const who = m.mentionedJid?.[0] || (m.fromMe ? conn.user.jid : m.sender)
  const pp = await conn.profilePictureUrl(who, 'image')
    .catch(() => 'https://files.catbox.moe/xr2m6u.jpg')
  const user = global.db.data.users[m.sender]
  const displayName = conn.getName(m.sender)

  
  let bio
  try {
    const info = await conn.fetchStatus(who)
    bio = info?.status?.trim() || "🚫 Sin biografía disponible"
  } catch {
    bio = "Sin biografía disponible"
  }


  if (user.registered) {
    const texto = `
*🗣️ Ya cuentas con un registro activo...*
  
¿Quieres registrarte nuevamente? 
🫵 Usa *#unreg* para borrar tu registro y comenzar otra vez.`
    
    const botones = [
      { buttonId: `${usedPrefix}unreg`, buttonText: { displayText: '🚯 Eliminar Registro' }, type: 1 },
    ]

    return conn.sendMessage(m.chat, {
      image: { url: 'https://qu.ax/mCcQs.jpg' },
      caption: texto,
      mentions: [m.sender],
      footer: dev,
      buttons: botones,
      headerType: 4,
      contextInfo: {
        mentionedJid: [m.sender],
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: channelRD.id,
          serverMessageId: 100,
          newsletterName: channelRD.name
        }
      }
    }, { quoted: fkontak })
  }

  if (!REG_NAME_AGE.test(text)) {
    const mensaje = `
❌ Comando incorrecto
Usalo así: ${usedPrefix + command} nombre.edad
Ejemplo: ${usedPrefix + command} ${displayName}.18
`
    const botones = [
      { buttonId: `${usedPrefix}reg ${displayName}.18`, buttonText: { displayText: '🖍️ Auto Verificación' }, type: 1 },
    ]

    return conn.sendMessage(m.chat, {
      image: { url: 'https://qu.ax/iNweS.jpg' },
      caption: mensaje,
      mentions: [m.sender],
      footer: dev,
      buttons: botones,
      headerType: 4,
      contextInfo: {
        mentionedJid: [m.sender],
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: channelRD.id,
          serverMessageId: 100,
          newsletterName: channelRD.name
        }
      }
    }, { quoted: fkontak })
  }

  const [_, name, splitter, ageRaw] = text.match(REG_NAME_AGE)
  if (!name) return m.reply(`❌ *El nombre no puede estar vacío*`)
  if (!ageRaw) return m.reply(`❌ *La edad no puede estar vacía*`)
  if (name.length >= 100) return m.reply(`❌ *El nombre es demasiado largo...*`)

  const age = parseInt(ageRaw)

  user.name = `${name} ✓`
  user.age = age
  user.regTime = +new Date()
  user.registered = true
  user.coin = (user.coin || 0) + 40
  user.exp = (user.exp || 0) + 300
  user.joincount = (user.joincount || 0) + 20

  const userHash = createHash('md5').update(m.sender).digest('hex').slice(0, 20)

 
  const now = new Date()
  const fecha = now.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Lima' })
  const hora = now.toLocaleTimeString('es-PE', { timeZone: 'America/Lima' })
  const dia = now.toLocaleDateString('es-PE', { weekday: 'long', timeZone: 'America/Lima' })

  const regMessage = `≡══════════════════≡
 彡 𝐑𝐄𝐆𝐈𝐒𝐓𝐑𝐎 • 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐎 彡
≡══════════════════≡

🔰 ACCESO AL SISTEMA AUTORIZADO 🔰

👾 *NICK:* ${displayName.toUpperCase()}
🆔 *ID:* ${name}
📞 *NÚMERO:* ${PhoneNumber('+' + who.replace('@s.whatsapp.net', '')).getNumber('international')}
🎯 *EDAD:* ${age} años
💠 *BIO:* ${bio}
─────────────────────────
📆 *FECHA:* ${fecha}
🕐 *HORA:* ${hora}
🌌 *DÍA:* ${dia}
─────────────────────────
✅ Conexión establecida...
💾 Datos cifrados correctamente.
⚡ Bienvenido al núcleo, ${displayName}.
🧠 *Sistema operativo:* MiyukiBot-MD v2.5
─────────────────────────`

  await m.react?.('📩')

  await conn.sendMessage(m.chat, {
    image: { url: pp },
    caption: regMessage,
    contextInfo: {
      mentionedJid: [m.sender],
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: channelRD.id,
        serverMessageId: 100,
        newsletterName: channelRD.name
      },
      externalAdReply: {
        title: '𝙈𝙞𝙮𝙪𝙠𝙞𝘽𝙤𝙩-𝙈𝘿',
        body: 'Verificando registro...',
        mediaType: 1,
        thumbnailUrl: 'https://qu.ax/NtBCa.jpg',
        mediaUrl: redes,
        sourceUrl: redes,
        renderLargerThumbnail: false
      }
    }
  }, { quoted: fkontak })
}

handler.help = ['reg']
handler.tags = ['rg']
handler.command = ['verify', 'verificar', 'reg', 'register', 'registrar']

export default handler