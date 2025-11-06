import fetch from "node-fetch"

/**
 * Plugin: fdroid.js
 * Uso:
 *  .fdroid <nombre>    -> lista versiones (responde/quote con el número)
 *
 * NOTA: Para seleccionar una versión debes *responder/citar* el mensaje
 * que muestra la lista con el número de la versión (ej: "3").
 */

let handler = async (m, { text, conn }) => {
  try {
    // Si el mensaje es una respuesta (quote) al mensaje de la lista y el texto es número -> proceso de descarga
    if (m.quoted && text && /^\d+$/.test(text.trim())) {
      // Buscar el marcador con el package dentro del mensaje citado
      const quotedText = m.quoted.text || ""
      const match = quotedText.match(/--fdroid-pkg:([^\s\-]+)--/)
      if (!match) {
        return m.reply("❌ Esta respuesta no corresponde a una lista de F-Droid. Por favor usa primero: .fdroid <nombre>", m)
      }

      const pkg = match[1]
      const choice = Number(text.trim())

      await m.react("🕓")

      // Obtener información actualizada del paquete
      const infoRes = await fetch(`https://f-droid.org/api/v1/packages/${pkg}`)
      if (!infoRes.ok) throw new Error("No se pudo obtener información del paquete desde F-Droid.")
      const app = await infoRes.json()

      if (!app || !app.packages || !app.packages.length) {
        return m.reply("⚠️ No se encontraron versiones para este paquete.", m)
      }

      const versions = app.packages.slice().reverse() // más recientes primero

      if (choice < 1 || choice > versions.length) {
        return m.reply(`❌ Número inválido. Debes escoger entre 1 y ${versions.length}.`, m)
      }

      const selected = versions[choice - 1]

      // Seguridad: bloquear envíos de APKs enormes (opcional)
      const sizeMB = (selected.size / 1024 / 1024)
      if (sizeMB > 400) {
        // Umbral 400 MB (ajusta si quieres otro límite)
        return m.reply(`⚠️ El APK seleccionado pesa ${sizeMB.toFixed(1)} MB — demasiado grande para enviar por el bot.`, m)
      }

      // Enviar APK como documento usando el enlace directo de F-Droid
      await conn.sendMessage(
        m.chat,
        {
          document: { url: selected.apkUrl },
          mimetype: "application/vnd.android.package-archive",
          fileName: `${app.name}_v${selected.versionName}.apk`,
          caption: `✅ *Descarga desde F-Droid* \n📌 ${app.name}\n🆔 v${selected.versionName}\n📦 ${(selected.size/1024/1024).toFixed(2)} MB`
        },
        { quoted: m }
      )
      await m.react("✅")
      return
    }

    // ---- flujo de búsqueda ----
    if (!text || !text.trim()) {
      return m.reply(`🟢 *Uso:* .fdroid nombre_de_app\n\nEjemplo:\n.fdroid termux`, m)
    }

    await m.react("🕓")

    // Buscar usando el nuevo endpoint de búsqueda
    const searchRes = await fetch(`https://search.f-droid.org/?q=${encodeURIComponent(text.trim())}&json=1`)
    if (!searchRes.ok) throw new Error("Error en la búsqueda a search.f-droid.org")
    const searchJson = await searchRes.json()

    if (!searchJson.apps || searchJson.apps.length === 0) {
      return m.reply(`❌ No encontré resultados para: *${text}*`, m)
    }

    // Tomamos la primera coincidencia (puedes ampliar lógica para mostrar varios resultados)
    const appInfo = searchJson.apps[0]
    const pkg = appInfo.packageName

    // Obtener detalles y versiones
    const dataRes = await fetch(`https://f-droid.org/api/v1/packages/${pkg}`)
    if (!dataRes.ok) throw new Error("No se pudo obtener la información del paquete en F-Droid.")
    const app = await dataRes.json()

    if (!app || !app.packages || !app.packages.length) {
      return m.reply("⚠️ No se pudo obtener versiones de la aplicación.", m)
    }

    const versions = app.packages.slice().reverse() // más recientes arriba

    // Limitar a las primeras 20 versiones para no enviar un mensaje enorme
    const maxShow = 20
    const show = versions.slice(0, maxShow)

    const listado = show
      .map((v, i) => `*${i + 1}.* v${v.versionName} — ${(v.size / 1024 / 1024).toFixed(2)} MB`)
      .join("\n")

    let extraNote = ""
    if (versions.length > maxShow) extraNote = `\n\n⚠️ Se muestran las ${maxShow} versiones más recientes de ${versions.length} disponibles. Si quieres otra versión, indica su número relativo a esta lista.`

    // Marcador con package para identificar la lista cuando el usuario responda (es OK que sea visible)
    const marker = `\n\n--fdroid-pkg:${pkg}--`

    const caption = `
🟦 *F-DROID — RESULTADO*
📌 *Nombre:* ${app.name}
📦 *Paquete:* ${pkg}
🔰 *Versión más reciente:* v${versions[0].versionName}
\n*Responde (cita este mensaje) con el número de la versión a descargar:*\n
${listado}
${extraNote}
${marker}
`.trim()

    // Enviamos la lista (el usuario debe RESPONDER / CITAR este mensaje con el número)
    await conn.reply(m.chat, caption, m)
    await m.react("✅")
  } catch (e) {
    console.error("[fdroid plugin] ", e)
    try { await m.react("❌") } catch {}
    m.reply(`❌ Ocurrió un error:\n${e.message}`, m)
  }
}

handler.command = ["fdroid", "apkfdroid", "fapk"]
export default handler