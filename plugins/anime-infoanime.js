import fetch from 'node-fetch'

var handler = async (m, { conn, usedPrefix, command, text }) => {
if (!text) return conn.reply(m.chat, `❀ Por favor, ingrese el nombre de algún manga o anime.`, m)

try {
await m.react('⏰')

let res = await fetch('https://api.jikan.moe/v4/manga?q=' + text)
if (!res.ok) {
    await m.react('❌')
    return conn.reply(m.chat, `⚠️ Ocurrió un fallo al buscar.`, m)
}

let json = await res.json()
if (!json.data || json.data.length === 0) {
    await m.react('❌')
    return conn.reply(m.chat, `⚠️ No se encontraron resultados.`, m)
}

let manga = json.data[0]

let {
    chapters,
    title,
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


// 🔰 FUNCION PARA TRADUCIR TEXTO A ESPAÑOL
async function traducir(texto) {
    if (!texto) return "No disponible."
    try {
        let r = await fetch("https://libretranslate.de/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                q: texto,
                source: "en",
                target: "es",
                format: "text"
            })
        })
        let data = await r.json()
        return data.translatedText || texto
    } catch {
        return texto // Si falla la API, deja el texto original
    }
}

// 🟣 Traducción automática
let synopsisES = await traducir(synopsis)
let backgroundES = await traducir(background)
let titleES = await traducir(title)


// Nuevo diseño bonito en español
let animeingfo = `
╭━━━〔 *📘 INFO DEL MANGA/ANIME* 〕━━━╮

💮 *Título:* ${titleES}
📚 *Capítulos:* ${chapters || '—'}
📘 *Volúmenes:* ${volumes || '—'}
📝 *Autor:* ${author}

📌 *Tipo:* ${type || '—'}
📡 *Estado:* ${status || '—'}

⭐ *Puntaje:* ${score || '—'}
👥 *Miembros:* ${members || '—'}
💗 *Favoritos:* ${favorites || '—'}

🖼️ *Información adicional:* 
${backgroundES}

🧾 *Sinopsis:* 
${synopsisES}

🔗 *URL:* ${url}

╰━━━━━━━━━━━━━━━━━━━━━━╯`


await conn.sendFile(
    m.chat,
    manga.images.jpg.image_url,
    'manga.jpg',
    '✧ *I N F O - M A N G A / A N I M E* ✧\n\n' + animeingfo,
    m
)

await m.react('✅')

} catch (error) {
await m.react('❌')
await conn.reply(
    m.chat,
    `⚠️ Se produjo un problema.\n> Usa *${usedPrefix}report* para informarlo.\n\n${error.message}`,
    m
)
}}

handler.help = ['infoanime', 'infomanga']
handler.tags = ['anime']
handler.command = ['infoanime', 'infomanga']
handler.group = true

export default handler