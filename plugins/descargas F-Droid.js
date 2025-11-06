import fetch from "node-fetch"

let handler = async (m, { text, conn }) => {
  if (!text) return m.reply(`🟢 *Uso:* .fdroid nombre_de_app\n\nEjemplo:\n.fdroid termux`)

  await m.react('🕓')

  try {

    // Nuevo buscador de F-Droid
    let search = await fetch(`https://search.f-droid.org/?q=${encodeURIComponent(text)}&json=1`)
    let list = await search.json()

    if (!list.apps || list.apps.length === 0) {
      return m.reply(`❌ No encontré resultados para: *${text}*`, m)
    }

    // Tomar app principal encontrada
    let appInfo = list.apps[0]
    let pkg = appInfo.packageName

    // Obtener detalles y versiones de la app
    let data = await fetch(`https://f-droid.org/api/v1/packages/${pkg}`)
    let app = await data.json()

    if (!app || !app.packages) return m.reply(`⚠ No se pudo obtener información de la app.`, m)

    let versions = app.packages.reverse()
    let listado = versions.map((v, i) => `*${i+1}.* v${v.versionName} — ${(v.size/1024/1024).toFixed(2)} MB`).join("\n")

    let caption = `
🟦 *F-DROID — RESULTADO*
📌 *Nombre:* ${app.name}
📦 *Paquete:* ${pkg}
🌍 *Repositorio:* F-Droid
🔰 *Versión más reciente:* v${versions[0].versionName}

*Elige una versión:* Responde con su número:

${listado}
    `.trim()

    await conn.reply(m.chat, caption, m)

    // Esperar respuesta del usuario
    const res = await conn.waitForMessage(m.chat, m.sender)
    let num = Number(res.text)

    if (isNaN(num) || num < 1 || num > versions.length) {
      return m.reply(`❌ Número inválido. Cancelo.`, m)
    }

    let selected = versions[num - 1]

    await m.react('⬇️')

    await conn.sendMessage(
      m.chat,
      {
        document: { url: selected.apkUrl },
        mimetype: 'application/vnd.android.package-archive',
        fileName: `${app.name}_v${selected.versionName}.apk`,
        caption: `✅ *Descarga completada desde F-Droid*\n📌 *${app.name}* v${selected.versionName}`
      },
      { quoted: m }
    )

    await m.react('✅')

  } catch (e) {
    console.log(e)
    m.reply(`❌ Ocurrió un error:\n${e.message}`, m)
    await m.react('❌')
  }
}

handler.command = ["fdroid", "apkfdroid", "fapk"]
export default handler