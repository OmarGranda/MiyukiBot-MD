import pkg from '@whiskeysockets/baileys'
import fs from 'fs'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone'
const { generateWAMessageFromContent, prepareWAMessageMedia, proto } = pkg

// ==========================================================
// Handler principal
// ==========================================================
var handler = m => m

handler.all = async function (m) {

    // ============================
    // Variables globales necesarias
    // ============================
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

    global.channelRD = await getRandomChannel()

    // ============================
    // Fecha y hora
    // ============================
    global.d = new Date(new Date() + 3600000)
    global.locale = 'es'

    global.dia = d.toLocaleDateString(locale, { weekday: 'long' })
    global.fecha = d.toLocaleDateString('es', { day: 'numeric', month: 'numeric', year: 'numeric' })
    global.mes = d.toLocaleDateString('es', { month: 'long' })
    global.año = d.toLocaleDateString('es', { year: 'numeric' })
    global.tiempo = moment.tz('America/Caracas').format('HH:mm:ss')

    // ============================
    // Links y redes sociales
    // ============================
    var canal = 'https://whatsapp.com/channel/0029Vb6wMPa8kyyTpjBG9C2H'
    var comunidad = 'https://whatsapp.com/channel/0029Vb6wMPa8kyyTpjBG9C2H'
    var git = 'https://github.com/OmarGranda'
    var github = 'https://github.com/OmarGranda/MiyukiBot-MD'
    var correo = 'omargranda673@gmail.com'

    global.redes = pickRandom([canal, comunidad, git, github, correo])

    // ============================
    // Datos del usuario
    // ============================
    global.nombre = m.pushName || 'Anónimo'

    // ============================
    // Stickers pack mejorado con metadatos
    // ============================
    global.packsticker =
`🌸 *Sticker generado*
───────────────
👤 *Usuario:* ${nombre}
🤖 *Bot:* ${botname}
📆 *Fecha:* ${fecha}
🕒 *Hora:* ${tiempo}
🗓 *Día:* ${dia}
📍 *Zona:* America/Caracas
───────────────
💬 *Grupo/Chat:* ${m.isGroup ? m.chat : "Privado"}
🔢 *Mensaje ID:* ${m.key?.id || "N/A"}
📱 *Usuario ID:* ${m.sender.split('@')[0]}
───────────────
`

    global.packsticker2 =
`👑 *Developer:* ${dev}
🔗 *Red:* ${redes}
🌐 *GitHub:* github.com/OmarGranda
───────────────
✨ *Gracias por usar MiyukiBot!*`

    // ============================
    // Contacto Fake
    // ============================
    global.fkontak = {
        key: {
            participants: "0@s.whatsapp.net",
            remoteJid: "status@broadcast",
            fromMe: false,
            id: "Halo"
        },
        message: {
            contactMessage: {
                vcard: `BEGIN:VCARD
VERSION:3.0
N:Sy;Bot;;;
FN:y
item1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}
item1.X-ABLabel:Ponsel
END:VCARD`
            }
        }
    }

    // ============================
    // Fake Replicated Channel
    // ============================
    global.icono = pickRandom([
        'https://qu.ax/FKJLs.jpg',
        'https://qu.ax/NMOTS.jpg',
        'https://qu.ax/SeVjj.jpg'
    ])

    global.rcanal = {
        contextInfo: {
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: channelRD.id,
                serverMessageId: "",
                newsletterName: channelRD.name
            },
            externalAdReply: {
                title: botname,
                body: dev,
                mediaUrl: null,
                previewType: "PHOTO",
                thumbnail: await (await fetch(icono)).buffer(),
                sourceUrl: redes,
                mediaType: 1,
                renderLargerThumbnail: false
            }
        }
    }
}

export default handler

// ==========================================================
// Funciones adicionales
// ==========================================================
function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)]
}

async function getRandomChannel() {
    let index = Math.floor(Math.random() * canalIdM.length)
    return {
        id: canalIdM[index],
        name: canalNombreM[index]
    }
}