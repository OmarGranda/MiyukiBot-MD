import fs from 'fs'

const filePath = './database/lids.json'

// 🗂️ Cargar base de datos de LIDs (crear si no existe)
function loadLids() {
  try {
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync('./database', { recursive: true })
      fs.writeFileSync(filePath, '{}')
    }
    return JSON.parse(fs.readFileSync(filePath))
  } catch (err) {
    console.error('Error cargando lids.json:', err)
    return {}
  }
}

// 💾 Guardar base de datos actualizada
function saveLids(db) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(db, null, 2))
  } catch (err) {
    console.error('Error guardando lids.json:', err)
  }
}

// 🔑 Generar LID único
function generateLid() {
  return 'LID-' + Math.floor(100000 + Math.random() * 900000) // 6 dígitos aleatorios
}

// ⚙️ Handler principal
let handler = async (m, { conn, groupMetadata }) => {
  try {
    await m.react('🕒')

    if (!m.isGroup) {
      await m.reply('⚠️ Este comando solo puede usarse en grupos.')
      return
    }

    const group = groupMetadata || (await conn.groupMetadata(m.chat))
    const participants = group.participants || []

    // Obtener usuario mencionado, citado o remitente
    const targetJid =
      (m.mentionedJid && m.mentionedJid[0]) ||
      (m.quoted ? m.quoted.sender : m.sender)

    // Verificar si el usuario está en el grupo
    const userExists = participants.some(p => p.id === targetJid)
    if (!userExists) {
      await conn.sendMessage(m.chat, {
        text: `⚠️ *No se encontró el usuario en el grupo.*\nVerifica que estés mencionando correctamente.`,
      }, { quoted: m })
      await m.react('✖️')
      return
    }

    // Cargar DB de LIDs
    const lidsDB = loadLids()

    // Si el usuario no tiene LID, generar uno nuevo
    if (!lidsDB[targetJid]) {
      lidsDB[targetJid] = generateLid()
      saveLids(lidsDB)
    }

    const lid = lidsDB[targetJid]
    const name = (await conn.getName(targetJid)) || targetJid.split('@')[0]

    // 📜 Mensaje con diseño
    const msg = `
╭───❀ *LID DEL USUARIO* ❀───╮
│ 👤 *Usuario:* @${targetJid.split('@')[0]}
│ 🏷️ *Nombre:* ${name}
│ 🆔 *LID:* ${lid}
│ 🕓 *Consultado:* ${new Date().toLocaleString('es-ES')}
╰──────────────────────────╯
`.trim()

    await conn.sendMessage(m.chat, {
      text: msg,
      mentions: [targetJid]
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