import pkg from '@whiskeysockets/baileys'
import fs from 'fs'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone'
const { generateWAMessageFromContent, prepareWAMessageMedia, proto } = pkg

var handler = m => m

handler.all = async function (m) {

    global.botname = "MiyukiBot-MD 🌸"
    global.dev = "By OmarGranda"

    global.canalIdM = [
        "120363422169517881@newsletter",
        "120363422169517881@newsletter"
    ]

    global.canalNombreM = [
        "༺✮•°◤ 𝙈𝙞𝙮𝙪𝙠𝙞𝘽𝙤𝙩-𝙈𝘿 🌸 ◥°•✮༻",
        "༺✮•°◤ 𝙈𝙞𝙮𝙪𝙠𝙞𝘽𝙤𝙩-𝙈𝘿 🌸 ◥°•✮༻"
    ]

    global.channelRD = await getRandomChannel()

    global.d = new Date(new Date() + 3600000)
    global.locale = 'es'

    global.dia = d.toLocaleDateString(locale, { weekday: 'long' })
    global.fecha = d.toLocaleDateString('es', { day: 'numeric', month: 'numeric', year: 'numeric' })
    global.mes = d.toLocaleDateString('es', { month: 'long' })
    global.año = d.toLocaleDateString('es', { year: 'numeric' })
    global.tiempo = moment.tz('America/Caracas').format('HH:mm:ss')

    var canal = 'https://whatsapp.com/channel/0029Vb6wMPa8kyyTpjBG9C2H'
    var comunidad = 'https://whatsapp.com/channel/0029Vb6wMPa8kyyTpjBG9C2H'
    var git = 'https://github.com/OmarGranda'
    var github = 'https://github.com/OmarGranda/MiyukiBot-MD'
    var correo = 'omargranda673@gmail.com'

    global.redes = pickRandom([canal, comunidad, git, github, correo])

    global.nombre = m.pushName || 'Anónimo'

    // ============================
    // ⭐ Metadatos estilo la imagen enviada
    // ============================
    global.packsticker = 
`┃ MiyukiBot-MD 🌸
↳ https://github.com/MiyukiBot-MD

┃🧑‍💻 Info:
↳ https://github.com/OmarGranda/MiyukiBot-MD
   👑 Dev: OmarGranda

┃👑 *Usuario:*
↳ ${nombre}

┃📅 *Fecha:* ${fecha}
┃🕒 *Hora:* ${tiempo}
`
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

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)]
}

async function getRandomChannel() {
    let index = Math.floor(Math.random() * canalIdM.length)
    return { id: canalIdM[index], name: canalNombreM[index] }
}