import fetch from 'node-fetch'
import Jimp from 'jimp'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`🍂 *Ejemplo de uso:*\n\n✎ ✧ \`${usedPrefix + command}\` https://open.spotify.com/track/0RmVGwfIgezMi7EKB3lU0B\n\n✎ ✧ \`${usedPrefix + command}\` TWICE - I CAN'T STOP ME`)
  }

  try {
    let info = null
    let json = null

    // --- 1) Si es link directo a track en Spotify: intentar descargar por delirius ---
    if (text.includes("spotify.com/track")) {
      const url1 = `https://api.delirius.store/download/spotifydl?url=${encodeURIComponent(text)}`
      const res1 = await fetch(url1, { timeout: 20000 }).catch(err => { throw new Error('fetch delirius failed: ' + err.message) })
      if (!res1.ok) {
        const txt = await res1.text().catch(() => '')
        throw new Error('delirius responded with status ' + res1.status + ' ' + txt)
      }
      const j1 = await res1.json().catch(() => null)
      if (!j1 || !j1.data || !j1.data.url) throw new Error("No pude obtener la descarga desde delirius")

      json = {
        title: j1.data.title,
        author: j1.data.author,
        image: j1.data.image,
        duration: j1.data.duration,
        url: j1.data.url
      }

      // intentar ampliar info por yupra
      const query = encodeURIComponent((j1.data.title || '') + " " + (j1.data.author || ''))
      const resInfo = await fetch(`https://api.yupra.my.id/api/search/spotify?q=${query}`).catch(() => null)
      if (resInfo && resInfo.ok) {
        const jInfo = await resInfo.json().catch(() => null)
        info = jInfo?.result?.[0] || null
      }

    // --- 2) Si envían texto (nombre): buscar en yupra, obtener preview y usar delirius ---
    } else {
      const resSearch = await fetch(`https://api.yupra.my.id/api/search/spotify?q=${encodeURIComponent(text)}`, { timeout: 20000 }).catch(err => { throw new Error('fetch yupra failed: ' + err.message) })
      if (!resSearch || !resSearch.ok) throw new Error('Error buscando en yupra')
      const jSearch = await resSearch.json().catch(() => null)
      if (!jSearch?.result || !jSearch.result[0]) throw new Error("No encontré resultados en Spotify")

      info = jSearch.result[0]

      const previewUrl = info.spotify_preview
      if (!previewUrl) throw new Error("No hay preview disponible para descarga desde Spotify")

      const resDl = await fetch(`https://api.delirius.store/download/spotifydl?url=${encodeURIComponent(previewUrl)}`, { timeout: 20000 }).catch(() => null)
      if (!resDl || !resDl.ok) throw new Error("delirius no respondió la descarga del preview")
      const jDl = await resDl.json().catch(() => null)
      if (!jDl?.data?.url) throw new Error("No pude obtener la descarga desde delirius (preview)")

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
    let download = json.url
    const durationRaw = json.duration || 0

    // Normaliza duración (ms o s)
    let durationMs = Number(durationRaw) || 0
    if (durationMs > 0 && durationMs < 10000) durationMs = durationMs * 1000 // segundos -> ms
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

    // preparar miniatura (buffer). Si falla, dejamos thumb null.
    let thumb = null
    if (json.image) {
      try {
        // Primera opción: Jimp puede leer la URL directa
        const img = await Jimp.read(json.image)
        img.cover(300, 300)
        thumb = await img.getBufferAsync(Jimp.MIME_JPEG)
      } catch (err) {
        console.log("⚠️ Jimp fallo al procesar la imagen:", err.message || err)
        // Intentar descargar el image y obtener buffer directo
        try {
          const imgRes = await fetch(json.image)
          if (imgRes.ok) {
            const imgBuf = await imgRes.buffer()
            // opcional: volver a procesar con Jimp para asegurar JPEG
            try {
              const img2 = await Jimp.read(imgBuf)
              img2.cover(300, 300)
              thumb = await img2.getBufferAsync(Jimp.MIME_JPEG)
            } catch {
              thumb = imgBuf // usar buffer tal cual si Jimp vuelve a fallar
            }
          }
        } catch (e) {
          console.log("⚠️ No se pudo obtener miniatura alternativa:", e.message || e)
          thumb = null
        }
      }
    }

    // --- Intentar descargar el audio como buffer (más fiable que enviar solo la URL) ---
    let audioBuffer = null
    if (download) {
      try {
        const ares = await fetch(download, { timeout: 40000 })
        if (!ares.ok) throw new Error('Audio URL responded ' + ares.status)
        audioBuffer = await ares.buffer()
        // si el buffer es muy pequeño, tratarlo como fallo
        if (!audioBuffer || audioBuffer.length < 1000) {
          console.log('⚠️ Buffer de audio demasiado pequeño, fallback a YouTube')
          audioBuffer = null
        }
      } catch (err) {
        console.log('⚠️ Error descargando audio desde download url:', err.message || err)
        audioBuffer = null
      }
    }

    // --- Fallback: si no hay audioBuffer, intentar descargar desde YouTube (delirius ytmusic) ---
    if (!audioBuffer) {
      try {
        console.log('ℹ️ Intentando fallback a YouTube (ytmusic search)...')
        const q = encodeURIComponent(`${name} ${author}`)
        const ytSearchRes = await fetch(`https://api.delirius.store/search/ytmusic?q=${q}&limit=1`, { timeout: 20000 })
        if (ytSearchRes && ytSearchRes.ok) {
          const jyt = await ytSearchRes.json().catch(() => null)
          const vid = jyt?.data?.[0]?.videoId || jyt?.data?.[0]?.id || null
          if (vid) {
            const dl = await fetch(`https://api.delirius.store/download/ytmp3?videoId=${encodeURIComponent(vid)}`, { timeout: 40000 })
            if (dl && dl.ok) {
              const jdl = await dl.json().catch(() => null)
              const yurl = jdl?.data?.url || jdl?.data?.downloadUrl || null
              if (yurl) {
                const audioRes = await fetch(yurl, { timeout: 40000 })
                if (audioRes && audioRes.ok) {
                  audioBuffer = await audioRes.buffer()
                }
              }
            }
          }
        }
      } catch (err) {
        console.log('⚠️ Fallback YouTube falló:', err.message || err)
        audioBuffer = null
      }
    }

    if (!audioBuffer) {
      console.error('ERROR: No se pudo obtener audio (ni de Spotify ni de fallback YouTube).')
      return m.reply('`❌ Error al procesar la descarga de Spotify. (no se pudo obtener el audio)`')
    }

    // Enviar como documento descargable (mp3)
    await conn.sendMessage(m.chat, {
      document: audioBuffer,
      mimetype: 'audio/mpeg',
      fileName: `${name}.mp3`,
      caption: caption,
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

    // Enviar también como audio (reproducción)
    await conn.sendMessage(m.chat, {
      audio: audioBuffer,
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
    console.error("Error en handler music:", e && (e.stack || e.message || e))
    // Mostrar mensaje más explícito al usuario para ayudar a depurar
    let msg = '`❌ Error al procesar la descarga de Spotify.`'
    if (e && e.message) msg += `\n\`\`\`${e.message}\`\`\``
    m.reply(msg)
  }
}

handler.help = ['music <url|nombre>']
handler.tags = ['dl']
handler.command = ['music']

export default handler