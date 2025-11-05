let handler = async (m, { conn, usedPrefix }) => {
  try {
    // Verificar si economía está activada
    if (db?.data?.chats?.[m.chat]?.economy === false && m.isGroup) {
      return m.reply(
        `🚫 *Los comandos de Economía están desactivados en este grupo.*\n\n💡 Un administrador puede activarlos con:\n» *${usedPrefix}economy on*`
      )
    }

    // Detectar usuario
    const mentioned = Array.isArray(m.mentionedJid) && m.mentionedJid.length
      ? m.mentionedJid[0]
      : m.quoted?.sender
        ? m.quoted.sender
        : m.sender

    const who = mentioned

    // Asegurar base de datos
    if (!global.db) global.db = { data: { users: {}, chats: {} } }
    if (!global.db.data.users[who]) {
      global.db.data.users[who] = {
        name: who.split('@')[0],
        coin: 0,
        bank: 0,
        level: 1,
        exp: 0
      }
    }

    // Obtener nombre
    let name = global.db.data.users[who].name
    if (!name || !name.trim()) {
      try {
        const n = await conn.getName?.(who)
        if (typeof n === 'string' && n.trim()) name = n
        else name = who.split('@')[0]
      } catch {
        name = who.split('@')[0]
      }
    }

    // Datos del usuario
    const user = global.db.data.users[who] || {}
    const coin = Number(user.coin) || 0
    const bank = Number(user.bank) || 0
    const total = coin + bank
    const level = Number(user.level) || 1
    const exp = Number(user.exp) || 0
    const currency = '¥'

    // Sistema de rangos según total
    let rank = '🪙 Bronce'
    if (total >= 10000) rank = '💵 Plata'
    if (total >= 50000) rank = '💎 Oro'
    if (total >= 200000) rank = '💠 Platino'
    if (total >= 1000000) rank = '💫 Diamante'
    if (total >= 5000000) rank = '👑 Maestro'
    if (total >= 10000000) rank = '🌌 Leyenda'

    // Texto visual
    const texto = `🏦 *Perfil Financiero de ${name}* 🏦

╭───────────────❀
│ 👤 *Usuario:* ${name}
│ 🏅 *Rango:* ${rank}
│ 🧩 *Nivel:* ${level}
│ ✨ *Experiencia:* ${exp.toLocaleString()} XP
╰───────────────❀

💰 *Economía Actual* 💰
╭──────────────────
│ 💸 *Cartera:* ${currency}${coin.toLocaleString()}
│ 🏦 *Banco:* ${currency}${bank.toLocaleString()}
│ 💼 *Total:* ${currency}${total.toLocaleString()}
╰──────────────────

📈 *Siguiente rango:* ${
      rank === '🌌 Leyenda'
        ? '🏁 Has alcanzado el máximo rango 🎉'
        : rank === '👑 Maestro'
        ? '🌌 Leyenda → 10,000,000¥'
        : rank === '💫 Diamante'
        ? '👑 Maestro → 5,000,000¥'
        : rank === '💠 Platino'
        ? '💫 Diamante → 1,000,000¥'
        : rank === '💎 Oro'
        ? '💠 Platino → 200,000¥'
        : rank === '💵 Plata'
        ? '💎 Oro → 50,000¥'
        : '💵 Plata → 10,000¥'
    }

🪙 *Consejo:* Usa *${usedPrefix}deposit* para proteger tu dinero.
`

    const extra = typeof rcanal !== 'undefined' ? rcanal : {}

    await conn.sendMessage(
      m.chat,
      {
        image: { url: 'https://qu.ax/ksVMO.jpg' }, // Cambia la imagen si deseas otra
        caption: texto,
        mentions: [who],
        ...extra
      },
      { quoted: m }
    )
  } catch (error) {
    console.error('Error en comando bal:', error)
    try {
      await m.reply('❌ Ocurrió un error al mostrar el balance.')
    } catch {}
  }
}

handler.help = ['bal']
handler.tags = ['rpg']
handler.command = ['bal', 'balance', 'bank']
handler.group = true

export default handler