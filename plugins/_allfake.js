// handler.js
import pkg from '@whiskeysockets/baileys'
import fs from 'fs'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone'
const { generateWAMessageFromContent, prepareWAMessageMedia, proto } = pkg

// -----------------------------
// Config y utilidades de disco
// -----------------------------
const DATA_DIR = './data'
const USERS_FILE = `${DATA_DIR}/users.json`
const LOG_FILE = `${DATA_DIR}/messages.log`
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

function loadJSON(path, defaultValue) {
  try {
    if (!fs.existsSync(path)) return defaultValue
    const raw = fs.readFileSync(path, 'utf8')
    return JSON.parse(raw || 'null') ?? defaultValue
  } catch (e) {
    console.error('loadJSON error', e)
    return defaultValue
  }
}
function saveJSON(path, data) {
  try {
    fs.writeFileSync(path, JSON.stringify(data, null, 2))
  } catch (e) {
    console.error('saveJSON error', e)
  }
}

// -----------------------------
// Persistencia básica
// -----------------------------
global.dbUsers = loadJSON(USERS_FILE, {}) // keyed by jid
function registerUser(m) {
  const jid = m.sender
  if (!global.dbUsers[jid]) {
    global.dbUsers[jid] = {
      jid,
      name: m.pushName || 'Anónimo',
      registeredAt: new Date().toISOString(),
      msgs: 0
    }
    saveJSON(USERS_FILE, global.dbUsers)
    return true
  }
  return false
}
function incUserMsgCount(m) {
  const jid = m.sender
  if (!global.dbUsers[jid]) {
    registerUser(m)
  }
  global.dbUsers[jid].msgs = (global.dbUsers[jid].msgs || 0) + 1
  saveJSON(USERS_FILE, global.dbUsers)
}

// -----------------------------
// Variables globales reutilizables
// -----------------------------
var handler = m => m

// Anti-spam: trackeo en memoria (se persiste a disco si quieres)
global._spam = global._spam || {}        // { jid: { times: [timestamp,...], mutedUntil: ts|null } }
const SPAM_MAX = 6       // mensajes
const SPAM_WINDOW = 10 * 1000 // ms
const SPAM_MUTE = 30 * 1000 // ms de "mute" temporal

// Últimos mensajes por chat (para "recuperar" o simular anti-delete)
global.lastMessages = global.lastMessages || {} // { chatId: [ {id, sender, body, timestamp, messageObj}, ... ] }
const LAST_MSGS_KEEP = 30

// Logging simple
function logMessage(m) {
  try {
    const line = `[${new Date().toISOString()}] ${m.key.remoteJid} <${m.sender}> : ${m.text || (m.message ? JSON.stringify(Object.keys(m.message)) : '')}\n`
    fs.appendFileSync(LOG_FILE, line)
  } catch (e) {
    console.error('logMessage error', e)
  }
}

// Util: pick random
function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

// -----------------------------
// Datos iniciales (como antes)
// -----------------------------
global.botname = global.botname || "MiyukiBot-MD 🌸"
global.dev = global.dev || "By OmarGranda"

global.canalIdM = [
  "120363422169517881@newsletter",
  "120363422169517881@newsletter"
]
global.canalNombreM = [
  "༺✮•°◤ 𝙈𝙞𝙮𝙪𝙠𝙞𝘽𝙤𝙩-𝙈𝘿 🌸 ◥°•✮༻",
  "༺✮•°◤ 𝙈𝙞𝙮𝙪𝙠𝙞𝘽𝙤𝙩-𝙈𝘿 🌸 ◥°•✮༻"
]

async function getRandomChannel() {
  let randomIndex = Math.floor(Math.random() * global.canalIdM.length)
  let id = global.canalIdM[randomIndex]
  let name = global.canalNombreM[randomIndex]
  return { id, name }
}

