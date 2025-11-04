import speed from 'performance-now'
import { exec } from 'child_process'
import moment from 'moment-timezone'
import os from 'os'
import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  try {
    await conn.sendMessage(m.chat, { react: { text: '🚀', key: m.key } })

    let timestamp = speed()
    let latensi = speed() - timestamp

    const start = new Date().getTime()
    await conn.sendMessage(m.chat, { text: `*🛰️ CALCULANDO PING...*\n> Espere un momento ⏳` }, { quoted: m })
    const end = new Date().getTime()
    const latency = end - start

    // Datos del sistema
    const uptime = process.uptime()
    const hours = Math.floor(uptime / 3600)
    const minutes = Math.floor((uptime % 3600) / 60)
    const secondsUp = Math.floor(uptime % 60)
    const uptimeFormatted = `${hours}h ${minutes}m ${secondsUp}s`

    const totalRAM = os.totalmem() / 1024 / 1024
    const usedRAM = process.memoryUsage().heapUsed / 1024 / 1024
    const freeRAM = totalRAM - usedRAM

    const cpuModel = os.cpus()[0].model
    const cpuCores = os.cpus().length
    const cpuSpeed = os.cpus()[0].speed
    const platform = os.platform()
    const architecture = os.arch()
    const hostname = os.hostname()
    const user = os.userInfo().username
    const fechaHora = moment().tz('America/Lima').format('YYYY/MM/DD, h:mm:ss A')

    // Cálculo CPU promedio
    const cpuLoad = os.loadavg()[0] / cpuCores * 100
    const cpuUsage = Math.min(cpuLoad, 100)

    // Barras visuales
    const makeBar = (value, max = 100, size = 10) => {
      const filled = Math.round((value / max) * size)
      const empty = size - filled
      return '▰'.repeat(filled) + '▱'.repeat(empty)
    }

    const ramBar = makeBar((usedRAM / totalRAM) * 100)
    const cpuBar = makeBar(cpuUsage)

    const thumbBuffer = Buffer.from(await (await fetch('https://i.postimg.cc/RhBzW7B9/X-Host.jpg')).arrayBuffer())

    exec(`neofetch --stdout`, async () => {
      let response = 
`╭───〔 ⚙️ *PANEL DE RENDIMIENTO* ⚙️ 〕
│ 📶 *Ping:* ${latency} ms
│ ⚡ *Velocidad:* ${latensi.toFixed(2)} ms
│ 🗓️ *Fecha:* ${fechaHora}
│ 🌎 *Zona Horaria:* Lima 🇵🇪
╰───────────────────────❖

╭───〔 💻 *ESTADO DEL SISTEMA* 💻 〕
│ 💽 *RAM usada:* ${usedRAM.toFixed(2)} / ${totalRAM.toFixed(0)} MB
│ 🧠 *Uso CPU:* ${cpuUsage.toFixed(2)}%
│ 
│ 💾 RAM: ${ramBar}
│ 🔋 CPU: ${cpuBar}
│ 
│ 🧩 *CPU:* ${cpuModel}
│ ⚙️ *Cores:* ${cpuCores}
│ 🏗️ *Velocidad:* ${cpuSpeed} MHz
│ 💻 *Plataforma:* ${platform.toUpperCase()}
│ 🧱 *Arquitectura:* ${architecture.toUpperCase()}
│ 🖥️ *Hostname:* ${hostname}
│ 👤 *Usuario:* ${user}
│ ⏱️ *Uptime:* ${uptimeFormatted}
╰───────────────────────❖

╭───〔 🤖 *INFORMACIÓN DEL BOT* 🤖 〕
│ 🌸 *Nombre:* MiyukiBot-MD
│ 🪄 *Versión:* 2.5.0 Beta
│ 💬 *Lenguaje:* JavaScript (Node.js)
│ 🧠 *Framework:* Baileys MultiDevice
│ 📡 *Estado:* Online ✅
│ 🧰 *Desarrollador:* Omar Granda
│ 🧩 *Módulos activos:* Info, Tools, Admin, Diversión
│ ☁️ *Infraestructura:* VPS Linux - 24/7
│ 🔗 *Repositorio:* github.com/OmarGranda/MiyukiBot-MD
│ 🌐 *Soporte:* Telegram / WhatsApp / Discord
╰───────────────────────❖

🪶 *Frase del Día:* “El mejor bot no es el más rápido, sino el que nunca se detiene.” 💫
━━━━━━━━━━━━━━━━━━━━━━━
🌸 *MiyukiBot-MD* — Tecnología japonesa, precisión peruana 🇵🇪
━━━━━━━━━━━━━━━━━━━━━━━`

      await conn.sendMessage(m.chat, {
        text: response,
        mentions: [m.sender],
        contextInfo: {
          externalAdReply: {
            title: '🌸 𝙈𝙞𝙮𝙪𝙠𝙞𝘽𝙤𝙩-𝙈𝘿',
            body: '⚙️ Dashboard del Sistema y Estado',
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

handler.help = ['ping', 'status', 'estado', 'p']
handler.tags = ['info']
handler.command = ['ping', 'status', 'estado', 'p']
handler.register = true

export default handler