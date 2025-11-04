let handler = async (m, { conn, args, usedPrefix }) => {
  // Verificar si el sistema de economía está activado
  if (!global.db.data.chats[m.chat].economy && m.isGroup) {
    return m.reply(`⚠️ *Los comandos de Economía están desactivados en este grupo.*\n\n🧩 Un *administrador* puede activarlos usando:\n> *${usedPrefix}economy on*`)
  }

  const currency = global.db.data.settings?.currency || '¥' // símbolo por defecto

  // Obtener todos los usuarios registrados
  const users = Object.entries(global.db.data.users)
    .map(([jid, data]) => ({
      jid,
      name: data.name || jid.split('@')[0],
      coin: data.coin || 0,
      bank: data.bank || 0
    }))

  // Ordenar por la suma total (coin + bank)
  const sorted = users.sort((a, b) => (b.coin + b.bank) - (a.coin + a.bank))

  // Paginación
  const totalPages = Math.ceil(sorted.length / 10)
  const page = Math.max(1, Math.min(parseInt(args[0]) || 1, totalPages))
  const startIndex = (page - 1) * 10
  const endIndex = startIndex + 10
  const slice = sorted.slice(startIndex, endIndex)

  // Construcción del texto del leaderboard
  let text = `╭━〔 💰 *RANKING ECONÓMICO* 💰 〕━╮\n`
  text += `│ 📊 Top de los más ricos del servidor\n│\n`

  for (let i = 0; i < slice.length; i++) {
    const { jid, name, coin, bank } = slice[i]
    const total = coin + bank

    // Decoración según posición
    let medal = ''
    if (i === 0 && page === 1) medal = '🥇'
    else if (i === 1 && page === 1) medal = '🥈'
    else if (i === 2 && page === 1) medal = '🥉'
    else medal = '🎖️'

    text += `│ ${medal} *${startIndex + i + 1}.* ${name}\n`
    text += `│ 💵 Total: *${currency}${total.toLocaleString()}*\n`
    text += `│ ┣━ 💰 Monedero: *${currency}${coin.toLocaleString()}*\n`
    text += `│ ┗━ 🏦 Banco: *${currency}${bank.toLocaleString()}*\n│\n`
  }

  text += `╰━━━━━━━━━━━━━━━━━━━━━━╯\n`
  text += `📑 Página *${page}* de *${totalPages}*\n`
  text += `Usa *${usedPrefix}baltop [número]* para cambiar de página.`

  await conn.reply(m.chat, text.trim(), m, { mentions: slice.map(u => u.jid) })
}

handler.help = ['baltop [página]']
handler.tags = ['rpg', 'economía']
handler.command = ['baltop', 'eboard', 'economyboard']
handler.group = true

export default handler