// -----------------------------
// Función para enviar botones
// (requiere la conexión principal para usar generateWAMessageFromContent)
// -----------------------------
async function sendButtons(conn, jid, text, buttons = [], quoted = null) {
  // buttons: [{ id: 'id1', title: 'Texto' }, ...]
  const template = {
    "templateMessage": {
      "hydratedTemplate": {
        "hydratedContentText": text,
        "hydratedFooterText": `${global.botname} • ${global.dev}`,
        "hydratedButtons": buttons.map(b => ({
          "quickReplyButton": { "displayText": b.title, "id": b.id }
        }))
      }
    }
  }
  const waMessage = generateWAMessageFromContent(jid, template, { quoted: quoted || null })
  await conn.relayMessage(jid, waMessage.message, { messageId: waMessage.key.id })
}

// -----------------------------
// Handler principal (se ejecuta por cada mensaje)
// -----------------------------
handler.all = async function (m, conn = global.conn) {
  try {
    // m: objeto del mensaje tal como te llega desde Baileys
    // conn: instancia de la conexión (pasa la conexión desde tu index principal cuando llames al handler)

    // Evitar nulls
    if (!m) return
    if (!m.key) return

    // Preparar vars globales por mensaje
    global.channelRD = await getRandomChannel()
    global.d = new Date(new Date() + 3600000)
    global.locale = 'es'
    global.dia = d.toLocaleDateString(locale, { weekday: 'long' })
    global.fecha = d.toLocaleDateString('es', { day: 'numeric', month: 'numeric', year: 'numeric' })
    global.mes = d.toLocaleDateString('es', { month: 'long' })
    global.año = d.toLocaleDateString('es', { year: 'numeric' })
    global.tiempo = moment.tz('America/Caracas').format('HH:mm:ss')
    global.nombre = m.pushName || 'Anónimo'

    // Guardar log simple
    logMessage(m)

    // Registrar usuario si no existe
    registerUser(m)
    incUserMsgCount(m)

    // Guardar últimos mensajes por chat (para "recuperar")
    try {
      const chat = m.key.remoteJid
      global.lastMessages[chat] = global.lastMessages[chat] || []
      // extraer body de forma segura
      let body = ''
      if (m.message) {
        // varios tipos: conversation, extendedTextMessage, imageMessage, etc.
        if (m.message.conversation) body = m.message.conversation
        else if (m.message.extendedTextMessage && m.message.extendedTextMessage.text) body = m.message.extendedTextMessage.text
        else body = JSON.stringify(Object.keys(m.message)).slice(0, 200)
      }
      global.lastMessages[chat].push({
        id: m.key.id,
        sender: m.sender,
        body,
        timestamp: Date.now(),
        message: m
      })
      if (global.lastMessages[chat].length > LAST_MSGS_KEEP) global.lastMessages[chat].shift()
    } catch (e) {
      console.error('save last message error', e)
    }

    // -----------------------------
    // Anti-spam simple
    // -----------------------------
    const jid = m.sender
    const now = Date.now()
    global._spam[jid] = global._spam[jid] || { times: [], mutedUntil: null }

    // limpiar times viejos
    global._spam[jid].times = global._spam[jid].times.filter(t => now - t < SPAM_WINDOW)
    global._spam[jid].times.push(now)

    // si está en mute temporal, ignorar y avisar
    if (global._spam[jid].mutedUntil && now < global._spam[jid].mutedUntil) {
      // opcional: enviar aviso de mute
      if (conn && (global._spam[jid].times.length % 5 === 0)) {
        await conn.sendMessage(jid, { text: `⚠️ Estás enviando mensajes muy rápido. Espera ${(Math.ceil((global._spam[jid].mutedUntil - now)/1000))}s.` }, { quoted: m })
      }
      return // bloquear procesamiento del mensaje
    }

    // detectar spam
    if (global._spam[jid].times.length > SPAM_MAX) {
      global._spam[jid].mutedUntil = now + SPAM_MUTE
      await conn.sendMessage(jid, { text: `🚫 Has sido silenciado temporalmente por enviar mensajes repetidos. Intenta de nuevo en ${Math.ceil(SPAM_MUTE/1000)}s.` }, { quoted: m })
      return
    }

    // -----------------------------
    // Comandos básicos / auto-respuestas
    // -----------------------------
    // extraer texto "comando" si existe
    let text = ''
    if (m.message) {
      if (m.message.conversation) text = m.message.conversation
      else if (m.message.extendedTextMessage && m.message.extendedTextMessage.text) text = m.message.extendedTextMessage.text
      else text = ''
    }
    text = (text || '').trim()

    // prefijos comunes
    const isCmd = text.startsWith('!') || text.startsWith('/') || text.startsWith('.')
    const cmd = isCmd ? text.split(/\s+/)[0].replace(/^(!|\/|\.)/, '').toLowerCase() : null
    const args = isCmd ? text.split(/\s+/).slice(1) : []

    // Comandos implementados:
    // !register  -> registra al usuario
    // !miinfo    -> muestra info del usuario
    // !menu      -> muestra un menú con botones
    // !recuperar -> muestra los últimos mensajes del chat (simula anti-delete)
    // hola / Hola -> saludo automático

    if (!isCmd) {
      // respuestas sencillas no-comando
      if (/^hola\b/i.test(text)) {
        await conn.sendMessage(m.key.remoteJid, { text: `Hola ${m.pushName || 'amigo'} 👋\nSoy ${global.botname}. Escribe !menu para ver opciones.` }, { quoted: m })
        return
      }
    }

    if (isCmd) {
      switch (cmd) {
        case 'register':
          if (registerUser(m)) {
            await conn.sendMessage(m.key.remoteJid, { text: `✅ Registrado como *${m.pushName || 'Anónimo'}*.\nID: ${m.sender}` }, { quoted: m })
          } else {
            await conn.sendMessage(m.key.remoteJid, { text: `⚠️ Ya estás registrado.` }, { quoted: m })
          }
          return

        case 'miinfo':
          {
            const u = global.dbUsers[m.sender] || {}
            const txt = `📌 Tu información:\n\nNombre: ${u.name || (m.pushName || 'Anónimo')}\nJID: ${m.sender}\nMensajes enviados: ${u.msgs || 0}\nRegistrado: ${u.registeredAt || 'No registrado'}`
            await conn.sendMessage(m.key.remoteJid, { text: txt }, { quoted: m })
          }
          return

        case 'menu':
          {
            // ejemplo de botones
            const buttons = [
              { id: '!miinfo', title: 'Mi info' },
              { id: '!register', title: 'Registrarme' },
              { id: '!recuperar', title: 'Recuperar últimos' }
            ]
            // si no hay conn o generateWAMessageFromContent fallaría
            if (!conn || !conn.user) {
              // enviar texto simple
              await conn.sendMessage(m.key.remoteJid, { text: `Menu:\n- !miinfo\n- !register\n- !recuperar` }, { quoted: m })
              return
            }
            await sendButtons(conn, m.key.remoteJid, `✨ Menú — ${global.botname}\nSelecciona una opción:`, buttons, m)
          }
          return

        case 'recuperar':
          {
            const chat = m.key.remoteJid
            const arr = (global.lastMessages[chat] || []).slice(-10).reverse()
            if (!arr.length) {
              await conn.sendMessage(chat, { text: 'No hay mensajes guardados para recuperar.' }, { quoted: m })
              return
            }
            let resp = '🗂️ Últimos mensajes:\n\n'
            for (let i = 0; i < arr.length; i++) {
              const it = arr[i]
              const t = new Date(it.timestamp).toLocaleString()
              resp += `• [${t}] ${it.sender.replace(/@.+/, '')}: ${it.body}\n`
            }
            await conn.sendMessage(chat, { text: resp }, { quoted: m })
          }
          return

        default:
          // comando no reconocido
          // opcional: responder con ayuda
          await conn.sendMessage(m.key.remoteJid, { text: `❓ Comando "${cmd}" no reconocido. Escribe !menu para opciones.` }, { quoted: m })
          return
      }
    }

  } catch (e) {
    console.error('handler.all error:', e)
    // no lanzamos para no romper el loop del bot
  }
}

export default handler

// Exporto utilidades por si quieres usarlas en tu archivo principal
export {
  pickRandom,
  sendButtons,
  registerUser,
  loadJSON,
  saveJSON,
  getRandomChannel
}