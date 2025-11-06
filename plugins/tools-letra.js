function handler(m, { conn, text }) {
  try {
    const emoji = '🎨' // emoji por defecto (puedes cambiarlo)
    // obtener texto: argumento, citado o mensaje
    let teks = text || (m.quoted && m.quoted.text) || m.text
    if (!teks) return conn.reply(m.chat, `${emoji} Por favor, ingresa el texto que quieres transformar.`, m)

    const map = {
      'a': 'ᥲ','b': 'ᑲ','c': 'ᥴ','d': 'ძ','e': 'ᥱ','f': '𝖿',
      'g': 'g','h': 'һ','i': 'і','j': 'ȷ','k': 'k','l': 'ᥣ',
      'm': 'm','n': 'ᥒ','o': '᥆','p': '⍴','q': '𝗊','r': 'r',
      's': 's','t': '𝗍','u': 'ᥙ','v': '᥎','w': 'ᥕ','x': '᥊',
      'y': 'ᥡ','z': 'z'
    }

    // reemplazo: mantiene caracteres no alfabéticos y procesa letras (mayúsculas/minúsculas)
    const transformed = teks.replace(/[a-z]/gi, ch => {
      const lower = ch.toLowerCase()
      const mapped = map[lower] || ch
      // si la letra original era mayúscula, intentamos respetar la "mayúscula"
      // para muchos glifos unicode no existe mayúscula; simplemente devolvemos el glifo.
      // Si quieres forzar una versión "mayúscula" (cuando el glifo tiene), podrías mapearla aparte.
      return mapped
    })

    // enviar respuesta
    return conn.reply(m.chat, transformed, m)
  } catch (err) {
    console.error(err)
    return conn.reply(m.chat, '⚠️ Ocurrió un error al transformar el texto.', m)
  }
}

handler.help = ['letra *<texto>*']
handler.tags = ['fun']
handler.command = ['letra']
handler.register = true

export default handler