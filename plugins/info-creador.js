import PhoneNumber from 'awesome-phonenumber'

const name = "OmarGranda"
const empresa = "𝙈𝙞𝙮𝙪𝙠𝙞𝘽𝙤𝙩-𝙈𝘿 ⚡"
const numCreador = "51927303598"
const correo = "omargranda673@gmail.com"
const web = "https://github.com/OmarGranda"
const about = "Hakuna matata: vive y sé feliz 🙂"
const direccion = "Perú 🇵🇪"
const instagram = "https://www.instagram.com/omar_xyz7"
const canal = "https://whatsapp.com/channel/0029Vb6wMPa8kyyTpjBG9C2H" // Cambia si tienes canal oficial

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

await conn.sendMessage(m.chat, {
  text: `👑 *CREADOR OFICIAL DE MIYUKIBOT-MD* 👑

*Nombre:* ${name}

*Rol:* CEO & Desarrollador Principal

*País:* ${direccion}

🌐 *GitHub:* ${web}

📧 *Correo:* ${correo}

🔗 *Canal:* ${canal}

💌 *Instagram:* ${instagram} 

> _Si quieres un bot igual o personalizado, puedes comunicarte con mi creador._
`,
  contextInfo: {
    mentionedJid: [m.sender],
    externalAdReply: {
      title: "Contacto Del Creador 👑",
      body: empresa,
      mediaType: 1,
      thumbnailUrl: 'https://qu.ax/SFkxO.jpg', // Puedes cambiar la imagen
      renderLargerThumbnail: true,
      sourceUrl: canal
    }
  }
}, { quoted: m })

await conn.sendMessage(m.chat, {
  contacts: { displayName: name, contacts: [contactMessage] }
}, { quoted: m })

}

handler.help = ["creador", "owner", "creator"]
handler.tags = ["info"]
handler.command = ["creador", "creator", "owner"]

export default handler