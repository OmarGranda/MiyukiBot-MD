import fetch from 'node-fetch'
import Jimp from 'jimp'

let handler = async (m, { conn, text, usedPrefix, command }) => {

  if (!text) return m.reply(`🍂 *Ejemplo:*\n${usedPrefix + command} https://open.spotify.com/track/0RmVGwfIgezMi7EKB3lU0B`)

  try {

    let api = ''

    if (text.includes('spotify.com/track')) {
      api = `https://api.maelflac.online/spotify?query=${encodeURIComponent(text)}`
    } else {
      api = `https://api.maelflac.online/spotify?query=${encodeURIComponent(text)}`
    }

    const res = await fetch(api)
    if (!res.ok) throw `La API no respondió`

    const json = await res.json()
    if (!json || !json.result || !json.result.download) throw `No pude obtener la descarga`

    const title = json.result.title || "Desconocido"
    const artist = json.result.artist || "Desconocido"
    const duration = json.result.duration || "N/A"
    const thumbnail = json.result.thumbnail
    const download = json.result.download

    let thumb = null
    try {
      const img = await Jimp.read(thumbnail)
      img.cover(300, 300)
      thumb = await img.getBufferAsync(Jimp.MIME_JPEG)
    } catch { thumb = null }

    let caption = `🎶 *${title}*\n👤 *${artist}*\n⏱️ *${duration}*`

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
          ...(thumb ? { thumbnail: thumb } : { thumbnailUrl: thumbnail }),
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

    await conn.sendMessage(m.chat, {
      audio: { url: download },
      mimetype: 'audio/mpeg'
    }, { quoted: m })

  } catch (err) {
    console.log(err)
    return m.reply(`❌ Error al procesar la descarga.\n\n> ${err}`)
  }
}

handler.help = ['music <url|nombre>']
handler.tags = ['dl']
handler.command = ['music']

export default handler