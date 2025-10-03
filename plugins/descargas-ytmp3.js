import fetch from 'node-fetch'
import yts from 'yt-search'

let handler = async (m, { conn, text, command, usedPrefix }) => {
  try {
    if (!text) {
      return conn.reply(
        m.chat,
        `🎋 Ingresa el nombre de la canción o un enlace de YouTube.\n\n🌾 Ejemplo: ${usedPrefix + command} DJ Malam Pagi`,
        m
      )
    }

    await conn.sendMessage(m.chat, {
      react: { text: "⏳", key: m.key }
    })

    let url = text
    if (!/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(text)) {
      let search = await yts(text)
      let video = search.videos[0]
      if (!video) return conn.reply(m.chat, '❌ No se encontró ningún resultado.', m)
      url = video.url
    }

    const apiUrl = `https://api.vreden.my.id/api/v1/download/youtube/audio?url=${encodeURIComponent(url)}&quality=92`
    const res = await fetch(apiUrl)
    const json = await res.json()

    if (!json?.status || !json?.result?.download?.url) {
      return conn.reply(m.chat, '❌ No se pudo obtener el audio.', m)
    }

    let meta = json.result
    let info = meta.metadata
    let dl = meta.download

    const audioBuffer = await (await fetch(dl.url)).buffer()

    await conn.sendMessage(m.chat, {
      audio: audioBuffer,
      fileName: `${dl.filename || 'audio'}.mp3`,
      mimetype: "audio/mpeg",
      ptt: false,
      contextInfo: {
        externalAdReply: {
          title: info.title || 'YouTube Music',
          body: `🎶 Duración: ${info.duration?.timestamp || '-'} • 📊 Calidad: ${dl.quality || '92kbps'}`,
          mediaUrl: info.url || url,
          sourceUrl: info.url || url,
          thumbnailUrl: info.image || info.thumbnail,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

    await conn.sendMessage(m.chat, {
      react: { text: "✔️", key: m.key }
    })

  } catch (e) {
    console.error(e)
    await conn.reply(m.chat, `❌ Error: ${e.message}`, m)
  }
}

handler.command = ['ytmp3', 'song']
handler.tags = ['descargas']
handler.help = ['ytmp3 <texto o link>', 'song <texto>']

export default handler