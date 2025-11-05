// Baltop mejorado: muestra top económico, con emojis y una sola imagen (top #1)
import fs from 'fs'

let handler = async (m, { conn, args, usedPrefix }) => {
  // Verificar que la base de datos exista y obtener settings
  const dbChats = global.db?.data?.chats
  const dbUsers = global.db?.data?.users
  const settings = global.db?.data?.settings || {}

  if (!dbChats || !dbUsers) return m.reply('❌ Base de datos no disponible.')

  // Comprobar si la economía está activada en el chat (si es grupo)
  if (!dbChats[m.chat]?.economy && m.isGroup) {
    return m.reply(
      `《✦》Los comandos de *Economía* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}economy on*`
    )
  }

  const currencySymbol = settings.currency || '¥'

  // Construir array de usuarios con datos seguros
  const users = Object.entries(dbUsers).map(([jid, data]) => ({
    jid,
    name: (data && data.name) ? data.name : null,
    coin: (data && data.coin) ? Number(data.coin) : 0,
    bank: (data && data.bank) ? Number(data.bank) : 0,
    rchan: (data && data.rchan) ? data.rchan : null,
    profile: (data && data.profile) ? data.profile : null
  }))

  if (users.length === 0) return m.reply('❌ No hay usuarios registrados.')

  // Ordenar por riqueza total (coin + bank)
  const sorted = users.sort((a, b) => (b.coin + b.bank) - (a.coin + a.bank))

  // Paginación segura
  const pageArg = parseInt(args[0]) || 1
  const totalPages = Math.max(1, Math.ceil(sorted.length / 10))
  const page = Math.max(1, Math.min(pageArg, totalPages))
  const startIndex = (page - 1) * 10
  const endIndex = startIndex + 10
  const slice = sorted.slice(startIndex, endIndex)

  // Determinar la imagen: avatar del top1 o imagen por defecto
  let imageUrl = null
  try {
    const top1 = sorted[0]
    if (top1 && top1.profile) {
      // Si guardaron una ruta local o url en user.profile
      imageUrl = top1.profile
    } else if (top1 && top1.jid) {
      // Intentar obtener la foto de perfil vía conn (Baileys)
      try {
        if (typeof conn.profilePictureUrl === 'function') {
          imageUrl = await conn.profilePictureUrl(top1.jid, 'image') // Baileys v4+ / v5+
        } else if (typeof conn.getProfilePicture === 'function') {
          imageUrl = await conn.getProfilePicture(top1.jid)
        } else {
          imageUrl = null
        }
      } catch (e) {
        imageUrl = null
      }
    }
  } catch (e) {
    imageUrl = null
  }

  // Imagen por defecto si no hay ninguna
  if (!imageUrl) {
    imageUrl = 'https://qu.ax/BTDrk.jpg' // cámbiala si quieres otra
  }

  // Construir texto del leaderboard con emojis y formato claro
  let text = ''
  text += `╔═══ ✦ *TOP ECONÓMICO* ✦ ═══\n`
  text += `║ 🪙 Moneda: *${currencySymbol}*\n`
  text += `║ 👥 Usuarios: *${users.length}*\n`
  text += `║ 📄 Página: *${page}* / *${totalPages}*\n`
  text += `╠════════════════════════\n`

  // Rellenar con cada usuario de la página
  for (let i = 0; i < slice.length; i++) {
    const user = slice[i]
    // Obtener nombre (si no existe, tratar de pedirlo por conn.getName)
    let name = user.name
    if (!name) {
      try {
        const maybeName = await conn.getName(user.jid)
        name = (typeof maybeName === 'string' && maybeName.trim()) ? maybeName.trim() : user.jid.split('@')[0]
      } catch (e) {
        name = user.jid.split('@')[0]
      }
    }

    const total = (Number(user.coin) || 0) + (Number(user.bank) || 0)

    // Emoji por posición global (sólo top 1-5 muestran iconos especiales en la página 1)
    const globalIndex = startIndex + i + 1
    let posEmoji = '🎖️'
    if (globalIndex === 1) posEmoji = '👑'
    else if (globalIndex === 2) posEmoji = '💎'
    else if (globalIndex === 3) posEmoji = '🥇'
    else if (globalIndex === 4) posEmoji = '🥈'
    else if (globalIndex === 5) posEmoji = '🥉'

    text += `║ ${posEmoji} *${globalIndex}.* ${name}\n`
    text += `║    ┣ Total: *${currencySymbol}${total.toLocaleString()}*\n`
    text += `║    ┣ Monedero: ${currencySymbol}${(user.coin || 0).toLocaleString()}\n`
    text += `║    ┗ Banco: ${currencySymbol}${(user.bank || 0).toLocaleString()}\n`
    if (user.rchan) text += `║    ┗ Canal/Rango: *${user.rchan}*\n`
    text += `╠────────────────────────\n`
  }

  text += `║ Usa *${usedPrefix}baltop [número]* para cambiar de página\n`
  text += `╚════════════════════════\n`

  // Preparar menciones (para notificar a los usuarios listados)
  const mentions = slice.map(u => u.jid).filter(Boolean)

  // Enviar: una sola imagen + texto (mencionando a los usuarios de la página)
  try {
    await conn.sendFile(m.chat, imageUrl, 'baltop.jpg', text.trim(), m, false, { mentions })
  } catch (err) {
    // Si falla enviar con sendFile (por ejemplo imagen inválida), enviar solo texto
    await conn.reply(m.chat, text.trim(), m, { mentions })
  }
}

handler.help = ['baltop [página]']
handler.tags = ['rpg', 'economía']
handler.command = ['baltop', 'eboard', 'economyboard']
handler.group = true

export default handler