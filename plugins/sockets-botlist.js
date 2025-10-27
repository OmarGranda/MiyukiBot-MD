import ws from "ws"

const handler = async (m, { conn, usedPrefix, participants }) => {
  try {
    global.conns = global.conns || []
    const MAX_SUBBOTS = 3

    // 🌍 Detección de país por prefijo
    const detectarPais = (numero) => {
      const codigos = {
        "1": "🇺🇸 EE.UU / 🇨🇦 Canadá",
        "7": "🇷🇺 Rusia / 🇰🇿 Kazajistán",
        "20": "🇪🇬 Egipto",
        "27": "🇿🇦 Sudáfrica",
        "30": "🇬🇷 Grecia",
        "31": "🇳🇱 Países Bajos",
        "32": "🇧🇪 Bélgica",
        "33": "🇫🇷 Francia",
        "34": "🇪🇸 España",
        "36": "🇭🇺 Hungría",
        "39": "🇮🇹 Italia",
        "40": "🇷🇴 Rumania",
        "44": "🇬🇧 Reino Unido",
        "49": "🇩🇪 Alemania",
        "51": "🇵🇪 Perú",
        "52": "🇲🇽 México",
        "54": "🇦🇷 Argentina",
        "55": "🇧🇷 Brasil",
        "56": "🇨🇱 Chile",
        "57": "🇨🇴 Colombia",
        "58": "🇻🇪 Venezuela",
        "591": "🇧🇴 Bolivia",
        "593": "🇪🇨 Ecuador",
        "595": "🇵🇾 Paraguay",
        "598": "🇺🇾 Uruguay",
        "502": "🇬🇹 Guatemala",
        "503": "🇸🇻 El Salvador",
        "504": "🇭🇳 Honduras",
        "505": "🇳🇮 Nicaragua",
        "506": "🇨🇷 Costa Rica",
        "507": "🇵🇦 Panamá",
        "53": "🇨🇺 Cuba",
        "60": "🇲🇾 Malasia",
        "61": "🇦🇺 Australia",
        "62": "🇮🇩 Indonesia",
        "63": "🇵🇭 Filipinas",
        "64": "🇳🇿 Nueva Zelanda",
        "65": "🇸🇬 Singapur",
        "66": "🇹🇭 Tailandia",
        "81": "🇯🇵 Japón",
        "82": "🇰🇷 Corea del Sur",
        "84": "🇻🇳 Vietnam",
        "86": "🇨🇳 China",
        "90": "🇹🇷 Turquía",
        "91": "🇮🇳 India",
        "92": "🇵🇰 Pakistán",
        "93": "🇦🇫 Afganistán",
        "94": "🇱🇰 Sri Lanka",
        "212": "🇲🇦 Marruecos",
        "213": "🇩🇿 Argelia",
        "216": "🇹🇳 Túnez",
        "218": "🇱🇾 Libia",
        "234": "🇳🇬 Nigeria",
        "254": "🇰🇪 Kenia",
        "255": "🇹🇿 Tanzania",
        "256": "🇺🇬 Uganda",
        "258": "🇲🇿 Mozambique",
        "260": "🇿🇲 Zambia",
        "263": "🇿🇼 Zimbabue",
      }
      for (const code in codigos) {
        if (numero.startsWith(code)) return codigos[code]
      }
      return "🌎 Desconocido"
    }

    // 🕒 Conversor de tiempo
    const convertirMsADiasHorasMinutosSegundos = (ms) => {
      const segundos = Math.floor(ms / 1000)
      const minutos = Math.floor(segundos / 60)
      const horas = Math.floor(minutos / 60)
      const días = Math.floor(horas / 24)
      const segRest = segundos % 60
      const minRest = minutos % 60
      const horasRest = horas % 24
      let resultado = ""
      if (días) resultado += `${días}d `
      if (horasRest) resultado += `${horasRest}h `
      if (minRest) resultado += `${minRest}m `
      if (segRest) resultado += `${segRest}s`
      return resultado.trim() || "recién iniciado"
    }

    // 📡 Lista de bots activos
    const allBots = [
      global.conn.user.jid,
      ...new Set(
        global.conns
          .filter(c => c.user && c.ws?.socket && c.ws.socket.readyState !== ws.CLOSED)
          .map(c => c.user.jid)
      )
    ]

    // 🧩 Datos del BOT PRINCIPAL
    const mainNumber = global.conn.user.jid.replace(/[^0-9]/g, '')
    const mainName = global.conn.user.name || "Bot Principal"
    const mainCountry = detectarPais(mainNumber)
    const mainUptime = convertirMsADiasHorasMinutosSegundos(Date.now() - (global.conn.startTime || global.conn.uptime || 0))

    // 🤖 SubBots activos
    const subBots = global.conns
      .filter(c => c.user && c.ws?.socket && c.ws.socket.readyState !== ws.CLOSED)
      .map((c, i) => {
        const numero = c.user.jid.replace(/[^0-9]/g, '')
        const nombre = c.user.name || `SubBot #${i + 1}`
        const pais = detectarPais(numero)
        const uptime = c.uptime
          ? convertirMsADiasHorasMinutosSegundos(Date.now() - c.uptime)
          : "Activo recientemente"
        return `
╭─『 🤖 SubBot #${i + 1} 』
│ 👤 Nombre: *${nombre}*
│ 📞 Número: +${numero}
│ 🌍 País: ${pais}
│ ⏱ Activo: ${uptime}
╰───────────────`
      })

    // 📊 Cupos
    const usados = subBots.length
    const libres = Math.max(0, MAX_SUBBOTS - usados)

    // 💬 Bots dentro del grupo
    let groupBots = allBots.filter(bot => participants.some(p => p.id === bot))
    if (!groupBots.includes(global.conn.user.jid)) groupBots.push(global.conn.user.jid)
    const groupBotsText = groupBots.map(bot => `• +${bot.replace(/[^0-9]/g, '')}`).join("\n") || "Ninguno"

    // ✨ DISEÑO FINAL DEL PANEL
    const message = `
━━━━━━━━━━━━━━━━━━
🌐 *PANEL DE BOTS ACTIVOS *
━━━━━━━━━━━━━━━━━━

🟢 *BOT PRINCIPAL*
━━━━━━━━━━━━━━━━━━
👤 Nombre: *${mainName}*
📞 Número: +${mainNumber}
🌍 País: ${mainCountry}
⏱ Uptime: ${mainUptime}

━━━━━━━━━━━━━━━━━━
📊 *ESTADO DE CUPOS*
━━━━━━━━━━━━━━━━━━
🔹 Cupos Activos: ${MAX_SUBBOTS}
🔸 Cupos Usados: ${usados}
⚪ Cupos Libres: ${libres}

━━━━━━━━━━━━━━━━━━
🤖 *SUBBOTS CONECTADOS*
━━━━━━━━━━━━━━━━━━
${subBots.length > 0 ? subBots.join("\n") : "✧ No hay SubBots conectados actualmente."}

━━━━━━━━━━━━━━━━━━
💬 *BOTS EN ESTE GRUPO*
━━━━━━━━━━━━━━━━━━
${groupBotsText}
`

    // 📤 Envío con menciones
    const mentionList = allBots.map(bot =>
      bot.endsWith("@s.whatsapp.net") ? bot : `${bot}@s.whatsapp.net`
    )

    await conn.sendMessage(
      m.chat,
      {
        text: message.trim(),
        contextInfo: { mentionedJid: mentionList }
      },
      { quoted: m }
    )

  } catch (error) {
    console.error(error)
    m.reply(`⚠️ Ocurrió un error.\nUsa *${usedPrefix}report* para informarlo.\n\n> ${error.message}`)
  }
}

handler.tags = ["serbot"]
handler.help = ["botlist"]
handler.command = ["botlist", "listbots", "listbot", "bots", "sockets", "socket"]

export default handler