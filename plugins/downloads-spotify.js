import axios from 'axios'
import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  if (!text) return conn.reply(m.chat, `🎋 *Por favor proporciona el nombre de una canción.*`, m)

  try {
    // Buscar canción
    let search = await axios.get(`https://api.delirius.store/search/spotify?q=${encodeURIComponent(text)}&limit=1`)
    if (!search.data?.status || !search.data.data?.length) throw 'No encontrado'

    let result = search.data.data[0]
    let { title, artist, album, duration, publish, url, image } = result

    // Avisar al usuario
    await conn.sendMessage(m.chat, {
      text: `「✦」Preparando descarga...\n\n> 🎵 *${title}*\n> 👤 *${artist}*`,
      contextInfo: {
        externalAdReply: {
          title: title,
          body: artist,
          thumbnailUrl: image,
          sourceUrl: url,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

    let audioUrl = null

    // 1) Intentar descarga normal
    try {
      let dl = await fetch(`https://api.delirius.store/download/spotifydl?url=${encodeURIComponent(url)}`)
      let js = await dl.json()
      if (js?.data?.url) audioUrl = js.data.url
    } catch { }

    // 2) Si falla → intentar con servidor de respaldo
    if (!audioUrl) {
      try {
        let backup = await fetch(`https://spotifydl.fly.dev/download?url=${encodeURIComponent(url)}`)
        let js2 = await backup.json()
        if (js2?.downloadUrl) audioUrl = js2.downloadUrl
      } catch { }
    }

    if (!audioUrl) return conn.reply(m.chat, `⚠️ No pude descargar esta canción. Intenta con otro nombre.`, m)

    let audio = await fetch(audioUrl)
    let buffer = await audio.buffer()

    // Enviar archivo
    await conn.sendMessage(m.chat, {
      audio: buffer,
      mimetype: "audio/mpeg",
      fileName: `${title}.mp3`,
      contextInfo: {
        externalAdReply: {
          title: title,
          body: `${artist} • ${duration || ""}`,
          thumbnailUrl: image,
          renderLargerThumbnail: true,
          sourceUrl: url
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.log("ERROR SPOTIFY:", e)
    conn.reply(m.chat, `❌ *Error al buscar o descargar la canción.*`, m)
  }
}

handler.help = ["spotify <nombre>"]
handler.tags = ["download"]
handler.command = ["spotify", "splay"]

export default handler