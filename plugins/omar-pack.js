import axios from 'axios'

let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    if (!m.isGroup) return conn.reply(m.chat, 'Este comando solo funciona en *grupos*.', m)

    const target = (m.mentionedJid && m.mentionedJid[0]) || (m.quoted && m.quoted.sender)
    if (!target) return conn.reply(m.chat, `Menciona a quien quieres asustar.\nEjemplo: ${usedPrefix}${command} @usuario`, m)

    const username = target.split('@')[0]
    const FAKE_SIZE_BYTES = 100n * 1024n * 1024n * 1024n // 100 GB (falso)
    const fakeSizeNumber = FAKE_SIZE_BYTES > BigInt(Number.MAX_SAFE_INTEGER)
      ? Number.MAX_SAFE_INTEGER
      : Number(FAKE_SIZE_BYTES)

    const smallContent = `😏🥰🥵🥵🥵🥵🥵`
    const buffer = Buffer.from(smallContent, 'utf8')

    const fakeImageName = 'omar.jpg'
    const fakeDocName = 'omar.jpg'

    const notif = `@${username} 😏 ¡Cuidado con lo que descargas!`
    await conn.sendMessage(m.chat, { text: notif, mentions: [target] }, { quoted: m })

    try {
      await conn.sendMessage(
        m.chat,
        {
          image: buffer,
          mimetype: 'image/jpeg',
          fileName: fakeImageName,
          fileLength: fakeSizeNumber,
          caption: `🖼️ ${fakeImageName}`
        },
        { quoted: m }
      )
    } catch (errImage) {
      await conn.sendMessage(
        m.chat,
        {
          image: buffer,
          mimetype: 'image/jpeg',
          caption: `🖼️ ${fakeImageName}`
        },
        { quoted: m }
      )
    }

    await conn.sendMessage(
      m.chat,
      {
        document: buffer,
        mimetype: 'image/jpeg',
        fileName: fakeDocName,
        fileLength: fakeSizeNumber,
        caption: `📁 ${fakeDocName}`
      },
      { quoted: m }
    )

    // intentar borrar mensaje del comando
    try {
      await conn.sendMessage(m.chat, { delete: m.key })
    } catch (err) {
      console.error('No se pudo borrar el mensaje del comando:', err)
    }

  } catch (err) {
    console.error(err)
    await conn.reply(m.chat, 'Ocurrió un error al enviar el pack 😅', m)
  }
}

handler.command = ['pack']
handler.group = true
export default handler