import fetch from 'node-fetch'
import axios from 'axios'
import Jimp from 'jimp'

let handler = async (m, { conn, text, usedPrefix, command }) => {

  if (!text) {
    return m.reply(`🍂 *Ejemplo de uso:*\n\n✎ ✧ \`${usedPrefix + command}\` https://open.spotify.com/track/0RmVGwfIgezMi7EKB3lU0B\n\n✎ ✧ \`${usedPrefix + command}\` TWICE - I CAN'T STOP ME`)
  }

  try {

    // Buscar canción en Spotify
    const search = await fetch(`https://api.delirius.store/search/spotify?q=${encodeURIComponent(text)}&limit=1`)
    const sjson = await search.json()

    if (!sjson.status || !sjson.data || !sjson.data[0]) throw "No encontré resultados en Spotify."

    const track = sjson.data[0]
    const title = track.name
    const artist = track.artist
    const image = track.image
    const spotifyUrl = track.url
    const durationMs = track.duration_ms || 0

    const toMMSS = (ms) => {
      if (!ms || ms <= 0) return "Desconocido"
      const total = Math.floor(ms / 1000)
      const min = Math.floor(total / 60)
      const sec = total % 60
      return `${String(min).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
    }
    const duration = toMMSS(durationMs)

    await conn.sendMessage(m.chat, { react: { text: '🎧', key: m.key } })

    // MÉTODO 1 (principal)
    let downloadUrl = null
    try {
      const dl1 = await fetch(`https://api.delirius.store/download/spotifydl?url=${encodeURIComponent(spotifyUrl)}`)
      const j1 = await dl1.json()
      if (j1?.data?.url) downloadUrl = j1.data.url
    } catch {}

    // MÉTODO 2 (fallback)
    if (!downloadUrl) {
      try {
        const dl2 = await axios.get(`https://api.soraapi.xyz/api/spotifyDL?url=${encodeURIComponent(spotifyUrl)}`)
        if (dl2?.data?.result?.download_url) downloadUrl = dl2.data.result.download_url
      } catch {}
    }

    if (!downloadUrl) throw "No se pudo obtener un link de descarga válido 😿"

    // Miniatura
    let thumb = null
    try {
      const img = await Jimp.read(image)
      img.cover(300, 300)
      thumb = await img.getBufferAsync(Jimp.MIME_JPEG)
    } catch {}

    const caption = `\`\`\`🎶 Título: ${title}
👤 Artista: ${artist}
⏱️ Duración: ${duration}\`\`\``

    // Enviar audio
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