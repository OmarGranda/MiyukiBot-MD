// 📦 handler: Ver tu LID o el de otro usuario en el grupo
let handler = async (m, { conn, participants, groupMetadata }) => {
  try {
    await m.react('🕒') // Reacción inicial

    // Obtener lista de participantes
    const participantList = groupMetadata?.participants || []
    // Obtener usuario mencionado o citado, o el mismo remitente
    const mentionedJid = m.mentionedJid && m.mentionedJid.length > 0 ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : m.sender)
    
    // Buscar participante en la lista
    const participant = participantList.find(p => p.id === mentionedJid)
    
    if (!participant) {
      await conn.sendMessage(m.chat, {
        text: `⚠️ *No se encontró el usuario en el grupo.*\nVerifica que estés mencionando correctamente.`,
      }, { quoted: m })
      await m.react('✖️')
      return
    }

    // No todos los objetos de participante tienen un "lid"
    // Así que lo simularemos con un ejemplo (o usa tu propio sistema de LID)
    const lid = participant.lid || `LID-${Math.floor(Math.random() * 99999)}`

    // 💬 Diseño bonito del mensaje
    const displayName = (await conn.getName(mentionedJid)) || mentionedJid.split('@')[0]
    const message = `
╭─❀ *INFORMACIÓN DE USUARIO* ❀─╮
│ 👤 *Usuario:* @${mentionedJid.split('@')[0]}
│ 🆔 *LID:* ${lid}
│ 🏷️ *Nombre:* ${displayName}
│ 🕓 *Consultado:* ${new Date().toLocaleString('es-ES')}
╰──────────────────────╯
`.trim()

    // Enviar mensaje
    await conn.sendMessage(m.chat, { 
      text: message, 
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

// 📚 Información del comando
handler.command = ['lid', 'mylid']
handler.help = ['lid', 'mylid']
handler.tags = ['tools']
handler.group = true

export default handler