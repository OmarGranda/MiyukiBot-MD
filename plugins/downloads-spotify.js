import axios from 'axios'
import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  if (!text) return conn.reply(m.chat, `🎋 *Por favor proporciona el nombre de la canción.*`, m)

  try {

    // 🔍 Buscar canción
    let search = await axios.get(`https://api.delirius.store/search/spotify?q=${encodeURIComponent(text)}&limit=1`)
    if (!search.data?.status || !search.data.data?.length) throw 'No encontrado'

    let result = search.data.data[0]
    let { title, artist, album, duration, popularity, publish, url, image } = result

    // 📝 Info previa
    await conn.sendMessage(m.chat, {
      text: `「✦」Descargando *<${title}>*\n\n` +
        `> ꕥ Autor » *${artist}*\n` +
        (album ? `> ❑ Álbum » *${album}*\n` : '') +
        (duration ? `> ⴵ Duración » *${duration}*\n` : '') +
        (publish ? `> ☁︎ Publicado » *${publish}*\n` : '') +
        `> 🜸 Enlace » ${url}`,
      contextInfo: {
        externalAdReply: {
          title: '🎧 sᴘᴏᴛɪғʏ ᴍᴜsɪᴄ',
          body: artist,
          thumbnailUrl: image,
          sourceUrl: url,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

    // 🎶 Descargar audio real
    let dl = await fetch(`https://api.delirius.store/download/spotifydl?url=${encodeURIComponent(url)}`)
    let js = await dl.json()

    if (!js.data?.url) return conn.reply(m.chat, `⚠️ No se pudo obtener el audio.`, m)

    let audioUrl = js.data.url

    // Descargar archivo a buffer
    let audio = await fetch(audioUrl)
    let buffer = await audio.buffer()

    // 🎧 Enviar audio
    await conn.sendMessage(m.chat, {
      audio: buffer,
      mimetype: "audio/mpeg",
      fileName: `${title}.mp3`,
      contextInfo: {
        externalAdReply: {
          title: title,
          body: `${artist} • ${duration || "?"}`,
          thumbnailUrl: image,
          renderLargerThumbnail: true,
          sourceUrl: url
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.log("ERROR SPOTIFY:", e)
    return conn.reply(m.chat, `❌ *Error al buscar o descargar la canción.*\nVuelve a intentarlo.`, m)
  }
}

handler.help = ["spotify <nombre>"]
handler.tags = ["download"]
handler.command = ["spotify", "splay"]

export default handler