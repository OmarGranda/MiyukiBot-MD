import fs from 'fs'

let handler = async (m, { conn, args, usedPrefix }) => {
  const chat = global.db.data.chats[m.chat]
  const settings = global.db.data.settings || {}
  const currency = settings.currency || '¥'
  const economyOn = chat?.economy ?? true

  if (!economyOn && m.isGroup) {
    return m.reply(`⚠️ *Los comandos de Economía están desactivados en este grupo.*\n\n💡 Un *administrador* puede activarlos con:\n> *${usedPrefix}economy on*`)
  }

  // Obtener usuarios registrados
  const users = Object.entries(global.db.data.users)
    .map(([jid, data]) => ({
      jid,
      name: data.name?.trim() || jid.split('@')[0],
      coin: data.coin || 0,
      bank: data.bank || 0,
      rchan: data.rchan || 'Sin rango', // Canal o rango personalizado
      profile: data.profile || null, // Imagen personalizada si existe
    }))

  // Ordenar por riqueza total
  const sorted = users.sort((a, b) => (b.coin + b.bank) - (a.coin + a.bank))

  // Paginación
  const totalPages = Math.ceil(sorted.length / 10)
  const page = Math.max(1, Math.min(parseInt(args[0]) || 1, totalPages))
  const startIndex = (page - 1) * 10
  const endIndex = startIndex + 10
  const slice = sorted.slice(startIndex, endIndex)

  // Encabezado visual
  let text = `╭━━━〔 💰 *RANKING ECONÓMICO GLOBAL* 💰 〕━━━╮\n`
  text += `┃ 📊 Clasificación de los jugadores más ricos\n┃ 🏦 Moneda: ${currency}\n┃ 📅 Total de usuarios: *${users.length}*\n┃\n`

  // Agregar cada jugador
  for (let i = 0; i < slice.length; i++) {
    const { jid, name, coin, bank, rchan } = slice[i]
    const total = coin + bank

    let emoji = ''
    if (i === 0 && page === 1) emoji = '👑'
    else if (i === 1 && page === 1) emoji = '💎'
    else if (i === 2 && page === 1) emoji = '🥇'
    else if (i === 3 && page === 1) emoji = '🥈'
    else if (i === 4 && page === 1) emoji = '🥉'
    else emoji = '🎖️'

    text += `┃ ${emoji} *${startIndex + i + 1}.* ${name}\n`
    text += `┃ ┣ 💰 Total: *${currency}${total.toLocaleString()}*\n`
    text += `┃ ┣ 🪙 Monedero: ${currency}${coin.toLocaleString()}\n`
    text += `┃ ┣ 🏦 Banco: ${currency}${bank.toLocaleString()}\n`
    text += `┃ ┗ 🧩 Canal/Rango: *${rchan}*\n┃\n`
  }

  text += `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n`
  text += `📑 Página *${page}* de *${totalPages}*\n`
  text += `🔁 Usa *${usedPrefix}baltop [número]* para cambiar de página.`

  // Imagen de fondo o del top 1
  const top1 = sorted[0]
  let image = null

  try {
    if (top1.profile) {
      image = top1.profile // si el usuario guardó una imagen personalizada
    } else {
      image = await conn.profilePictureUrl(top1.jid, 'image')
    }
  } catch (e) {
    image = 'https://telegra.ph/file/63b0bdf2a10c21462b5b1.jpg' // imagen por defecto
  }

  await conn.sendFile(m.chat, image, 'ranking.jpg', text.trim(), m, false, { mentions: slice.map(u => u.jid) })
}

handler.help = ['baltop [página]']
handler.tags = ['rpg', 'economía']
handler.command = ['baltop', 'eboard', 'economyboard']
handler.group = true

export default handler