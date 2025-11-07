import fetch from 'node-fetch'
import Jimp from 'jimp'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`🍂 *Ejemplo de uso:*\n\n✎ ✧ \`${usedPrefix + command}\` https://open.spotify.com/track/0RmVGwfIgezMi7EKB3lU0B\n\n✎ ✧ \`${usedPrefix + command}\` TWICE - I CAN'T STOP ME`)
  }

  try {
    let info = null
    let json = null

    if (text.includes("spotify.com/track")) {
      const url1 = `https://api.delirius.store/download/spotifydl?url=${encodeURIComponent(text)}`
      const res1 = await fetch(url1)
      if (!res1.ok) throw await res1.text()
      const j1 = await res1.json()
      if (!j1 || !j1.data || !j1.data.url) throw "No pude obtener la descarga"

      json = {
        title: j1.data.title,
        author: j1.data.author,
        image: j1.data.image,
        duration: j1.data.duration,
        url: j1.data.url
      }

      const query = encodeURIComponent((j1.data.title || '') + " " + (j1.data.author || ''))
      const resInfo = await fetch(`https://api.yupra.my.id/api/search/spotify?q=${query}`)
      if (resInfo.ok) {
        const jInfo = await resInfo.json()
        info = jInfo.result?.[0] || null
      }

    } else {
      const resSearch = await fetch(`https://api.yupra.my.id/api/search/spotify?q=${encodeURIComponent(text)}`)
      if (!resSearch.ok) throw await resSearch.text()
      const jSearch = await resSearch.json()
      if (!jSearch.result || !jSearch.result[0]) throw "No encontré resultados"

      info = jSearch.result[0]

      const previewUrl = info.spotify_preview
      if (!previewUrl) throw "No hay preview disponible para descarga"

      const resDl = await fetch(`https://api.delirius.store/download/spotifydl?url=${encodeURIComponent(previewUrl)}`)
      if (!resDl.ok) throw await resDl.text()
      const jDl = await resDl.json()
      if (!jDl || !jDl.data || !jDl.data.url) throw "No pude obtener la descarga"

      json = {
        title: jDl.data.title,
        author: jDl.data.author,
        image: jDl.data.image,
        duration: jDl.data.duration,
        url: jDl.data.url
      }
    }

    const name = json.title || "Desconocido"
    const author = json.author || "Desconocido"
    const download = json.url
    const durationRaw = json.duration || 0

    // Normaliza duración: puede venir en ms o s. Si es razonablemente pequeño lo tomamos como segundos.
    let durationMs = Number(durationRaw) || 0
    if (durationMs > 0 && durationMs < 1000 * 60 * 60 && durationMs < 10000) {
      // parece ser segundos -> convertir a ms
      durationMs = durationMs * 1000
    }
    const toMMSS = (ms) => {
      if (!ms || ms <= 0) return "Desconocido"
      const total = Math.floor(ms / 1000)
      const min = Math.floor(total / 60)
      const sec = total % 60
      return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    }
    const duration = toMMSS(durationMs)

    await conn.sendMessage(m.chat, { react: { text: '🕓', key: m.key } })

    let moreInfo = info ? `
🎶 Álbum: ${info.album_name || "Desconocido"}
📀 Release: ${info.release_date || "N/A"}
🔗 Preview: ${info.spotify_preview || "N/A"}` : ""

    let caption = `\`\`\`🧪 Título: ${name}
👤 Artista: ${author}
⏱️ Duración: ${duration}\`\`\`${moreInfo}`

    // preparar miniatura (buffer)
    let thumb = null
    if (json.image) {
      try {
        const img = await Jimp.read(json.image)
        img.cover(300, 300) // recorta/ajusta a 300x300
        thumb = await img.getBufferAsync(Jimp.MIME_JPEG)
      } catch (err) {
        console.log("⚠️ Error al procesar miniatura:", err)
        thumb = null
      }
    }

    // enviar como documento (archivo mp3 descargable)
    await conn.sendMessage(m.chat, {
      document: { url: download },
      mimetype: 'audio/mpeg',
      fileName: `${name}.mp3`,
      caption: caption,
      ...(thumb ? { jpegThumbnail: thumb } : {}),
      contextInfo: {
        externalAdReply: {
          title: name,
          body: `👤 ${author} • ⏱️ ${duration}`,
          mediaType: 2,
          // si tenemos buffer lo usamos como thumbnail directo
          ...(thumb ? { thumbnail: thumb } : (json.image ? { thumbnailUrl: json.image } : {})),
          renderLargerThumbnail: true,
          sourceUrl: (text && text.startsWith('http')) ? text : (info?.spotify_url || '')
        }
      }
    }, { quoted: m })

    // enviar también como audio (reproducción rápida en el chat)
    await conn.sendMessage(m.chat, {
      audio: { url: download },
      mimetype: 'audio/mpeg',
      fileName: `${name}.mp3`,
      ...(thumb ? { jpegThumbnail: thumb } : {}),
      contextInfo: {
        externalAdReply: {
          title: name,
          body: `👤 ${author} • ⏱️ ${duration}`,
          mediaType: 2,
          ...(thumb ? { thumbnail: thumb } : (json.image ? { thumbnailUrl: json.image } : {})),
          renderLargerThumbnail: true,
          sourceUrl: (text && text.startsWith('http')) ? text : (info?.spotify_url || '')
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error("Error en handler music:", e)
    m.reply("`❌ Error al procesar la descarga de Spotify.`")
  }
}

handler.help = ['music <url|nombre>']
handler.tags = ['dl']
handler.command = ['music']

export default handler