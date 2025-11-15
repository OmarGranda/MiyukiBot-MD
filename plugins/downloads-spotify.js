import axios from 'axios'
import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  if (!text) return conn.reply(m.chat, `🎋 *Por favor, proporciona el nombre de una canción o artista.*`, m, fake)

  try {
  const searchUrl = `${global.APIs.delirius.url}/search/spotify?q=${encodeURIComponent(text)}&limit=1`
    const search = await axios.get(searchUrl, { timeout: 15000 })

    if (!search.data?.status || search.data.data.length === 0)
      return conn.reply(m.chat, `⚠️ No encontré resultados para *${text}*`, m)

    const song = search.data.data[0]
    const { title, artist, album, duration, popularity, publish, url: spotifyUrl, image } = song

    const caption =
`💽 Título: *${title}*
👤 Artista: *${artist}*
🎧 Álbum: *${album || "Desconocido"}*
⏱️ Duración: *${duration || "N/A"}*
📅 Publicado: *${publish || "N/A"}*
🔥 Popularidad: *${popularity || "N/A"}*
🔗 link: ${spotifyUrl}`

    await conn.sendMessage(m.chat, {
      image: { url: image },
      caption: caption
    }, { quoted: m })


    const base = 'https://api-nv.ultraplus.click'
    const api = new URL('/api/download/spotify', base)
    api.search = new URLSearchParams({
      url: spotifyUrl,
      key: 'IUHp9S4ExrywBB35'
    })

    const dlRes = await fetch(api)
    const json = await dlRes.json()

    if (!json?.status || !json?.result?.url_download) {
      console.log("RESPUESTA API:", json)
      return conn.reply(m.chat, `❌ No se pudo generar la descarga.\nInténtalo más tarde.`, m)
    }

    const downloadUrl = json.result.url_download

    const mp3 = await fetch(downloadUrl)
    const buffer = await mp3.buffer()


    await conn.sendMessage(m.chat, {
      audio: buffer,
      mimetype: "audio/mpeg",
      fileName: `${title}.mp3`,
      ptt: false
    }, { quoted: m })

  } catch (e) {
    console.log("ERROR SPOTIFY:", e)
    await conn.reply(m.chat, `❌ Error al buscar o descargar la canción.`, m)
  }
}

handler.help = ["spotify <nombre>"]
handler.tags = ["download"]
handler.command = ["spotify", "splay"]

export default handler