// plugin: reaction.js
let reactionEnabled = false // Estado inicial (off)

export default {
  name: 'reaction',
  description: 'Activa o desactiva las reacciones automáticas del bot.',

  async before(m, { conn }) {
    // Si el bot envía el mensaje, ignorar
    if (!m || !m.text || m.fromMe) return

    // Activar reacciones
    if (/^\.reaccion on$/i.test(m.text) || /^\.reaction on$/i.test(m.text)) {
      reactionEnabled = true
      await conn.sendMessage(m.chat, { text: '✅ Reacciones automáticas activadas.' }, { quoted: m })
      return
    }

    // Desactivar reacciones
    if (/^\.reaccion off$/i.test(m.text) || /^\.reaction off$/i.test(m.text)) {
      reactionEnabled = false
      await conn.sendMessage(m.chat, { text: '❌ Reacciones automáticas desactivadas.' }, { quoted: m })
      return
    }

    // Si están activadas, el bot reacciona automáticamente
    if (reactionEnabled) {
      try {
        await conn.sendMessage(m.chat, { react: { text: '💖', key: m.key } }) // Cambia 💖 por otro emoji si quieres
      } catch (e) {
        console.error('Error al reaccionar:', e)
      }
    }
  }
}