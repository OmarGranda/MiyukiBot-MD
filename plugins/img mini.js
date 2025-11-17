import fetch from "node-fetch"
import Jimp from "jimp"
import crypto from "crypto"
import { generateWAMessageFromContent } from "@whiskeysockets/baileys"

async function sendOrderMsg(m, conn, texto, imgBuffer) {
  try {
    const order = {
      orderId: 'MINI-' + Date.now(),
      thumbnail: imgBuffer,
      itemCount: 1,
      status: 1,
      surface: 1,
      message: texto,
      orderTitle: 'Miniatura Generada',
      token: null,
      sellerJid: null,
      totalAmount1000: '0',
      totalCurrencyCode: 'PEN',
      contextInfo: {
        externalAdReply: {
          title: botname,
          body: '',
          thumbnail: imgBuffer,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }

    const msg = generateWAMessageFromContent(
      m.chat,
      { orderMessage: order },
      { quoted: m }
    )

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

  } catch (e) {
    console.log(e)
    m.reply("❌ Error enviando el mensaje.")
  }
}

let handler = async (m, { conn, text }) => {
  const rwait = "🕓"
  const done = "🚀"
  const error = "❌"

  if (!text && !m.quoted) {
    return m.reply(`🍬 *Envía una imagen o una URL válida*\n\n📌 Ejemplo:\n.mini https://ejemplo.com/foto.jpg\nO responde a una imagen con: *.mini*`)
  }

  await m.react(rwait)

  try {
    let buffer

    if (text) {
      const res = await fetch(text)
      if (!res.ok) throw new Error("No se pudo descargar la imagen desde la URL.")
      buffer = Buffer.from(await res.arrayBuffer())
    } else if (m.quoted && /image/.test(m.quoted.mtype)) {
      buffer = await m.quoted.download()
    } else {
      throw new Error("No se detectó una imagen válida.")
    }

    const image = await Jimp.read(buffer)
    let quality = 90
    let resized, outBuffer

    do {
      resized = image.clone().resize(200, Jimp.AUTO).quality(quality)
      outBuffer = await resized.getBufferAsync(Jimp.MIME_JPEG)
      quality -= 10
    } while (outBuffer.length > 64 * 1024 && quality > 10)

    const { bitmap } = resized
    const format = "JPG"
    const sizeKB = (outBuffer.length / 1024).toFixed(1)

    const caption = `
🌸 *M I N I A T U R A  G E N E R A D A* 🌸

🖼️ *Formato:* ${format}
📏 *Resolución:* ${bitmap.width}x${bitmap.height}px
📦 *Tamaño:* ${sizeKB} KB
💎 *Calidad final:* ${Math.min(quality + 10, 100)}%
`

    const pp = banner
    const pbf = await fetch(pp).then(r => r.buffer())

    await sendOrderMsg(m, conn, caption, pbf)

    await m.react(done)

  } catch (e) {
    console.error("[Error en .mini]", e)
    await m.react(error)
    await m.reply("❌ *Ocurrió un error al procesar la imagen.*")
  }
}

handler.command = ["mini", "miniatura"]
export default handler