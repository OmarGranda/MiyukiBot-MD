// mapa: chatId -> Set de JIDs muteados
let mutedUsers = global.mutedUsers || (global.mutedUsers = new Map())

let handler = async (m, { conn, command, usedPrefix, args }) => {
  // validaciones básicas
  if (!m.isGroup) return m.reply('*Este comando solo funciona en grupos.*')
  if (!m.isAdmin && !m.key.fromMe) return m.reply('*Solo administradores pueden usar este comando.*')

  const chat = m.chat

  // obtener mencionado de forma segura
  const mentioned = Array.isArray(m.mentionedJid) && m.mentionedJid.length ? m.mentionedJid[0] : null

  // construir JID a partir de args[0] si no hay mención
  let user = mentioned || (args[0] ? (args[0].includes('@') ? args[0] : args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net') : '')

  if (!user) return m.reply(`*Uso correcto:*\n${usedPrefix + command} @usuario`)

  // asegurarnos de tener un Set para este chat
  if (!mutedUsers.has(chat)) mutedUsers.set(chat, new Set())
  const set = mutedUsers.get(chat)

  if (command === 'mute') {
    if (set.has(user)) return m.reply('*Ese usuario ya está muteado.* ✅')
    set.add(user)
    return m.reply(
      `🔇 *Usuario muteado correctamente*\n\nEl bot ahora borrará todos los mensajes de:\n@${user.split('@')[0]}`,
      { mentions: [user] }
    )
  }

  if (command === 'unmute') {
    if (!set.has(user)) return m.reply('*Ese usuario no está muteado.* ❌')
    set.delete(user)
    return m.reply(
      `🔊 *Mute desactivado*\n\nAhora el bot dejará de borrar mensajes de:\n@${user.split('@')[0]}`,
      { mentions: [user] }
    )
  }
}

handler.help = ['mute @usuario', 'unmute @usuario']
handler.tags = ['group', 'admin']
handler.command = ['mute', 'unmute']
handler.group = true
handler.admin = true

export default handler