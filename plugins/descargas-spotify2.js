import fetch from 'node-fetch'
import axios from 'axios'
import Jimp from 'jimp'

let handler = async (m, { conn, text, usedPrefix, command }) => {

  if (!text) {
    return m.reply(`🍂 *Ejemplo de uso:*\n\n✎ ✧ \`${usedPrefix + command}\` https://open.spotify.com/track/0RmVGwfIgezMi7EKB3lU0B\n\n✎ ✧ \`${usedPrefix + command}\` TWICE - I CAN'T STOP ME`)
  }

  try {

    // Buscar canción (API funcional)
    let search = await fetch(`https://api.delirius.store/search/spotify?q=${encodeURIComponent(text)}&limit=1`)
    let sjson = await search.json()

    if (!sjson.status || !sjson.data || !sjson.data[0]) throw "No encontré resultados en Spotify"

    let track = sjson.data[0]

    const title = track.name
    const artist = track.artist
    const image = track.image
    const spotifyUrl = track.url
    const durationMs = track.duration_ms || 0

    const toMMSS = (ms) => {
      if (ms <= 0) return "Desconocido"
      const total = Math.floor(ms / 1000)
      const min = Math.floor(total / 60)
      const sec = total % 60
      return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    }
    const duration = toMMSS(durationMs)

    await conn.sendMessage(m.chat, { react: { text: '🎧', key: m.key } })

    // Intentar descargar audio desde distintos servidores
    let downloadUrl = null

    // Método 1
    try {
      let dl = await axios.get(`https://api.nekolabs.my.id/downloader/spotify/v1?url=${encodeURIComponent(spotifyUrl)}`)
      downloadUrl = dl?.data?.result?.downloadUrl
    } catch {}

    // Método 2 (fallback)
    if (!downloadUrl) {
      try {
        let dl = await axios.get(`https://api.sylphy.xyz/download/spotify?url=${encodeURIComponent(spotifyUrl)}&apikey=sylphy-c519`)
        downloadUrl = dl?.data?.data?.dl_url
      } catch {}
    }

    // Método 3 (última opción)
    if (!downloadUrl) {
      try {
        let dl = await fetch(`https://api.neoxr.eu/api/spotify?url=${encodeURIComponent(spotifyUrl)}&apikey=russellxz`)
        let j = await dl.json()
        downloadUrl = j?.data?.url
      } catch {}
    }

    if (!downloadUrl) throw "No se pudo descargar la canción (todos los servidores fallaron)"

    // Convertir miniatura
    let thumb = null
    try {
      const img = await Jimp.read(image)
      img.cover(300, 300)
      thumb = await img.getBufferAsync(Jimp.MIME_JPEG)
    } catch {}

    let caption = `\`\`\`🎶 Título: ${title}
👤 Artista: ${artist}
⏱️ Duración: ${duration}\`\`\``

    // Enviar el archivo como audio reproducible
    await conn.sendMessage(m.chat, {
      audio: { url: downloadUrl },
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`,
      ...(thumb ? { jpegThumbnail: thumb } : {}),
      contextInfo: {
        externalAdReply: {
          title: title,
          body: artist,
          thumbnailUrl: image,
          sourceUrl: spotifyUrl,
          mediaType: 2,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply(`❌ Error al procesar la descarga de Spotify.\n\n> ${e}`)
  }
}

handler.help = ['music <url|nombre>']
handler.tags = ['dl']
handler.command = ['music', 'spotify', 'splay']

export default handler