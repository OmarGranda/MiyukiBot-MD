import axios from 'axios'

const handler = async (m, { conn, text, usedPrefix }) => {
if (!text) return conn.reply(m.chat, `🎀 *Uso correcto:*\n${usedPrefix}tiktok <link / búsqueda>\n\nEjemplos:\n${usedPrefix}tiktok https://vm.tiktok.com/xxxxxx\n${usedPrefix}tiktok anime aesthetic`, m)

const isUrl = /(?:https:?\/{2})?(?:www\.|vm\.|vt\.|t\.)?tiktok\.com\/([^\s&]+)/gi.test(text)

try {
await m.react('⏳')

// ★ DESCARGA POR LINK ★
if (isUrl) {
const res = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(text)}&hd=1`)
const data = res.data?.data
if (!data?.play) return conn.reply(m.chat, '❌ No se encontró contenido descargable.', m)

const { 
title, duration, author, created_at, type, images, music, play, music_info,
digg_count, comment_count, share_count, play_count
} = data

const caption = createCaption(title, author, duration, created_at, music_info, digg_count, comment_count, share_count, play_count)

if (type === 'image' && Array.isArray(images)) {
const medias = images.map(url => ({ type: 'image', data: { url }, caption }))
await conn.sendSylphy(m.chat, medias, { quoted: m })
} else {
await conn.sendMessage(m.chat, { video: { url: play }, caption }, { quoted: m })
}

// ★ ENVÍA AUDIO SI EXISTE ★
if (music) {
await conn.sendMessage(m.chat, {
audio: { url: music },
mimetype: 'audio/mp4',
fileName: (music_info?.title || 'audio_tiktok') + '.mp3'
}, { quoted: m })
}

} else {

// ★ BÚSQUEDA POR NOMBRE ★
const res = await axios({
method: 'POST',
url: 'https://tikwm.com/api/feed/search',
headers: {
'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
'Cookie': 'current_language=en',
'User-Agent': 'Mozilla/5.0'
},
data: { keywords: text, count: 20, cursor: 0, HD: 1 }
})

const results = res.data?.data?.videos?.filter(v => v.play) || []
if (!results.length) return conn.reply(m.chat, '😿 No encontré resultados para ese término.', m)

const medias = results.slice(0, 10).map(v => ({
type: 'video',
data: { url: v.play },
caption: createSearchCaption(v)
}))

await conn.sendSylphy(m.chat, medias, { quoted: m })
}

await m.react('✅')

} catch (e) {
await m.react('❌')
conn.reply(m.chat, `⚠ Error inesperado.\nReporta con *${usedPrefix}report*\n\n${e.message}`, m)
}}

// ★ DISEÑO NUEVO ★
function createCaption(title, author, duration, created_at, music_info, likes, comments, shares, views) {
return `💗 *TIKTOK DESCARGADO CON ÉXITO* 💗

🎬 *Título:* ${title || 'Sin título'}
👤 *Autor:* ${author?.nickname || author?.unique_id}
🔗 *Usuario:* @${author?.unique_id || 'desconocido'}
⏱ *Duración:* ${duration || '?'}s
🎶 *Audio:* ${music_info?.title || 'Original Sound'}
📅 *Fecha:* ${created_at || 'Desconocida'}

📊 *Estadísticas:*
❤️ Likes: *${likes || 0}*
💬 Comentarios: *${comments || 0}*
🔄 Compartidos: *${shares || 0}*
👁 Vistas: *${views || 0}*

✨ *Disfruta tu descarga!* ✨`
}

function createSearchCaption(data) {
return `🎥 *${data.title || 'Sin título'}*
👤 ${data.author?.nickname || 'Desconocido'} @${data.author?.unique_id || ''}
⏱ ${data.duration || '?'}s — 🎶 ${data.music?.title || 'Original'}`
}

handler.help = ['tiktok', 'tt']
handler.tags = ['downloader']
handler.command = ['tiktok', 'tt', 'tiktoks', 'tts']
handler.group = true

export default handler