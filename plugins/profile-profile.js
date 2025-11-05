import { xpRange } from '../lib/levelling.js'
import moment from 'moment-timezone'
import fetch from 'node-fetch'

let handler = async (m, { conn, args }) => {
try {
let texto = await m.mentionedJid
let userId = texto?.length > 0 ? texto[0] : (m.quoted ? m.quoted.sender : m.sender)

if (!global.db.data.users[userId]) global.db.data.users[userId] = {}
const user = global.db.data.users[userId]

let name = user.name || (await conn.getName(userId).catch(() => userId.split('@')[0]))
let description = user.description || 'Sin descripción definida.'
let cumpleanos = user.birth || 'No registrado (#setbirth)'
let genero = user.genre || 'No especificado'
let pareja = user.marry
let casado = pareja ? (global.db.data.users[pareja]?.name || pareja.split('@')[0]) : 'Nadie'

let exp = user.exp || 0
let nivel = user.level || 0
let coin = user.coin || 0
let bank = user.bank || 0
let total = coin + bank

let { min, xp } = xpRange(nivel, global.multiplier)
let percent = Math.floor(((exp - min) / xp) * 100)
let barra = `[${'█'.repeat(Math.floor(percent / 10))}${'░'.repeat(10 - Math.floor(percent / 10))}]`

let sorted = Object.entries(global.db.data.users).map(([jid, v]) => ({ jid, ...v })).sort((a, b) => (b.level || 0) - (a.level || 0))
let rank = sorted.findIndex(u => u.jid === userId) + 1

let premium = user.premium || global.prems.includes(userId.split('@')[0])
let tiempoPremium = premium ? (user.premiumTime ? await formatTime(user.premiumTime - Date.now()) : 'Permanente') : 'No'

let owned = Object.entries(global.db.data.characters).filter(([_, c]) => c.user === userId)
let haremCount = owned.length
let haremValue = owned.reduce((s, [, c]) => s + (c.value || 0), 0)
let favId = user.favorite
let favLine = favId && global.db.data.characters?.[favId] ? `• Favorito: *${global.db.data.characters[favId].name}*` : '• Favorito: Ninguno'

let pp = await conn.profilePictureUrl(userId, 'image').catch(_ => 'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745522645448.jpeg')

let text = `
╭━━━〔 *Perfil de ${name}* 〕━━━⬣
│ ${description}
╰━━━━━━━━━━━━━━━━━━⬣

┍─── *Datos Personales* ────
│ 🎂 Cumpleaños: *${cumpleanos}*
│ ⚥ Género: *${genero}*
│ 💞 Pareja: *${casado}*
┕━━━━━━━━━━━━━━━━━━⬣

┍─── *Progreso y Nivel* ────
│ ⭐ Nivel: *${nivel}*
│ 📊 Experiencia: *${exp}/${xp}*
│ 🔝 Puesto Global: *#${rank}*
│ ${barra} *${percent}%*
┕━━━━━━━━━━━━━━━━━━⬣

┍─── *Economía* ────
│ 💰 Coins: *${coin.toLocaleString()}*
│ 🏦 Banco: *${bank.toLocaleString()}*
│ 💎 Total: *${total.toLocaleString()}*
│ 👣 Comandos usados: *${user.commands || 0}*
┕━━━━━━━━━━━━━━━━━━⬣

┍─── *Premium* ────
│ ⭐ Premium: ${premium ? `Sí (*${tiempoPremium}*)` : 'No'}
┕━━━━━━━━━━━━━━━━━━⬣

┍─── *Harem* ────
│ ♡ Personajes: *${haremCount}*
│ 💎 Valor total: *${haremValue.toLocaleString()}*
│ ${favLine}
┕━━━━━━━━━━━━━━━━━━⬣
`

await conn.sendMessage(m.chat, { image: { url: pp }, caption: text }, { quoted: m })
} catch (e) {
m.reply('⚠️ Error en el comando: ' + e.message)
}}

handler.help = ['profile', 'perfil']
handler.tags = ['rg']
handler.command = ['profile', 'perfil', 'perfíl']
handler.group = true
export default handler

async function formatTime(ms) {
let s = Math.floor(ms / 1000)
let m = Math.floor(s / 60)
let h = Math.floor(m / 60)
let d = Math.floor(h / 24)
s %= 60; m %= 60; h %= 24
return `${d}d ${h}h ${m}m ${s}s`
}