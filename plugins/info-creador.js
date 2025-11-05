import { proto } from '@whiskeysockets/baileys'
import PhoneNumber from 'awesome-phonenumber'

const name = "OmarGranda"
const empresa = "𝙈𝙞𝙮𝙪𝙠𝙞𝘽𝙤𝙩-𝙈𝘿 ⚡"
const numCreador = "51927303598"
const correo = "omargranda673@gmail.com"
const web = "https://github.com/OmarGranda"
const canal = "https://whatsapp.com/channel/0029VaAoXNsKfvfZHv9cuG0G"
const about = "Desarrollador oficial de MiyukiBot MD 🧑‍💻"
const direccion = "Perú 🇵🇪"

const vcard = `
BEGIN:VCARD
VERSION:3.0
N:;${name};;;
FN:${name}
ORG:${empresa}
TITLE:CEO & Fundador
TEL;waid=${numCreador}:${new PhoneNumber("+" + numCreador).getNumber("international")}
EMAIL:${correo}
URL:${web}
NOTE:${about}
ADR:;;${direccion};;;;
X-ABADR:ES
X-WA-BIZ-NAME:${name}
X-WA-BIZ-DESCRIPTION:${about}
END:VCARD`.trim()

const contactMessage = { displayName: name, vcard }

let handler = async (m, { conn }) => {

  await m.react("👑")

  let texto = `👑 *CREADOR OFICIAL DE MIYUKIBOT-MD* 👑

*Nombre:* ${name}
*Cargo:* CEO & Desarrollador Principal
*Ubicación:* ${direccion}

🌐 *GitHub:* ${web}
📧 *Correo:* ${correo}
🔗 *Canal Oficial:* ${canal}

> _¿Quieres tu propio bot o una versión personalizada? Escríbeme._
`

  const botones = [
    { index: 1, urlButton: { displayText: "💬 Contactar en WhatsApp", url: `https://wa.me/${numCreador}` }},
    { index: 2, urlButton: { displayText: "📂 GitHub Oficial", url: web }},
    { index: 3, urlButton: { displayText: "📢 Canal Oficial", url: canal }},
  ]

  await conn.sendMessage(m.chat, {
    text: texto,
    footer: "MiyukiBot-MD ⚡ By OmarGranda",
    templateButtons: botones,
    contextInfo: {
      externalAdReply: {
        title: "Contacto del Creador 👑",
        body: empresa,
        thumbnailUrl: 'https://qu.ax/KVDzy.jpg',
        mediaType: 1,
        renderLargerThumbnail: true,
        sourceUrl: canal
      }
    }
  }, { quoted: m })

  // Enviar contacto
  await conn.sendMessage(m.chat, {
    contacts: { displayName: name, contacts: [contactMessage] }
  }, { quoted: m })

}

handler.help = ["creador", "owner", "creator"]
handler.tags = ["info"]
handler.command = ["creador", "creator", "owner"]

export default handler