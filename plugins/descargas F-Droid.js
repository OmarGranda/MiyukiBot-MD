// plugins/fdroidsel.js
import fetch from "node-fetch"

let handler = async (m, { text, conn, usedPrefix }) => {
  try {
    if (!text || !text.trim()) return m.reply(`🟢 *Uso:* ${usedPrefix}fdroidsel <paquete> <número>\nEjemplo:\n${usedPrefix}fdroidsel com.termux 1`, m)

    const parts = text.trim().split(/\s+/)
    if (parts.length < 2) return m.reply(`❗ Falta el número o paquete.\nUso: ${usedPrefix}fdroidsel <paquete> <número>`, m)

    const pkg = parts[0]
    const num = Number(parts[1])

    if (!pkg) return m.reply("❗ Paquete inválido.", m)
    if (isNaN(num) || num < 1) return m.reply("❗ Número de versión inválido.", m)

    await m.react("🕓")

    // Obtener info del paquete
    const infoRes = await fetch(`https://f-droid.org/api/v1/packages/${pkg}`)
    if (!infoRes.ok) {
      return m.reply("❌ No se pudo obtener información del paquete en F-Droid (paquete no existe o error de red).", m)
    }
    const app = await infoRes.json()

    if (!app || !app.packages || !app.packages.length) {
      return m.reply("⚠️ No se encontraron versiones para este paquete.", m)
    }

    const versions = app.packages.slice().reverse() // índices: 1 = más reciente

    if (num > versions.length) return m.reply(`❌ Número inválido. Este paquete tiene ${versions.length} versiones disponibles.`, m)

    const selected = versions[num - 1]

    // Tamaño de seguridad
    const sizeMB = (selected.size / 1024 / 1024)
    const MAX_MB = 400 // ajusta si quieres enviar más grande
    if (sizeMB > MAX_MB) {
      return m.reply(`⚠️ El APK seleccionado pesa ${sizeMB.toFixed(1)} MB — supera el límite de ${MAX_MB} MB configurado en el bot. Si quieres cambiar el límite edita MAX_MB en el plugin.`, m)
    }

    // Enviar el APK (F-Droid proporciona url directa)
    await conn.sendMessage(
      m.chat,
      {
        document: { url: selected.apkUrl },
        mimetype: "application/vnd.android.package-archive",
        fileName: `${app.name}_v${selected.versionName}.apk`,
        caption: `✅ Descarga desde F-Droid\n📌 ${app.name}\n🆔 v${selected.versionName}\n📦 ${sizeMB.toFixed(2)} MB`
      },
      { quoted: m }
    )

    await m.react("✅")
  } catch (e) {
    console.error("[fdroidsel] ", e)
    try { await m.react("❌") } catch {}
    m.reply(`❌ Ocurrió un error: ${e.message}`, m)
  }
}

handler.command = ["fdroidsel", "fdselect", "fd-download"]
export default handler