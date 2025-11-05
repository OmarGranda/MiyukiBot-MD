let mutedUsers = global.mutedUsers || (global.mutedUsers = new Set())

let handler = async (m, { conn, command, usedPrefix, args }) => {
  if (!m.isGroup) return m.reply('*Este comando solo funciona en grupos.*')
  if (!m.isAdmin && !m.key.fromMe) return m.reply('*Solo administradores pueden usar este comando.*')
  
  let user = m.mentionedJid[0] || (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : '')
  if (!user) return m.reply(`*Uso correcto:*\n${usedPrefix + command} @usuario`)

  if (command == 'mute') {
    if (mutedUsers.has(user)) return m.reply('*Ese usuario ya está muteado.* ✅')
    mutedUsers.add(user)
    return m.reply(`🔇 *Usuario muteado correctamente*\n\nEl bot ahora borrará todos los mensajes de:\n@${user.split('@')[0]}`, { mentions: [user] })
  }

  if (command == 'unmute') {
    if (!mutedUsers.has(user)) return m.reply('*Ese usuario no está muteado.* ❌')
    mutedUsers.delete(user)
    return m.reply(`🔊 *Mute desactivado*\n\nAhora el bot dejará de borrar mensajes de:\n@${user.split('@')[0]}`, { mentions: [user] })
  }
}

handler.help = ['mute @usuario', 'unmute @usuario']
handler.tags = ['group', 'admin']
handler.command = ['mute', 'unmute']
handler.group = true
handler.admin = true

export default handler