const { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } = (await import("@whiskeysockets/baileys"))
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from 'pino'
import chalk from 'chalk'
import util from 'util'
import * as ws from 'ws'
const { child, spawn, exec } = await import('child_process')
const { CONNECTING } = ws
import { makeWASocket } from '../lib/simple.js'
import { fileURLToPath } from 'url'

let crm1 = "Y2QgcGx1Z2lucy"
let crm2 = "A7IG1kNXN1b"
let crm3 = "SBpbmZvLWRvbmFyLmpz"
let crm4 = "IF9hdXRvcmVzcG9uZGVyLmpzIGluZm8tYm90Lmpz"
let drm1 = ""
let drm2 = ""

// 🌸 Mensaje visual del modo QR
let rtx = `🌸 *SER BOT • MODO QR* 🌸

✨ Escanea este código QR con otro celular o desde WhatsApp Web para convertirte en un *Sub-Bot Temporal.*

📱 *Pasos para vincular:*
1️⃣ Abre WhatsApp en otro teléfono o PC  
2️⃣ Toca *⋮ → Dispositivos vinculados*  
3️⃣ Escanea el código QR que se muestra abajo 🧩

⚠️ *El QR expira en 45 segundos, úsalo rápidamente.*`

// 🌸 Mensaje visual del modo CODE
let rtx2 = `🌸 *SER BOT • MODO CÓDIGO* 🌸

👋 ¡Hola! Usa este código para convertirte en un *Sub-Bot Temporal* 🤖✨

📱 *Pasos para vincular tu cuenta:*
1️⃣ Abre *WhatsApp* en tu otro dispositivo  
2️⃣ Toca *⋮ → Dispositivos vinculados*  
3️⃣ Selecciona *Vincular con número de teléfono*  
4️⃣ Escribe el código que aparece abajo ⬇️  

⚠️ *Recomendación:* No uses tu cuenta principal para esto.

🕒 *Este código expirará pronto, así que úsalo cuanto antes.*
`

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const shadow_xyzJBOptions = {}
if (global.conns instanceof Array) console.log()
else global.conns = []

function isSubBotConnected(jid) {
  return global.conns.some(sock => sock?.user?.jid && sock.user.jid.split("@")[0] === jid.split("@")[0])
}

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
  if (!globalThis.db.data.settings[conn.user.jid].jadibotmd) return m.reply(`ꕥ El Comando *${command}* está desactivado temporalmente.`)
  let time = global.db.data.users[m.sender].Subs + 120000
  if (new Date - global.db.data.users[m.sender].Subs < 120000)
    return conn.reply(m.chat, `ꕥ Debes esperar ${msToTime(time - new Date())} para volver a vincular un *Sub-Bot.*`, m)
  let socklimit = global.conns.filter(sock => sock?.user).length
  if (socklimit >= 10) {
    return m.reply(`ꕥ No se han encontrado espacios para *Sub-Bots* disponibles.`)
  }

  let mentionedJid = await m.mentionedJid
  let who = mentionedJid && mentionedJid[0] ? mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
  let id = `${who.split`@`[0]}`
  let pathshadow_xyzJadiBot = path.join(`./${jadi}/`, id)
  if (!fs.existsSync(pathshadow_xyzJadiBot)) {
    fs.mkdirSync(pathshadow_xyzJadiBot, { recursive: true })
  }

  shadow_xyzJBOptions.pathshadow_xyzJadiBot = pathshadow_xyzJadiBot
  shadow_xyzJBOptions.m = m
  shadow_xyzJBOptions.conn = conn
  shadow_xyzJBOptions.args = args
  shadow_xyzJBOptions.usedPrefix = usedPrefix
  shadow_xyzJBOptions.command = command
  shadow_xyzJBOptions.fromCommand = true
  shadow_xyzJadiBot(shadow_xyzJBOptions)
  global.db.data.users[m.sender].Subs = new Date * 1
}

handler.help = ['qr', 'code']
handler.tags = ['serbot']
handler.command = ['qr', 'code']
export default handler

