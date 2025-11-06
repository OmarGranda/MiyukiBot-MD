// plugins/fdroid.js
import fetch from "node-fetch"

let handler = async (m, { text, conn, usedPrefix }) => {
  try {
    if (!text || !text.trim()) return m.reply(`🟢 *Uso:* ${usedPrefix}fdroid <nombre>\nEjemplo:\n${usedPrefix}fdroid termux`, m)

    await m.react("🕓")

    const q = encodeURIComponent(text.trim())
    const searchRes = await fetch(`https://search.f-droid.org/?q=${q}&json=1`)
    if (!searchRes.ok) throw new Error("Error al conectar con search.f-droid.org")
    const searchJson = await searchRes.json()

    if (!searchJson.apps || searchJson.apps.length === 0) {
      return m.reply(`❌ No encontré resultados para: *${text}*`, m)
    }

    // Tomamos la primera coincidencia
    const appInfo = searchJson.apps[0]
    const pkg = appInfo.packageName

    const dataRes = await fetch(`https://f-droid.org/api/v1/packages/${pkg}`)
    if (!dataRes.ok) throw new Error("Error al obtener datos desde f-droid.org")
    const app = await dataRes.json()

    if (!app || !app.packages || !app.packages.length) {
      return m.reply("⚠️ No se encontraron versiones para esta aplicación.", m)
    }

    const versions = app.packages.slice().reverse() // más recientes primero

    // Mostrar hasta 20 versiones para evitar mensajes enormes
    const maxShow = 20
    const shown = versions.slice(0, maxShow)

    const listado = shown.map((v, i) => `*${i + 1}.* v${v.versionName} — ${(v.size/1024/1024).toFixed(2)} MB`).join("\n")

    const extra = versions.length > maxShow ? `\n\n⚠️ Se muestran las ${maxShow} versiones más recientes de ${versions.length} totales.` : ""

    const caption = `
🟦 *F-DROID — RESULTADO*
📌 *Nombre:* ${app.name}
📦 *Paquete:* ${pkg}
🔰 *Versión más reciente:* v${versions[0].versionName}

*Instrucciones:*
1) Copia el paquete (arriba).
2) Ejecuta el comando: ${usedPrefix}fdroidsel ${pkg} <número>
   Ejemplo: ${usedPrefix}fdroidsel ${pkg} 1

*Lista de versiones (elige número):*
${listado}
${extra}
`.trim()

    // Enviar info (quoted para contexto)
    await conn.reply(m.chat, caption, m)
    await m.react("✅")
  } catch (e) {
    console.error("[fdroid] ", e)
    try { await m.react("❌") } catch {}
    m.reply(`❌ Error: ${e.message}`, m)
  }
}

handler.command = ["fdroid", "apkfdroid", "fapk"]
export default handler