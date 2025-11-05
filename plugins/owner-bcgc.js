// Broadcast to all groups (bcgc)
// Soporta: texto directo o texto citado, flags --mention, --delay, --skip
// Requiere: conn.groupFetchAllParticipating() o similar, conn.sendMessage().
// Diseñado para Baileys-style APIs; adapta si tu librería usa nombres distintos.

const handler = async (m, { conn, isROwner, text }) => {
  // ---------- CONFIG ----------
  if (!isROwner) return m.reply('❌ Solo el/los owner(s) pueden usar este comando.');

  const emoji = '⚡'
  const packname = '\n\n— Enviado por *OmarGranda*'      // texto añadido al final del mensaje
  const imagenURL = ''                           // si pones una URL, enviará imagen + caption. deja vacío para texto
  const DEFAULT_DELAY_MS = 900                   // tiempo entre envíos (ajusta)
  const mentionAllByDefault = false              // si quieres mencionar a todos por defecto
  const skipGroups = []                          // lista de groupIDs a omitir

  // ---------- HELPERS ----------
  const delay = ms => new Promise(res => setTimeout(res, ms))
  const safeToNum = n => Number(n) || 0
  function toNum(number) {
    number = Number(number)
    return number >= 1e6 ? (number / 1e6).toFixed(1) + 'M'
      : number >= 1e3 ? (number / 1e3).toFixed(1) + 'k'
      : number.toString()
  }

  // ---------- PREPARAR MENSAJE ----------
  const rawText = (m.quoted && m.quoted.text) ? m.quoted.text : (text || '').trim()
  if (!rawText && !imagenURL && !(m.quoted && m.quoted.message && Object.keys(m.quoted.message).length > 0)) {
    // Si no hay texto y no hay imagen por URL ni mensaje citado, error
    return m.reply(`${emoji} Te faltó el texto. Usa: .bcgc <texto> o responde a un mensaje con .bcgc`)
  }

  // parse flags en el texto principal (opcional)
  const mentionFlag = (text && text.includes('--mention')) || mentionAllByDefault
  const delayMatch = text?.match(/--delay=(\d{2,5})/)
  const delayMs = delayMatch ? safeToNum(delayMatch[1]) : DEFAULT_DELAY_MS
  const skipMatch = text?.match(/--skip=([^\s]+)/)
  const skipFromText = skipMatch ? skipMatch[1].split(',') : []
  const skipList = Array.from(new Set([...skipGroups, ...skipFromText]))

  // ---------- OBTENER GRUPOS ----------
  let groupsMap = {}
  try {
    if (typeof conn.groupFetchAllParticipating === 'function') {
      groupsMap = await conn.groupFetchAllParticipating()
      // groupFetchAllParticipating suele devolver un objeto { id: metadata }
    } else if (conn.chats && typeof conn.chats === 'object') {
      // Fallback: algunas implementaciones mantienen conn.chats
      groupsMap = conn.chats
    } else {
      // fallback a global.db (si existe) — último recurso
      const fromDb = global?.db?.data?.chats || {}
      groupsMap = Object.fromEntries(Object.keys(fromDb).map(k => [k, { id: k }]))
    }
  } catch (err) {
    return m.reply(`${emoji} Error al obtener grupos: ${err?.message || String(err)}`)
  }

  // Normalizar a array de grupos con id
  const groups = Object.values(groupsMap || {})
    .map(g => (g && g.id) ? g : (g && g.jid ? { id: g.jid } : null))
    .filter(Boolean)
    .filter(g => !skipList.includes(g.id))

  if (!groups.length) return m.reply(`${emoji} No se encontraron grupos para enviar (o fueron omitidos con --skip).`)

  // Reacciona al comando (intento, ignora errores)
  try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch (_) {}

  // ---------- LÓGICA DE ENVÍO ----------
  let sent = 0
  let failed = 0
  const failedList = []

  // Si el usuario respondió a un media y quieres reenviarla en lugar de imagenURL,
  // activa la sección marcada más abajo cambiando `useQuotedMediaForward = true`
  const useQuotedMediaForward = false // <- si quieres activar reenvío del media citado, pon true

  for (const g of groups) {
    await delay(delayMs) // rate limit friendly
    try {
      // construir contenido
      const caption = (rawText ? rawText + packname : packname).trim()

      // preparar mentions si necesario
      let mentions = []
      if (mentionFlag) {
        // Intentamos obtener participantes desde groupsMap si está disponible
        try {
          const meta = groupsMap[g.id] || {}
          const participants = meta.participants || meta.participantsArray || meta?.participants || []
          // participants puede ser array de objetos { id } o strings
          mentions = participants.map(p => (p && p.id) ? p.id : (typeof p === 'string' ? p : null)).filter(Boolean).slice(0, 100)
        } catch (e) {
          mentions = []
        }
      }

      // Si se desea reenviar el mensaje citado (media) tal cual:
      if (useQuotedMediaForward && m.quoted && m.quoted.key) {
        // Intentamos copiar y reenviar (Baileys tiene copyNForward)
        if (typeof conn.copyNForward === 'function') {
          await conn.copyNForward(g.id, m.quoted.key, true, { caption })
        } else {
          // fallback: intentar original sendMessage con URL (si tienes)
          if (imagenURL) {
            await conn.sendMessage(g.id, { image: { url: imagenURL }, caption, mentions }, { quoted: m })
          } else {
            await conn.sendMessage(g.id, { text: caption, mentions }, { quoted: m })
          }
        }
      } else {
        // Enviar imagen con URL si se configuró
        if (imagenURL && imagenURL.trim()) {
          await conn.sendMessage(g.id, {
            image: { url: imagenURL },
            caption,
            mentions
          }, { quoted: m })
        } else {
          // Texto puro
          await conn.sendMessage(g.id, {
            text: caption,
            mentions
          }, { quoted: m })
        }
      }

      sent++
    } catch (err) {
      failed++
      failedList.push({ id: g.id, error: err?.message || String(err) })
      // seguir con los demás grupos
    }
  }

  // ---------- REPORTE FINAL ----------
  let resumen = `${emoji} *Broadcast finalizado*\n\n` +
    `✅ Enviados: ${sent}\n` +
    `❌ Fallidos: ${failed}\n` +
    `Total intentados: ${groups.length}\n`

  if (failedList.length) {
    resumen += `\n*Primeros fallos (id : motivo)*:\n` +
      failedList.slice(0, 20).map(f => `• ${f.id} : ${f.error}`).join('\n')
  }

  await m.reply(resumen)
}

handler.help = ['broadcastgroup <texto>']
handler.tags = ['owner']
handler.command = ['bcgc', 'broadcastgroup']
handler.owner = true

export default handler