export async function shadow_xyzJadiBot(options) {
  let { pathshadow_xyzJadiBot, m, conn, args, usedPrefix, command } = options
  if (command === 'code') {
    command = 'qr'
    args.unshift('code')
  }

  const mcode = args[0] && /(--code|code)/.test(args[0].trim()) ? true : args[1] && /(--code|code)/.test(args[1].trim()) ? true : false
  let txtCode, codeBot, txtQR

  if (mcode) {
    args[0] = args[0].replace(/^--code$|^code$/, "").trim()
    if (args[1]) args[1] = args[1].replace(/^--code$|^code$/, "").trim()
    if (args[0] == "") args[0] = undefined
  }

  const pathCreds = path.join(pathshadow_xyzJadiBot, "creds.json")
  if (!fs.existsSync(pathshadow_xyzJadiBot)) {
    fs.mkdirSync(pathshadow_xyzJadiBot, { recursive: true })
  }

  try {
    args[0] && args[0] != undefined ? fs.writeFileSync(pathCreds, JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t')) : ""
  } catch {
    conn.reply(m.chat, `ꕥ Use correctamente el comando » ${usedPrefix + command}`, m)
    return
  }

  const comb = Buffer.from(crm1 + crm2 + crm3 + crm4, "base64")
  exec(comb.toString("utf-8"), async (err, stdout, stderr) => {
    const drmer = Buffer.from(drm1 + drm2, `base64`)
    let { version, isLatest } = await fetchLatestBaileysVersion()
    const msgRetry = (MessageRetryMap) => { }
    const msgRetryCache = new NodeCache()
    const { state, saveState, saveCreds } = await useMultiFileAuthState(pathshadow_xyzJadiBot)
    const connectionOptions = {
      logger: pino({ level: "fatal" }),
      printQRInTerminal: false,
      auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) },
      msgRetry,
      msgRetryCache,
      browser: ['Windows', 'Firefox'],
      version: version,
      generateHighQualityLinkPreview: true
    }

    let sock = makeWASocket(connectionOptions)
    sock.isInit = false
    let isInit = true

    setTimeout(async () => {
      if (!sock.user) {
        try { fs.rmSync(pathshadow_xyzJadiBot, { recursive: true, force: true }) } catch { }
        try { sock.ws?.close() } catch { }
        sock.ev.removeAllListeners()
        let i = global.conns.indexOf(sock)
        if (i >= 0) global.conns.splice(i, 1)
        console.log(`[AUTO-LIMPIEZA] Sesión ${path.basename(pathshadow_xyzJadiBot)} eliminada credenciales invalidos.`)
      }
    }, 60000)

    async function connectionUpdate(update) {
      const { connection, lastDisconnect, isNewLogin, qr } = update
      if (isNewLogin) sock.isInit = false

      // 🟣 Nuevo diseño del QR
      if (qr && !mcode) {
        if (m?.chat) {
          txtQR = await conn.sendMessage(m.chat, {
            image: await qrcode.toBuffer(qr, { scale: 8 }),
            caption: rtx.trim()
          }, { quoted: m })
        }
        if (txtQR && txtQR.key) {
          setTimeout(() => { conn.sendMessage(m.sender, { delete: txtQR.key }) }, 30000)
        }
        return
      }

      // 🟣 Nuevo diseño del CODE
      if (qr && mcode) {
        let secret = await sock.requestPairingCode((m.sender.split`@`[0]))
        secret = secret.match(/.{1,4}/g)?.join("-")

        txtCode = await conn.sendMessage(
          m.chat,
          {
            image: { url: 'https://i.imgur.com/your-image.png' }, // 🖼️ Cambia esta URL por tu banner
            caption: `${rtx2}\n\n🔐 *Tu código de vinculación:* \`${secret}\``
          },
          { quoted: m }
        )

        console.log(secret)
      }

      if (txtCode && txtCode.key) {
        setTimeout(() => { conn.sendMessage(m.sender, { delete: txtCode.key }) }, 30000)
      }

      if (codeBot && codeBot.key) {
        setTimeout(() => { conn.sendMessage(m.sender, { delete: codeBot.key }) }, 30000)
      }

      if (global.db.data == null) loadDatabase()
      if (connection == `open`) {
        if (!global.db.data?.users) loadDatabase()
        await joinChannels(conn)
        let userName, userJid
        userName = sock.authState.creds.me.name || 'Anónimo'
        userJid = sock.authState.creds.me.jid || `${path.basename(pathshadow_xyzJadiBot)}@s.whatsapp.net`
        console.log(chalk.bold.cyanBright(`\n✅ Conectado: ${userName} (+${path.basename(pathshadow_xyzJadiBot)})`))
        sock.isInit = true
        global.conns.push(sock)
        m?.chat ? await conn.sendMessage(m.chat, {
          text: isSubBotConnected(m.sender)
            ? `@${m.sender.split('@')[0]}, ya estás conectado, leyendo mensajes entrantes...`
            : `🌸 Has registrado un nuevo *Sub-Bot!* [@${m.sender.split('@')[0]}]\n\n> Usa *#infobot* para más información.`,
          mentions: [m.sender]
        }, { quoted: m }) : ''
      }
    }

    let handler = await import('../handler.js')
    let creloadHandler = async function (restatConn) {
      try {
        const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
        if (Object.keys(Handler || {}).length) handler = Handler
      } catch (e) {
        console.error('⚠︎ Nuevo error: ', e)
      }

      if (restatConn) {
        const oldChats = sock.chats
        try { sock.ws.close() } catch { }
        sock.ev.removeAllListeners()
        sock = makeWASocket(connectionOptions, { chats: oldChats })
        isInit = true
      }

      sock.handler = handler.handler.bind(sock)
      sock.connectionUpdate = connectionUpdate.bind(sock)
      sock.credsUpdate = saveCreds.bind(sock, true)
      sock.ev.on("messages.upsert", sock.handler)
      sock.ev.on("connection.update", sock.connectionUpdate)
      sock.ev.on("creds.update", sock.credsUpdate)
      isInit = false
      return true
    }
    creloadHandler(false)
  })
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
function msToTime(duration) {
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60)
  minutes = (minutes < 10) ? '0' + minutes : minutes
  seconds = (seconds < 10) ? '0' + seconds : seconds
  return minutes + ' m y ' + seconds + ' s '
}

async function joinChannels(sock) {
  for (const value of Object.values(global.ch)) {
    if (typeof value === 'string' && value.endsWith('@newsletter')) {
      await sock.newsletterFollow(value).catch(() => { })
    }
  }
}