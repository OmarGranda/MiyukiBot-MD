let handler = async (m, { conn, usedPrefix }) => {
  try {
    // Comprueba si la economía está desactivada en el chat (si aplica)
    if (db?.data?.chats?.[m.chat]?.economy === false && m.isGroup) {
      return m.reply(
        `🚫 *Los comandos de Economía están desactivados en este grupo.*\n\n💡 Un administrador puede activarlos con:\n» *${usedPrefix}economy on*`
      )
    }

    // Obtener quién (mencionado / citado / autor)
    const mentioned = Array.isArray(m.mentionedJid) && m.mentionedJid.length
      ? m.mentionedJid[0]
      : m.quoted?.sender
        ? m.quoted.sender
        : m.sender

    const who = mentioned

    // Si no existe el usuario en la base de datos, crea una estructura por defecto
    if (!global.db) global.db = { data: { users: {}, chats: {} } }
    if (!global.db.data.users[who]) {
      // opcional: puedes no crear y en su lugar devolver un mensaje de error
      global.db.data.users[who] = {
        name: who.split('@')[0],
        coin: 0,
        bank: 0,
        level: 1,
        exp: 0,
        rank: '👤 Civil'
      }
    }

    // Nombre (intenta obtener el nombre real desde conn si existe)
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

    // Datos del usuario (con valores por defecto)
    const user = global.db.data.users[who] || {}
    const coin = Number(user.coin) || 0
    const bank = Number(user.bank) || 0
    const total = coin + bank
    const level = Number(user.level) || 1
    const exp = Number(user.exp) || 0
    const rank = user.rank || '👤 Civil'
    // Si en tu proyecto usas una variable global `currency`, úsala; si no, usamos este emoji
    const currency = (typeof global?.currency === 'string' && global.currency) || '¥'

    // Texto estético
    const texto = `💲 *Perfil Financiero de ${name}*

╭─────────────❀
│ 👤 *Usuario:* ${name}
│ 💠 *Rango:* ${rank}
│ 🧩 *Nivel:* ${level}
│ ✨ *Experiencia:* ${exp.toLocaleString()} XP
╰─────────────❀

💰 *Economía Actual* 💰
╭─────────────────
│ 💸 *Cartera:* ${currency}${coin.toLocaleString()}
│ 🏦 *Banco:* ${currency}${bank.toLocaleString()}
│ 💼 *Total:* ${currency}${total.toLocaleString()}
╰─────────────────

🪙 *Consejo:* Usa *${usedPrefix}deposit* para proteger tu dinero.
`

    // Evita fallos si rcanal no está definido (extra puede ser {})
    const extra = typeof rcanal !== 'undefined' ? rcanal : {}

    // Envía el mensaje con imagen (si la url no funciona, cambia por otra)
    await conn.sendMessage(
      m.chat,
      {
        image: { url: 'https://qu.ax/ksVMO.jpg' }, // reemplaza por la imagen que prefieras
        caption: texto,
        fileName: 'balance.jpg',
        mentions: [who],
        ...extra
      },
      { quoted: m }
    )
  } catch (error) {
    console.error('Error en comando bal:', error)
    // Responde al usuario si algo falló
    try {
      await m.reply('❌ Ocurrió un error al mostrar el balance. Revisa la consola del bot.')
    } catch {}
  }
}

handler.help = ['bal']
handler.tags = ['rpg']
handler.command = ['bal', 'balance', 'bank']
handler.group = true

export default handler