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
    await conn.sendMessage(m.chat, { text: `⚙️ *Calculando ping...*\n> Por favor espere unos segundos ⏳` }, { quoted: m })
    const end = new Date().getTime()
    const latency = end - start

    // ─── Datos del sistema ───
    const uptime = process.uptime()
    const hours = Math.floor(uptime / 3600)
    const minutes = Math.floor((uptime % 3600) / 60)
    const seconds = Math.floor(uptime % 60)
    const uptimeFormatted = `${hours}h ${minutes}m ${seconds}s`

    const totalRAM = os.totalmem() / 1024 / 1024
    const usedRAM = process.memoryUsage().heapUsed / 1024 / 1024
    const freeRAM = totalRAM - usedRAM
    const cpu = os.cpus()[0]
    const cpuModel = cpu.model
    const cpuSpeed = cpu.speed
    const cpuCores = os.cpus().length
    const fechaHora = moment().tz('America/Lima').format('YYYY/MM/DD, h:mm:ss A')
    const platform = os.platform().toUpperCase()
    const architecture = os.arch().toUpperCase()
    const hostname = os.hostname()
    const user = os.userInfo().username || 'Desconocido'

    // Miniatura
    const imgRes = await fetch('https://i.postimg.cc/RhBzW7B9/X-Host.jpg')
    const thumbBuffer = Buffer.from(await imgRes.arrayBuffer())

    // ─── Texto del mensaje ───
    let response = 
`╭───〔 ⚙️ *ESTADO GENERAL DE MIYUKIBOT-MD* ⚙️ 〕
├ 📡 *Ping:* ${latency} ms | ⚡ *Velocidad:* ${latensi.toFixed(2)} ms
├ 💽 *RAM usada:* ${usedRAM.toFixed(2)} MB / ${totalRAM.toFixed(0)} MB
├ 🔋 *Eficiencia:* ${(100 - (usedRAM / totalRAM * 100)).toFixed(1)}%
├ 🧠 *CPU:* ${cpuModel} (${cpuCores} núcleos @${cpuSpeed}MHz)
├ 🖥️ *Plataforma:* ${platform} ${architecture}
├ 👤 *Usuario:* ${user}
├ 🏠 *Hostname:* ${hostname}
├ ⏱️ *Uptime:* ${uptimeFormatted}
├ 🗓️ *Hora actual:* ${fechaHora}
├ 🌍 *Zona horaria:* Lima 🇵🇪
╰───────────────────────────────❖

╭───〔 💫 *INFORMACIÓN DEL BOT* 💫 〕
├ 🤖 *Nombre:* MiyukiBot-MD
├ 🧩 *Versión:* 2.5.0 Beta
├ 📦 *Repositorio:* github.com/OmarGranda/MiyukiBot-MD
├ 🧰 *Framework:* Node.js + Baileys
├ 🌐 *Infraestructura:* VPS Linux - Cloud 24/7
├ 🧠 *Módulos:* Info | Tools | Admin | Fun
├ 🪶 *Lenguaje:* JavaScript (ESM)
├ 👨‍💻 *Desarrollador:* Omar Granda
├ 🌸 *Equipo:* Comunidad X-Host Devs
├ 💬 *Soporte:* Telegram / WhatsApp / Discord
╰───────────────────────────────❖

╭───〔 📊 *SISTEMA HOST* 📊 〕
├ 🔹 *PID:* ${process.pid}
├ 🔹 *Memoria libre:* ${freeRAM.toFixed(2)} MB
├ 🔹 *Cargas del sistema:* ${os.loadavg().map(n => n.toFixed(2)).join(' / ')}
├ 🔹 *Directorio actual:* ${process.cwd()}
├ 🔹 *Node.js:* ${process.version}
╰───────────────────────────────❖

⚡ *Creado por:* OmarGranda ❤️
🪄 *"El mejor bot es el que nunca se cae."*
━━━━━━━━━━━━━━━━━━━━━━━`

    await conn.sendMessage(m.chat, {
      text: response,
      mentions: [m.sender],
      contextInfo: {
        externalAdReply: {
          title: '🌸 𝙈𝙞𝙮𝙪𝙠𝙞𝘽𝙤𝙩-𝙈𝘿',
          body: '⚙️ Estado del Servidor y Sistema',
          thumbnail: thumbBuffer,
          sourceUrl: 'https://github.com/OmarGranda/MiyukiBot-MD',
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    
  } catch (error) {
    console.error(error)
    await conn.sendMessage(m.chat, { text: '❌ Ocurrió un error al calcular el ping.' }, { quoted: m })
  }
}

handler.help = ['ping', 'estado', 'status', 'p']
handler.tags = ['info']
handler.command = ['ping', 'estado', 'status', 'p']
handler.register = true

export default handler