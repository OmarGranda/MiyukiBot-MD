import { search, download } from 'aptoide-scraper'
import fetch from 'node-fetch'
import Jimp from 'jimp'

let handler = async (m, { conn, text, usedPrefix }) => {
  if (!text) return m.reply(`🕸️ *Debes escribir el nombre de la APK*\n\nEjemplo:\n${usedPrefix}apk whatsapp`, m)

  try {
    await m.react('🕓')

    // Buscar apps
    let result = await search(text)
    if (!result || !result.length) return m.reply(`⚠️ No se encontró ninguna app con ese nombre.`, m)

    // Elegir la versión más reciente
    let app = result[0]
    let data = await download(app.id)

    let caption = `*乂  APTOIDE - DESCARGAS 乂*
📦 *NOMBRE:* ${data.name}
🆔 *PAQUETE:* ${data.package}
⏱️ *ACTUALIZADO:* ${data.lastup}
💾 *TAMAÑO:* ${data.size}
`.trim()

    // Intentar crear miniatura
    let thumb = null
    try {
      const img = await Jimp.read(data.icon)
      img.resize(300, Jimp.AUTO)
      thumb = await img.getBufferAsync(Jimp.MIME_JPEG)
    } catch {}

    // Enviar información
    await conn.sendMessage(m.chat, { image: { url: data.icon }, caption }, { quoted: m })

    // Evitar archivos gigantes
    let size = parseFloat(data.size)
    if (data.size.includes("GB") || size > 1000) {
      return m.reply(`⚠️ *El APK es demasiado pesado para enviarlo.*`, m)
    }

    // Enviar APK
    await conn.sendMessage(
      m.chat,
      {
        document: { url: data.dllink },
        mimetype: 'application/vnd.android.package-archive',
        fileName: `${data.name}.apk`,
        caption: `✅ *Versión más reciente descargada exitosamente*`,
        ...(thumb ? { jpegThumbnail: thumb } : {})
      },
      { quoted: m }
    )

    await m.react('✔️')

  } catch (e) {
    console.log(e)
    m.reply(`❌ *Ocurrió un error al procesar tu solicitud.*\n\n> Intenta nuevamente o usa:\n${usedPrefix}report`, m)
    await m.react('❌')
  }
}

handler.command = ["apk", "modapk", "aptoide"]
export default handler