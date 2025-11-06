import axios from 'axios'

const handler = async (m, { conn, text, usedPrefix }) => {
if (!text) return conn.reply(m.chat, `✨ *Uso correcto:*\n${usedPrefix}tiktok <link / nombre>\n\nEjemplos:\n${usedPrefix}tiktok https://vm.tiktok.com/xxxxxx\n${usedPrefix}tiktok anime aesthetic`, m)

const isUrl = /(tiktok\.com)/i.test(text)

try {
await m.react('⏳')

// ━━━━━━━━━━━━━━━━━━━━
// 🎥 DESCARGA DIRECTA
// ━━━━━━━━━━━━━━━━━━━━
if (isUrl) {

const res = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(text)}&hd=1`)
const data = res.data?.data
if (!data) return conn.reply(m.chat, '❌ No se pudo obtener información del video.', m)

const { title, duration, author, create_time, type, images, play, music, music_info, hdplay } = data

const caption = `🎀 *TIKTOK DESCARGADO*

📌 *Título:* ${title || 'Sin título'}
👤 *Autor:* ${author?.nickname || author?.unique_id}
🕒 *Duración:* ${duration || '?'}s
🎶 *Audio:* ${music_info?.title || 'Original'}
📅 *Fecha:* ${new Date(create_time * 1000).toLocaleDateString()}
`


// ----- MENÚ DE BOTONES -----
await conn.sendMessage(m.chat, {
text: caption,
buttons: [
{ buttonId: `ttvideo ${play}`, buttonText: { displayText: '🎬 Descargar Video' }, type: 1 },
{ buttonId: `tthd ${hdplay || play}`, buttonText: { displayText: '🟣 HD Max' }, type: 1 },
{ buttonId: `ttmp3 ${music}`, buttonText: { displayText: '🎧 Descargar MP3' }, type: 1 },
...(type === 'image' ? [{ buttonId: `ttimages ${JSON.stringify(images)}`, buttonText: { displayText: '🖼 Álbum de Fotos' }, type: 1 }] : []),
],
footer: `💗 Descargador Avanzado`
}, { quoted: m })

await m.react('✅')
return
}

// ━━━━━━━━━━━━━━━━━━━━
// 🔍 BÚSQUEDA
// ━━━━━━━━━━━━━━━━━━━━
const res = await axios({
method: 'POST',
url: 'https://tikwm.com/api/feed/search',
headers: {
'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
'Cookie': 'current_language=en',
'User-Agent': 'Mozilla/5.0'
},
data: { keywords: text, count: 10, cursor: 0, HD: 1 }
})

const results = res.data?.data?.videos || []
if (!results.length) return conn.reply(m.chat, '😿 No encontré resultados, intenta otro término.', m)

let list = `🌸 *Resultados para:* _${text}_\n\n`
results.slice(0, 10).forEach((v, i) => {
list += `*${i+1}.* 🎬 ${v.title?.slice(0,60) || 'Sin título'}\n👤 ${v.author?.nickname}\n🎧 Escribe: ${usedPrefix}tiktok ${v.play}\n\n`
})

await conn.reply(m.chat, list, m)
await m.react('✨')

} catch (e) {
await m.react('❌')
conn.reply(m.chat, `⚠ Error inesperado.\nReporta usando: *${usedPrefix}report*\n\n${e}`, m)
}}

handler.command = ['tiktok', 'tt', 'tiktoks', 'tts']
handler.group = true
export default handler