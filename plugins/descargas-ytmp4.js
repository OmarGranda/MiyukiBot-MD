import fetch from "node-fetch"
import fs from "fs"

const handler = async (m, { conn, text }) => {
  try {
    if (!text?.trim()) 
      return conn.reply(m.chat, `🍂 *Ingresa el enlace del video de YouTube*`, m)

    const api = `https://api-shadowxyz.vercel.app/download/ytmp4V2?url=${encodeURIComponent(text)}`
    const res = await fetch(api)

    if (!res.ok) throw new Error(`Error al obtener datos de la API Shadow.xyz`)
    const json = await res.json()

    if (!json.status || !json.result?.download_url)
      throw new Error(`No se pudo obtener el video.`)

    const { title, duration, download_url } = json.result

    // Obtener tamaño del archivo
    const head = await fetch(download_url, { method: "HEAD" })
    const fileSize = head.headers.get("content-length")
    const fileMB = fileSize ? (Number(fileSize) / 1024 / 1024).toFixed(2) : 0

    const caption = `🌿 *${title}*\n🍉 \`Duración:\` ${duration}`

    await m.react('📥')

    // 70 MB -- doc xd
    if (fileMB > 70) {
      await conn.sendMessage(
        m.chat,
        {
          document: { url: download_url },
          mimetype: "video/mp4",
          fileName: `${title}.mp4`,
          caption
        },
        { quoted: m }
      )
    } else {
      await conn.sendMessage(
        m.chat,
        {
          video: { url: download_url },
          caption
        },
        { quoted: m }
      )
    }

    await m.react('✔️')

  } catch (e) {
    console.error(e)
    conn.reply(
      m.chat,
      `❌ *Ocurrió un error al procesar el video.*\nVerifica el enlace o inténtalo más tarde.`,
      m
    )
  }
}

handler.help = ['ytmp4 <url>']
handler.tags = ['descargas']
handler.command = ['ytmp4']

export default handler