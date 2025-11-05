const handler = async (m, { conn, isROwner, text }) => {
  // ========== CONFIG ==========
  if (!isROwner) return m.reply('❌ Solo el/los owner(s) pueden usar este comando.');

  const delay = (time) => new Promise((res) => setTimeout(res, time));
  const emoji = '⚡';                       // emoji para reacciones y mensajes
  const packname = '\n\n— Enviado por MiBot'; // texto extra al final del mensaje
  const imagenURL = ''                     // si pones URL aquí enviará imagen + caption. Deja vacío para solo texto
  const DEFAULT_DELAY_MS = 800             // tiempo entre envíos (ajusta si te banean)
  const mentionAllByDefault = false        // cambiar a true si quieres mencionar por defecto
  const skipGroups = []                    // lista de group IDs a omitir, p.ej. ['123@g.us', '456@g.us']

  // ========== PREPARAR TEXTO ==========
  // El mensaje puede venir como quoted text o como texto directo
  const pesan = (m.quoted && m.quoted.text) ? m.quoted.text : (text || '').trim()
  if (!pesan) throw `${emoji} Te faltó el texto a enviar. Usa: .bcgc <texto> o responde a un mensaje con .bcgc`

  // Soporte básico de flags dentro del texto:
  // --mention para mencionar a todos, --delay=500 para cambiar delay, --skip=id1,id2 para saltar grupos
  // Ejemplo: ".bcgc Hola mundo --mention --delay=400 --skip=123@g.us,456@g.us"
  let mentionFlag = text?.includes('--mention') || mentionAllByDefault
  const delayMatch = text?.match(/--delay=(\d{2,5})/)
  const delayMs = delayMatch ? parseInt(delayMatch[1]) : DEFAULT_DELAY_MS
  const skipMatch = text?.match(/--skip=([^\s]+)/)
  const skipFromText = skipMatch ? skipMatch[1].split(',') : []
  const skipList = [...new Set([...skipGroups, ...skipFromText])]

  // ========== OBTENER GRUPOS ==========
  let getGroups = {}
  try {
    getGroups = await conn.groupFetchAllParticipating()
  } catch (err) {
    return m.reply(`${emoji} Error al obtener grupos: ${err.message || err}`)
  }

  const groups = Object.values(getGroups || {}).filter(g => g && g.id && !skipList.includes(g.id))
  if (!groups.length) return m.reply(`${emoji} No se encontraron grupos (o fueron omitidos por --skip).`)

  // Reacciona al mensaje del que ejecuta
  try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch (_) {}

  // ========== ENVÍO MASIVO ==========
  let success = 0
  let failed = 0
  let failedList = []

  // Si se solicita mencionar, construimos mentions por grupo
  for (const g of groups) {
    await delay(delayMs)
    try {
      // Construir caption / texto final
      let caption = `${pesan}${packname}`

      // Si se quiere mencionar, armamos lista de participantes
      let mentions = []
      if (mentionFlag) {
        try {
          const participants = g.participants || []
          // participants puede tener objetos con id o solo strings, adaptamos:
          mentions = participants.map(p => (p.id ? p.id : p)).slice(0, 100) // limitar a 100 por seguridad
        } catch (_) {
          mentions = []
        }
      }

      // Si se definió imagenURL, enviamos imagen con caption; si no, enviamos texto simple
      if (imagenURL && imagenURL.trim()) {
        await conn.sendMessage(g.id, {
          image: { url: imagenURL },
          caption,
          mentions
        }, { quoted: m })
      } else {
        await conn.sendMessage(g.id, {
          text: caption,
          mentions
        }, { quoted: m })
      }

      success++
    } catch (err) {
      failed++
      failedList.push({ id: g.id, error: err?.message || String(err) })
      // No throw: continuamos con los demás grupos
    }
  }

  // ========== REPORTE FINAL ==========
  let resumen = `${emoji} *Broadcast finalizado*\n\n` +
               `✅ Enviados: ${success}\n` +
               `❌ Fallidos: ${failed}\n` +
               `Total intentados: ${groups.length}\n`

  if (failedList.length) {
    resumen += `\n*Grupos fallidos (id : motivo)*:\n` +
               failedList.slice(0, 20).map(f => `• ${f.id} : ${f.error}`).join('\n')
    // Si hay muchos fallos, no enviamos la lista completa para no saturar
  }

  await m.reply(resumen)
}

handler.help = ['broadcastgroup', 'bcgc']
handler.tags = ['owner']
handler.command = ['bcgc', 'broadcastgroup']
handler.owner = true

export default handler