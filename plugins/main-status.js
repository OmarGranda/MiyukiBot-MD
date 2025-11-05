import { cpus, totalmem, freemem, platform, hostname } from 'os'
import { sizeFormatter } from 'human-readable'

let format = sizeFormatter({ std: 'JEDEC', decimalPlaces: 2, keepTrailingZeroes: false, render: (literal, symbol) => `${literal} ${symbol}B` })

let handler = async (m, { conn }) => {

let imagenURL = 'https://qu.ax/pyXPR.jpg'

await conn.sendMessage(m.chat, { react: { text: '⚡', key: m.key }})

let stats = global.db?.data?.stats || {}
let users = global.db?.data?.users || {}
let chats = global.db?.data?.chats || {}

let totalStats = Object.values(stats).reduce((total, stat) => total + (stat.total || 0), 0)
let totalUsers = Object.keys(users).length
let totalChats = Object.keys(chats).length
let totalPlugins = Object.values(global.plugins).filter((v) => v.help && v.tags).length
let totalBots = global.conns.filter(conn => conn?.user && conn?.ws?.socket && conn.ws.socket.readyState !== 3).length

let cpu = cpus().map(cpu => cpu.model)[0]
let usedRam = format(totalmem() - freemem())

let system = `*「⚡ Estado del Sistema ⚡」*

╭━━━━━━━━━━━━━━━╮
┃ *📊 Estadísticas Globales*
┃ ✦ *Comandos Ejec.* » ${toNum(totalStats)}
┃ ✦ *Usuarios* » ${totalUsers.toLocaleString()}
┃ ✦ *Chats/Grupos* » ${totalChats.toLocaleString()}
┃ ✦ *Plugins Activos* » ${totalPlugins}
┃ ✦ *Bots Conectados* » ${totalBots}
╰━━━━━━━━━━━━━━━╯

╭━━━━━━━━━━━━━━━╮
┃ *🖥 Estado del Servidor*
┃ ✦ *Sistema* » ${platform()}
┃ ✦ *CPU* » ${cpu}
┃ ✦ *Núcleos* » ${cpus().length}
┃ ✦ *RAM Total* » ${format(totalmem())}
┃ ✦ *RAM Usada* » ${usedRam}
┃ ✦ *Arquitectura* » ${process.arch}
┃ ✦ *Host Name* » ${hostname().slice(0, 10)}...
╰━━━━━━━━━━━━━━━╯

╭━━━━━━━━━━━━━━━╮
┃ *🧠 Uso de Memoria NodeJS*
┃ ✦ *RAM Utilizada* » ${format(process.memoryUsage().rss)}
┃ ✦ *Heap Reservado* » ${format(process.memoryUsage().heapTotal)}
┃ ✦ *Heap Usado* » ${format(process.memoryUsage().heapUsed)}
┃ ✦ *Módulos Nativos* » ${format(process.memoryUsage().external)}
┃ ✦ *Buffers* » ${format(process.memoryUsage().arrayBuffers)}
╰━━━━━━━━━━━━━━━╯

✨ *Bot funcionando correctamente...*
`

await conn.sendMessage(m.chat, {
image: { url: imagenURL },
caption: system
}, { quoted: m })

}

handler.help = ['estado', 'status']
handler.tags = ['info']
handler.command = ['estado', 'status']
export default handler

function toNum(number) {
number = Number(number)
return number >= 1e6 ? (number / 1e6).toFixed(1) + 'M'
     : number >= 1e3 ? (number / 1e3).toFixed(1) + 'k'
     : number.toString()
}