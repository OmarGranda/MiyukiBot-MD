import speed from 'performance-now'
import { exec } from 'child_process'
import moment from 'moment-timezone'
import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  // 🔹 Reacción inicial
  await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } })

  let timestamp = speed()
  let latensi = speed() - timestamp

  const start = new Date().getTime()
  await conn.sendMessage(m.chat, { text: `🕒 *Midiendo latencia...*` }, { quoted: m })
  const end = new Date().getTime()
  const latency = end - start

  const uptime = process.uptime()
  const hours = Math.floor(uptime / 3600)
  const minutes = Math.floor((uptime % 3600) / 60)
  const secondsUp = Math.floor(uptime % 60)
  const uptimeFormatted = `${hours}h ${minutes}m ${secondsUp}s`

  const usedRAM = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)
  const fechaHora = moment().tz('America/Lima').format('YYYY/MM/DD, h:mm A')

  // 🔹 Coloca tu imagen aquí 👇
  const imgUrl = '' // Ejemplo: 'https://teuservidor.com/imagen.jpg'

  const thumbBuffer = imgUrl
    ? Buffer.from(await (await fetch(imgUrl)).arrayBuffer())
    : Buffer.from(await (await fetch('https://d.uguu.se/VpyXZrTP.webp')).arrayBuffer())

  exec(`neofetch --stdout`, async (error, stdout) => {
    let sysInfo = stdout.toString("utf-8").replace(/Memory:/, "Ram:")

    let response = 
`╭─❖ ⚙️ *Estado del Bot*
│ 📶 *Ping:* ${latency} ms
│ ⚡ *Latencia:* ${latensi.toFixed(4)} ms
│ 💽 *RAM usada:* ${usedRAM} MB
│ ⏱️ *Uptime:* ${uptimeFormatted}
│ 🗓️ *Fecha / Hora:* ${fechaHora}
╰─❖ *MiyukiBot-MD 🌸*

\`\`\`${sysInfo.trim()}\`\`\``

    // 🔹 Enviar imagen + texto
    await conn.sendMessage(m.chat, {
      image: thumbBuffer,
      caption: response,
      mentions: [m.sender],
      contextInfo: {
        externalAdReply: {
          title: 'MiyukiBot-MD 🌸',
          body: 'Estado del sistema',
          thumbnail: thumbBuffer,
          sourceUrl: 'https://github.com/', // 🔹 Puedes poner tus redes aquí
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

    // 🔹 Reacción final
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  })
}

handler.help = ['ping', 'p']
handler.tags = ['info']
handler.command = ['ping', 'p']
handler.register = true

export default handler