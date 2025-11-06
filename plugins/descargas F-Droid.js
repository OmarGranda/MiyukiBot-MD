import fetch from "node-fetch"

let handler = async (m, { text, conn }) => {
  if (!text) return m.reply(`🟢 *Uso:* .fdroid nombre_de_app\n\nEjemplo:\n.fdroid termux`)

  await m.react('🕓')

  try {
    // Buscar paquetes en F-Droid
    let search = await fetch(`https://f-droid.org/api/v1/search.json?q=${encodeURIComponent(text)}`)
    let data = await search.json()

    if (!data.length) return m.reply(`❌ No encontré resultados para: *${text}*`)

    // Tomar el primer resultado
    let pkg = data[0].packageName
    let info = await fetch(`https://f-droid.org/api/v1/packages/${pkg}`)
    let app = await info.json()

    if (!app) return m.reply(`⚠ No se pudo obtener información del paquete.`)

    let versions = app.packages.reverse() // versiones más recientes arriba
    let list = versions.map((v, i) => `*${i+1}.* v${v.versionName} (${(v.size/1024/1024).toFixed(2)} MB)`).join("\n")

    let caption = `
🟦 *F-DROID — RESULTADO*
📌 *Nombre:* ${app.name}
📦 *Paquete:* ${pkg}
🌍 *Repositorio:* F-Droid
🔰 *Versión más reciente:* v${versions[0].versionName}

*Elige una versión:* Responde con su número:
    
${list}
    `.trim()

    await conn.reply(m.chat, caption, m)

    // Esperar respuesta para elegir versión
    const response = await conn.waitForMessage(m.chat, m.sender)
    let choice = Number(response.text)

    if (isNaN(choice) || choice < 1 || choice > versions.length){
      return m.reply(`❌ Número inválido. Cancelo.`)
    }

    let selected = versions[choice - 1]

    await m.react('⬇️')

    await conn.sendMessage(
      m.chat,
      {
        document: { url: selected.apkUrl },
        mimetype: 'application/vnd.android.package-archive',
        fileName: `${app.name}_v${selected.versionName}.apk`,
        caption: `✅ *Descarga completada desde F-Droid*\n📦 *${app.name}* v${selected.versionName}`
      },
      { quoted: m }
    )

    await m.react('✅')

  } catch (e) {
    console.log(e)
    m.reply(`❌ Ocurrió un error.\n\n${e.message}`)
    await m.react('❌')
  }
}

handler.command = ["fdroid", "apkfdroid", "fapk"]
export default handler