import speed from 'performance-now'
import { exec } from 'child_process'
import moment from 'moment-timezone'
import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  try {
    await conn.sendMessage(m.chat, { react: { text: '🚀', key: m.key } })

    let timestamp = speed()
    let latensi = speed() - timestamp

    const start = new Date().getTime()
    await conn.sendMessage(m.chat, { text: `*🚩 CALCULANDO PING...*
> Por favor espere un momento ⏳` }, { quoted: m })
    const end = new Date().getTime()
    const latency = end - start

    const uptime = process.uptime()
    const hours = Math.floor(uptime / 3600)
    const minutes = Math.floor((uptime % 3600) / 60)
    const secondsUp = Math.floor(uptime % 60)
    const uptimeFormatted = `${hours}h ${minutes}m ${secondsUp}s`

    const usedRAM = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)
    const fechaHora = moment().tz('America/Lima').format('YYYY/MM/DD, h:mm A')

    const thumbBuffer = Buffer.from(await (await fetch('https://i.postimg.cc/RhBzW7B9/X-Host.jpg')).arrayBuffer())

    exec(`neofetch --stdout`, async (error, stdout) => {
      let sysInfo = stdout.toString("utf-8").replace(/Memory:/, "Ram:")

      let response = 
`╭───〔 ⚙️ *Estado del Servidor* ⚙️ 〕
│ 📡 *Ping:* ${latency} ms
│ ⚡ *Velocidad de Respuesta:* ${latency.toFixed(2)} ms
│ 💾 *Memoria usada:* ${usedRAM} MB
│ ⏱️ *Uptime del Bot:* ${uptimeFormatted}
│ 🗓️ *Fecha actual:* ${fechaHora}
│ 🌍 *Zona Horaria:* Lima 🇵🇪
│ 🧠 *Sistema:* Linux / Node.js
│ 🔋 *Eficiencia:* ${(100 - (usedRAM / 512 * 100)).toFixed(1)}%
╰───────────────────────❖

*💫 Estado:* En línea y operativo ✅
*📡 Latencia:* ${latensi.toFixed(4)} ms
*💻 Plataforma:* 24/7 Cloud Hosting ☁️
*🧩 Módulos activos:* Info, Utilidades, Administración

━━━━━━━━━━━━━━━━━━━━━━━
🌸 *MiyukiBot-MD* by OmarGranda  
📍 *Repositorio:* github.com/OmarGranda  
🔧 *Versión:* 2.5.0 Beta
━━━━━━━━━━━━━━━━━━━━━━━`

      await conn.sendMessage(m.chat, {
        text: response,
        mentions: [m.sender],
        contextInfo: {
          externalAdReply: {
            title: '🌸 𝙈𝙞𝙮𝙪𝙠𝙞𝘽𝙤𝙩-𝙈𝘿',
            body: '⚡ Sistema Operativo Estable',
            thumbnail: thumbBuffer,
            sourceUrl: 'https://github.com/OmarGranda/MiyukiBot-MD',
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m })

      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    })
  } catch (error) {
    console.error(error)
    await conn.sendMessage(m.chat, { text: '❌ Ocurrió un error al calcular el ping.' }, { quoted: m })
  }
}

handler.help = ['ping', 'p']
handler.tags = ['info']
handler.command = ['ping', 'p']
handler.register = true

export default handler