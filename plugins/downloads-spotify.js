import axios from 'axios'
import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {

  if (!text) return conn.reply(m.chat, `🎋 *Ingresa el nombre de una canción o el enlace de Spotify.*`, m)

  try {

    // Buscar en Spotify para obtener datos correctos
    let search = await axios.get(`https://api.delirius.store/search/spotify?q=${encodeURIComponent(text)}&limit=1`)
    if (!search.data?.status || !search.data.data?.length) throw 'No encontrado'

    let result = search.data.data[0]
    let { title, artist, url, image } = result

    // Buscar en YouTube
    let yt = await axios.get(`https://api.delirius.store/search/ytmusic?q=${encodeURIComponent(title + " " + artist)}&limit=1`)
    if (!yt.data?.status || !yt.data.data?.length) throw 'No se encontró audio en YouTube.'

    let ytId = yt.data.data[0].videoId
    let ytTitle = yt.data.data[0].title

    // Descargar MP3 desde YouTube
    let dl = await fetch(`https://api.delirius.store/download/ytmp3?videoId=${ytId}`)
    let js = await dl.json()

    if (!js?.data?.url) throw 'No se pudo descargar el audio.'

    let audio = await fetch(js.data.url)
    let buffer = await audio.buffer()

    // Enviar al usuario
    await conn.sendMessage(m.chat, {
      audio: buffer,
      mimetype: 'audio/mpeg',
      fileName: `${ytTitle}.mp3`,
      contextInfo: {
        externalAdReply: {
          title: title,
          body: artist,
          thumbnailUrl: image,
          renderLargerThumbnail: true,
          sourceUrl: url
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.log(e)
    conn.reply(m.chat, `❌ Ocurrió un error. Intenta con otro nombre.`, m)
  }
}

handler.help = ["spotify", "splay"]
handler.tags = ["music"]
handler.command = ["spotify", "splay"]

export default handler