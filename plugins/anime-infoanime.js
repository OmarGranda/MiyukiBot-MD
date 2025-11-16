
import fetch from 'node-fetch'

var handler = async (m, { conn, usedPrefix, command, text }) => {
if (!text) return conn.reply(m.chat, `❀ Por favor, ingrese el nombre de algún manga.`, m)

try {
await m.react('⏰')

let res = await fetch('https://api.jikan.moe/v4/manga?q=' + text)
if (!res.ok) {
    await m.react('❌')
    return conn.reply(m.chat, `⚠️ Ocurrió un fallo.`, m)
}

let json = await res.json()
if (!json.data || json.data.length === 0) {
    await m.react('❌')
    return conn.reply(m.chat, `⚠️ No se encontraron resultados.`, m)
}

let manga = json.data[0]

// Datos seguros con fallback
let {
    chapters,
    title_japanese,
    url,
    type,
    score,
    members,
    background,
    status,
    volumes,
    synopsis,
    favorites
} = manga

let author = manga.authors?.[0]?.name || "Desconocido"

// Nuevo diseño
let animeingfo = `
╭━━━〔 *📘 INFO DEL MANGA* 〕━━━╮

💮 *Título:* ${title_japanese || 'No disponible'}
📚 *Capítulos:* ${chapters || '—'}
📘 *Volúmenes:* ${volumes || '—'}
📝 *Autor:* ${author}

📌 *Tipo:* ${type || '—'}
📡 *Estado:* ${status || '—'}

⭐ *Puntaje:* ${score || '—'}
👥 *Miembros:* ${members || '—'}
💗 *Favoritos:* ${favorites || '—'}

🖼️ *Fondo:* ${background || 'Sin información'}

🧾 *Sinopsis:* 
${synopsis || 'Sin sinopsis disponible'}

🔗 *URL:* ${url}

╰━━━━━━━━━━━━━━━━━━━━━━╯`

await conn.sendFile(
    m.chat,
    manga.images.jpg.image_url,
    'manga.jpg',
    '✧ *I N F O - M A N G A* ✧\n\n' + animeingfo,
    m
)

await m.react('✅')

} catch (error) {
await m.react('❌')
await conn.reply(
    m.chat,
    `⚠️ Se ha producido un problema.\n> Usa *${usedPrefix}report* para informarlo.\n\n${error.message}`,
    m
)
}}

handler.help = ['infomanga']
handler.tags = ['anime']
handler.command = ['infomanga', 'infoanime']
handler.group = true

export default handler