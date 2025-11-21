var handler = async (m, { conn, usedPrefix }) => {
  // Obtener JID objetivo (mencionado o citado)
  let user = (m.mentionedJid && m.mentionedJid[0]) || (m.quoted && m.quoted.sender) || null
  if (!user) return conn.reply(m.chat, `❀ Debes mencionar a un usuario para poder expulsarlo del grupo.`, m)

  try {
    const groupInfo = await conn.groupMetadata(m.chat)

    // Determinar owner/creator del grupo (varios campos según la versión de la librería)
    const ownerGroup =
      groupInfo.owner ||
      groupInfo.creator ||
      (groupInfo.participants && groupInfo.participants.find(p => p.isOwner)?.jid) ||
      (m.chat.split`-`[0] + '@s.whatsapp.net')

    // Buscar participantes en metadata
    const participants = groupInfo.participants || []
    const botParticipant = participants.find(p => p.jid === conn.user.jid) || {}
    const targetParticipant = participants.find(p => p.jid === user) || {}

    // Owner del bot (fallback seguro)
    const ownerBot = (global.owner && global.owner[0] && global.owner[0][0] ? global.owner[0][0] : '') + '@s.whatsapp.net'

    // Comprobaciones previas
    if (user === conn.user.jid)
      return conn.reply(m.chat, `ꕥ No puedo eliminar el bot del grupo.`, m)

    if (user === ownerGroup)
      return conn.reply(m.chat, `ꕥ No puedo eliminar al propietario del grupo.`, m)

    if (user === ownerBot)
      return conn.reply(m.chat, `ꕥ No puedo eliminar al propietario del bot.`, m)

    // Comprobar que el bot es admin
    // En algunas versiones p.admin puede ser 'admin' o 'superadmin' o true; comprobamos su existencia
    const botIsAdmin = !!(botParticipant && (botParticipant.admin === 'superadmin' || botParticipant.admin === 'admin' || botParticipant.isAdmin === true || botParticipant.admin))
    if (!botIsAdmin)
      return conn.reply(m.chat, `⚠︎ El bot no tiene permisos de administrador en este grupo. Dale permisos de admin y prueba de nuevo.`, m)

    // Comprobar que el objetivo NO es admin
    const targetIsAdmin = !!(targetParticipant && (targetParticipant.admin === 'superadmin' || targetParticipant.admin === 'admin' || targetParticipant.isAdmin === true || targetParticipant.admin))
    if (targetIsAdmin)
      return conn.reply(m.chat, `⚠︎ No puedo expulsar a un administrador. Sólo el creador del grupo puede hacerlo o primero hay que bajar sus permisos.`, m)

    // Intentar expulsar
    await conn.groupParticipantsUpdate(m.chat, [user], 'remove')

    // Confirmación
    conn.reply(m.chat, `✔️ Usuario expulsado correctamente.`, m)
  } catch (e) {
    // Mensaje más útil en caso de not-authorized
    if (String(e).toLowerCase().includes('not-authorized')) {
      // Intentar extraer info de depuración y avisar al admin
      let debug = ''
      try {
        const gi = await conn.groupMetadata(m.chat)
        const botPart = gi.participants.find(p => p.jid === conn.user.jid) || {}
        debug = `\n\nDEBUG:\n- botAdmin: ${!!(botPart && (botPart.admin || botPart.isAdmin))}\n- groupOwner: ${gi.owner || gi.creator || 'unknown'}`
      } catch (_) { /* ignore */ }

      return conn.reply(
        m.chat,
        `⚠︎ Se ha producido un problema: not-authorized.\n` +
        `Posibles causas:\n` +
        `• El bot no es admin del grupo.\n` +
        `• El usuario objetivo es admin/propietario del grupo.\n\n` +
        `> Usa *${usedPrefix}report* para informarlo.` +
        debug,
        m
      )
    }

    // Mensaje genérico con el error
    conn.reply(
      m.chat,
      `⚠︎ Se ha producido un problema.\n> Usa *${usedPrefix}report* para informarlo.\n\n${e.message || e}`,
      m
    )
  }
}

handler.help = ['kick']
handler.tags = ['grupo']
handler.command = ['kick', 'echar', 'hechar', 'sacar', 'ban']
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler