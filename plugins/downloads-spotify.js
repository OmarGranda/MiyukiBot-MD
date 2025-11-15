import axios from 'axios'
import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  if (!text) return conn.reply(m.chat, `🎋 *Por favor proporciona el nombre de una canción.*`, m)

  try {
    let search = await axios.get(`https://api.delirius.store/search/spotify?q=${encodeURIComponent(text)}&limit=1`)
    if (!search.data?.status || !search.data.data?.length) throw 'No encontrado'

    let result = search.data.data[0]
    let { title, artist, album, duration, publish, popularity, url, image } = result

    await conn.sendMessage(
      m.chat,
      {
        text: `「✦」Buscando y preparando descarga...\n\n` +
              `🍀 *${title}*\n` +
              `👤 *${artist}*\n` +
              `💽 *Álbum:* ${album}\n` +
              `⏱️ *Duración:* ${duration}\n` +
              `📅 *Lanzamiento:* ${publish}\n` +
              `🔥 *Popularidad:* ${popularity}`,
        contextInfo: {
          externalAdReply: {
            title: title,
            body: artist,
            thumbnailUrl: image,
            mediaType: 1,
            renderLargerThumbnail: true,
            sourceUrl: url
          }
        }
      },
      { quoted: m }
    )

    const apiKey = "IUHp9S4ExrywBB35"
    const base = "https://api-nv.ultraplus.click"

    const u = new URL("/api/download/spotify", base)
    u.search = new URLSearchParams({
      url: url,
      key: apiKey
    })

    let r = await fetch(u)
    let json = await r.json()

    if (!json?.status || !json?.result?.url_download)
      throw `No pude generar la descarga.`

    let dlUrl = json.result.url_download

    let audio = await fetch(dlUrl)
    let buffer = await audio.buffer()

    // --- ENVIAR ARCHIVO ---
    await conn.sendMessage(
      m.chat,
      {
        audio: buffer,
        mimetype: "audio/mpeg",
        fileName: `${title}.mp3`,
        contextInfo: {
          externalAdReply: {
            title: title,
            body: `${artist} • ${duration}`,
            thumbnailUrl: image,
            renderLargerThumbnail: true,
            sourceUrl: url
          }
        }
      },
      { quoted: m }
    )

  } catch (e) {
    console.log("ERROR SPOTIFY:", e)
    conn.reply(m.chat, `❌ *Error al buscar o descargar la canción.*`, m)
  }
}

handler.help = ["spotify <nombre>"]
handler.tags = ["download"]
handler.command = ["spotify", "splay"]

export default handler