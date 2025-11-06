import axios from 'axios'

const handler = async (m, { conn, text, usedPrefix }) => {
if (!text) return conn.reply(m.chat, `✦ *Uso correcto:* ${usedPrefix}tiktok <link / búsqueda>\n\nEjemplo:\n${usedPrefix}tiktok https://vm.tiktok.com/xxxxxx\n${usedPrefix}tiktok anime aesthetic`, m)

const isUrl = /(?:https:?\/{2})?(?:www\.|vm\.|vt\.|t\.)?tiktok\.com\/([^\s&]+)/gi.test(text)

try {
await m.react('⏳')

// *** DESCARGA DIRECTA POR URL ***
if (isUrl) {
const res = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(text)}&hd=1`)
const data = res.data?.data
if (!data?.play) return conn.reply(m.chat, '✘ No se encontró contenido descargable en el enlace.', m)

const { title, duration, author, created_at, type, images, music, play, music_info } = data
const caption = createCaption(title, author, duration, created_at, music_info)

if (type === 'image' && Array.isArray(images)) {
const medias = images.map(url => ({ type: 'image', data: { url }, caption }))
await conn.sendSylphy(m.chat, medias, { quoted: m })
} else {
await conn.sendMessage(m.chat, { video: { url: play }, caption }, { quoted: m })
}

if (music) {
await conn.sendMessage(m.chat, {
audio: { url: music },
mimetype: 'audio/mp4',
fileName: (music_info?.title || 'tiktok_audio') + '.mp4'
}, { quoted: m })
}

} else {

// *** BÚSQUEDA ***
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
if (!results.length) return conn.reply(m.chat, '✘ No se encontraron resultados con ese nombre.', m)

const medias = results.slice(0, 10).map(v => ({
type: 'video',
data: { url: v.play },
caption: createSearchCaption(v)
}))

await conn.sendSylphy(m.chat, medias, { quoted: m })
}

await m.react('✅')

} catch (e) {
console.log(e)
await m.react('❌')
conn.reply(m.chat, `⚠ Ocurrió un error inesperado.\nReporta usando *${usedPrefix}report*\n\n${e.message}`, m)
}}

// *** NUEVO DISEÑO DE CAPTION ***
function createCaption(title, author, duration, created_at, music_info) {
return `╭─❖『 *DESCARGA TIKTOK* 』❖
│ ✦ *Título:* ${title || 'Sin título'}
│ ✦ *Autor:* ${author?.nickname || author?.unique_id}
│ ✦ *Duración:* ${duration}s
│ ✦ *Fecha:* ${created_at || 'Desconocida'}
│ ✦ *Audio:* ${music_info?.title || `${author?.nickname} - original sound`}
╰───────────────✦`
}

// *** NUEVO CAPTION PARA RESULTADOS DE BÚSQUEDA ***
function createSearchCaption(data) {
return `• *${data.title || 'Sin título'}*
👤 ${data.author?.nickname || 'Desconocido'} @${data.author?.unique_id || ''}
⏱ Duración: ${data.duration || '?'}s
🎶 Audio: ${data.music?.title || `${data.author?.nickname} - original sound`}`
}

handler.help = ['tiktok', 'tt']
handler.tags = ['downloader']
handler.command = ['tiktok', 'tt', 'tiktoks', 'tts']
handler.group = true

export default handler