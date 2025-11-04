let handler = async (m, { conn, participants, groupMetadata }) => {
  try {
    await m.react('🕒') // Reacción inicial
    
    // Verifica que el comando se use en un grupo
    if (!m.isGroup) {
      await m.reply('⚠️ Este comando solo puede usarse en grupos.')
      return
    }

    const group = groupMetadata || (await conn.groupMetadata(m.chat))
    const participantList = group.participants || []

    // Obtener usuario mencionado, citado o el mismo remitente
    const mentionedJid = 
      (m.mentionedJid && m.mentionedJid[0]) || 
      (m.quoted ? m.quoted.sender : m.sender)
    
    // Normalizar los IDs (asegura que coincidan)
    const normalize = jid => jid?.replace(/[^0-9]/g, '') // solo números
    const user = participantList.find(p => normalize(p.id) === normalize(mentionedJid))

    if (!user) {
      await conn.sendMessage(m.chat, {
        text: `⚠️ *No se encontró el usuario en el grupo.*\n\nVerifica que estés mencionando correctamente o que el usuario aún esté en el grupo.`,
      }, { quoted: m })
      await m.react('✖️')
      return
    }

    // Simulamos un LID (puedes reemplazarlo con tu propio sistema)
    const lid = user.lid || `LID-${Math.floor(Math.random() * 100000)}`
    const displayName = (await conn.getName(mentionedJid)) || mentionedJid.split('@')[0]

    // Mensaje bonito
    const msg = `
╭───❀ *LID DEL USUARIO* ❀───╮
│ 👤 *Usuario:* @${mentionedJid.split('@')[0]}
│ 🏷️ *Nombre:* ${displayName}
│ 🆔 *LID:* ${lid}
│ 🕓 *Consultado:* ${new Date().toLocaleString('es-ES')}
╰──────────────────────────╯
`.trim()

    await conn.sendMessage(m.chat, { 
      text: msg, 
      mentions: [mentionedJid] 
    }, { quoted: m })

    await m.react('✅')

  } catch (error) {
    console.error(error)
    await conn.sendMessage(m.chat, { 
      text: `❌ *Error inesperado:*\n${error.message}` 
    }, { quoted: m })
    await m.react('✖️')
  }
}

// 📚 Configuración del comando
handler.command = ['lid', 'mylid']
handler.help = ['lid', 'mylid']
handler.tags = ['tools']
handler.group = true

export default handler