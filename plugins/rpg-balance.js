let handler = async (m, { conn, usedPrefix }) => {
  if (!db.data.chats[m.chat].economy && m.isGroup) {
    return m.reply(`🚫 *Los comandos de Economía están desactivados en este grupo.*\n\n💡 Un *administrador* puede activarlos con:\n» *${usedPrefix}economy on*`)
  }

  let mentionedJid = await m.mentionedJid
  let who = mentionedJid[0] ? mentionedJid[0] : m.quoted ? await m.quoted.sender : m.sender

  if (!(who in global.db.data.users)) return m.reply(`❌ *El usuario no se encuentra en mi base de datos.*`)

  let user = global.db.data.users[who]
  let name = await (async () => user.name || (async () => { 
    try { 
      const n = await conn.getName(who)
      return typeof n === 'string' && n.trim() ? n : who.split('@')[0] 
    } catch { 
      return who.split('@')[0] 
    } 
  })())()

  // Datos del usuario
  let coin = user.coin || 0
  let bank = user.bank || 0
  let total = coin + bank
  let level = user.level || 1
  let exp = user.exp || 0
  let rank = user.rank || "👤 Civil"
  let currency = "💴"

  // Texto estético
  const texto = `🌸 *Perfil Financiero de ${name}* 🌸

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
⚙️ *Comandos útiles:* *${usedPrefix}work*, *${usedPrefix}rob*, *${usedPrefix}daily*
`

  await conn.sendMessage(m.chat, {
    image: { url: 'https://qu.ax/qKZek.jpg' }, // puedes cambiar la imagen por otra más bonita
    caption: texto,
    fileName: 'balance.jpg',
    mentions: [who],
    ...rcanal
  }, { quoted: m })
}

handler.help = ['bal']
handler.tags = ['rpg']
handler.command = ['bal', 'balance', 'bank']
handler.group = true

export default handler