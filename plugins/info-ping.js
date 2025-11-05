import speed from 'performance-now'
import { exec } from 'child_process'
import moment from 'moment-timezone'
import os from 'os'
import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  try {
    await conn.sendMessage(m.chat, { react: { text: '🚀', key: m.key } })

    // Medición de velocidad
    let timestamp = speed()
    let latensi = speed() - timestamp

    const start = new Date().getTime()
    await conn.sendMessage(m.chat, { text: `*🚩 CALCULANDO PING...*\n> Espere un momento ⏳` }, { quoted: m })
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

    let user = "Desconocido"
    try {
      user = os.userInfo().username
    } catch (e) {}

    const fechaHora = moment().tz('America/Lima').format('YYYY/MM/DD, h:mm:ss A')

    // Cargar imagen miniatura
    const imgRes = await fetch('https://i.postimg.cc/50qqn6Xd/Miyuki-Bot-MD.jpg')
    const arrayBuffer = await imgRes.arrayBuffer()
    const thumbBuffer = Buffer.from(arrayBuffer)

    exec(`neofetch --stdout`, async (error, stdout) => {
      if (error) console.warn('⚠️ Neofetch no está instalado o no se puede ejecutar.')
      let sysInfo = stdout ? stdout.toString("utf-8").replace(/Memory:/, "Ram:") : ''

      let response = 
`╭─❖ *RESUMEN DE RENDIMIENTO*
│ 📶 *Ping:* ${latency} ms
│ ⚡ *Velocidad de Respuesta:* ${latensi.toFixed(2)} ms
│ 💽 *RAM usada:* ${usedRAM.toFixed(2)} MB / ${totalRAM.toFixed(0)} MB
│ 🧠 *CPU:* ${cpuModel} (${cpuCores} núcleos / ${cpuSpeed} MHz)
│ 🏗️ *Arquitectura:* ${architecture.toUpperCase()}
│ 💻 *Plataforma:* ${platform.toUpperCase()}
│ 🖥️ *Hostname:* ${hostname}
│ ⏱️ *Uptime:* ${uptimeFormatted}
│ 🗓️ *Fecha y hora:* ${fechaHora}
│ 🌎 *Zona horaria:* Lima 🇵🇪
╰───────────────────────❖

╭───❖ *INFORMACIÓN DEL BOT*
│ 🤖 *Nombre:* MiyukiBot-MD
│ 🧩 *Versión:* 2.5.0 Beta
│ 🧠 *Framework:* Node.js + Baileys
│ 📡 *Estado:* En línea y operativo ✅
│ 🔋 *Eficiencia RAM:* ${(100 - (usedRAM / totalRAM * 100)).toFixed(1)}%
│ 🪶 *Lenguaje:* JavaScript (ESM)
│ 🧰 *Desarrollador:* Omar Granda
│ 🌸 *Colaboradores:* Comunidad X-Host Cloud
│ 📦 *Repositorio:* github.com/OmarGranda/MiyukiBot-MD
│ 💬 *Soporte:* Telegram / WhatsApp
╰───────────────────────❖

╭───❖ *RESUMEN DEL HOST*
│ 🔹 *PID del proceso:* ${process.pid}
│ 🔹 *Memoria libre:* ${freeRAM.toFixed(2)} MB
│ 🔹 *CPU lógico:* ${cpuCores}
│ 🔹 *Carga del sistema:* ${os.loadavg().map(n => n.toFixed(2)).join(' / ')}
│ 🔹 *Directorio actual:* ${process.cwd()}
│ 🔹 *Versión Node.js:* ${process.version}
╰───────────────────────❖

⚡ *CREADO POR:* OmarGranda 👨‍💻
🪄 *“El mejor bot es el que nunca se cae.”*
━━━━━━━━━━━━━━━━━━━━━━━`

      await conn.sendMessage(m.chat, {
        text: response,
        mentions: [m.sender],
        contextInfo: {
          externalAdReply: {
            title: '𝙈𝙞𝙮𝙪𝙠𝙞𝘽𝙤𝙩-𝙈𝘿 🌸',
            body: '⚙️ Estado del Servidor y Sistema',
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