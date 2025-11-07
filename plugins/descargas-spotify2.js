import fetch from 'node-fetch'
import Jimp from 'jimp'

let handler = async (m, { conn, text, usedPrefix, command }) => {

  if (!text) return m.reply(`🍂 *Ejemplo:*\n${usedPrefix + command} https://open.spotify.com/track/0RmVGwfIgezMi7EKB3lU0B`)

  try {

    const api = `https://api.gifteddev.xyz/api/spotifydl?url=${encodeURIComponent(text)}`
    const res = await fetch(api)
    if (!res.ok) throw `La API no respondió`

    const data = await res.json()
    if (!data || !data.result || !data.result.download) throw `No pude obtener la descarga`

    const title = data.result.title || "Desconocido"
    const artist = data.result.artist || "Desconocido"
    const duration = data.result.duration || "N/A"
    const image = data.result.thumbnail
    const download = data.result.download

    // 🖼 Miniatura
    let thumb = null
    try {
      const img = await Jimp.read(image)
      img.cover(300, 300)
      thumb = await img.getBufferAsync(Jimp.MIME_JPEG)
    } catch { thumb = null }

    let caption = `🎶 *${title}*\n👤 *${artist}*\n⏱️ *${duration}*`

    // 📥 Enviar como documento descargable
    await conn.sendMessage(m.chat, {
      document: { url: download },
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`,
      caption,
      ...(thumb ? { jpegThumbnail: thumb } : {}),
      contextInfo: {
        externalAdReply: {
          title,
          body: artist,
          mediaType: 2,
          ...(thumb ? { thumbnail: thumb } : { thumbnailUrl: image }),
          renderLargerThumbnail: true,
          sourceUrl: text
        }
      }
    }, { quoted: m })

    // 🎧 También reproducible
    await conn.sendFile(m.chat, download, `${title}.mp3`, null, m)

  } catch (err) {
    console.log(err)
    return m.reply(`❌ Error al procesar la descarga.\n\n${err}`)
  }
}

handler.help = ['music <url|nombre>']
handler.tags = ['dl']
handler.command = ['music']

export default handler