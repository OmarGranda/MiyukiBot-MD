import { WAMessageStubType } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

export async function before(m, { conn, participants, groupMetadata }) {
  try {
    if (!m.messageStubType || !m.isGroup) return true

    const chat = global.db?.data?.chats?.[m.chat] ?? {}

    // --- Función para detectar país por prefijo internacional ---
function getPais(numero) {
  const prefijos = {
    "1": "🇺🇸 Estados Unidos / 🇨🇦 Canadá",
    "7": "🇷🇺 Rusia / 🇰🇿 Kazajistán",
    "20": "🇪🇬 Egipto",
    "27": "🇿🇦 Sudáfrica",
    "30": "🇬🇷 Grecia",
    "31": "🇳🇱 Países Bajos",
    "32": "🇧🇪 Bélgica",
    "33": "🇫🇷 Francia",
    "34": "🇪🇸 España",
    "36": "🇭🇺 Hungría",
    "39": "🇮🇹 Italia",
    "40": "🇷🇴 Rumania",
    "41": "🇨🇭 Suiza",
    "43": "🇦🇹 Austria",
    "44": "🇬🇧 Reino Unido",
    "45": "🇩🇰 Dinamarca",
    "46": "🇸🇪 Suecia",
    "47": "🇳🇴 Noruega",
    "48": "🇵🇱 Polonia",
    "49": "🇩🇪 Alemania",
    "51": "🇵🇪 Perú",
    "52": "🇲🇽 México",
    "53": "🇨🇺 Cuba",
    "54": "🇦🇷 Argentina",
    "55": "🇧🇷 Brasil",
    "56": "🇨🇱 Chile",
    "57": "🇨🇴 Colombia",
    "58": "🇻🇪 Venezuela",
    "591": "🇧🇴 Bolivia",
    "593": "🇪🇨 Ecuador",
    "595": "🇵🇾 Paraguay",
    "598": "🇺🇾 Uruguay",
    "502": "🇬🇹 Guatemala",
    "503": "🇸🇻 El Salvador",
    "504": "🇭🇳 Honduras",
    "505": "🇳🇮 Nicaragua",
    "506": "🇨🇷 Costa Rica",
    "507": "🇵🇦 Panamá",
    "91": "🇮🇳 India",
    "81": "🇯🇵 Japón",
    "82": "🇰🇷 Corea del Sur",
    "86": "🇨🇳 China",
    "90": "🇹🇷 Turquía",
    "351": "🇵🇹 Portugal",
    "380": "🇺🇦 Ucrania",
    "972": "🇮🇱 Israel",
    "971": "🇦🇪 Emiratos Árabes Unidos"
  }

  // Buscar el prefijo más largo que coincida
  for (let i = 4; i > 0; i--) {
    const prefijo = numero.slice(0, i)
    if (prefijos[prefijo]) return prefijos[prefijo]
  }
  return "🌎 Desconocido"
}

// --- Detección del país ---
const usuarioJid = (Array.isArray(m.messageStubParameters) && m.messageStubParameters[0])
  || m.key?.participant
  || m.participant
  || m.sender

const numeroUsuario = usuarioJid.split('@')[0]
const pais = getPais(numeroUsuario)

    // --- Obtener JID del usuario de forma robusta ---
    const usuarioJid = (Array.isArray(m.messageStubParameters) && m.messageStubParameters[0])
      || m.key?.participant
      || m.participant
      || (m.sender ? m.sender : null)

    if (!usuarioJid) {
      console.log('[welcome] no pude obtener usuarioJid, abortando')
      return true
    }

    const numeroUsuario = usuarioJid.split('@')[0]
    const pais = getPais(numeroUsuario)

    // --- Obtener nombre con fallback ---
    let nombre = numeroUsuario
    try {
      const n = await conn.getName?.(usuarioJid)
      if (n && typeof n === 'string' && n.trim()) nombre = n
    } catch (e) { /* ignore */ }

    // --- Perfil (foto) con fallback seguro ---
    let ppUrl = ''
    try {
      ppUrl = await conn.profilePictureUrl?.(usuarioJid, 'image')
    } catch (e) {
      ppUrl = 'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745522645448.jpeg'
    }

    // --- Thumb para quoted contact ---
    let thumbBuffer = null
    try {
      const res = await fetch('https://files.catbox.moe/crdknj.jpg')
      thumbBuffer = await res.buffer()
    } catch (e) {
      thumbBuffer = Buffer.alloc(0)
    }

    const fkontak = {
      key: { participants: "0@s.whatsapp.net", remoteJid: "status@broadcast", fromMe: false, id: "Halo" },
      message: { locationMessage: { name: "MiyukiBot-MD 🌸", jpegThumbnail: thumbBuffer } },
      participant: "0@s.whatsapp.net"
    }

    // --- Fecha / hora ---
    const fechaObj = new Date()
    const hora = fechaObj.toLocaleTimeString('es-PE', { timeZone: 'America/Lima' })
    const fecha = fechaObj.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Lima' })
    const dia = fechaObj.toLocaleDateString('es-PE', { weekday: 'long', timeZone: 'America/Lima' })
    const groupSize = (participants?.length ?? 0) + ((m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) ? 1 : ((m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE || m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE) ? -1 : 0))

    // --- Frases dinámicas ---
    const frasesBienvenida = [
      "🌸 ¡Qué alegría verte aquí!",
      "🌼 ¡Esperábamos tu llegada!",
      "🌺 Bienvenido a nuestra familia.",
      "🎉 ¡Prepárate para una gran aventura!",
      "💫 ¡Un nuevo miembro se une al viaje!"
    ]
    const frasesDespedida = [
      "🍂 Se va un gran miembro...",
      "💨 ¡Hasta pronto, te extrañaremos!",
      "🌧️ Otro amigo se despide.",
      "🍃 Que el viento te guíe a nuevas aventuras.",
      "💔 ¡Nos vemos en otro grupo!"
    ]

    const bienvenidaAleatoria = frasesBienvenida[Math.floor(Math.random() * frasesBienvenida.length)]
    const despedidaAleatoria = frasesDespedida[Math.floor(Math.random() * frasesDespedida.length)]

    const welcomeMessage = [
      `╔═══════❀༺🌸༻❀═══════╗`,
      `           *ＢＩＥＮＶＥＮＩＤＯ／Ａ*`,
      `╚═══════❀༺🌸༻❀═══════╝`,
      ``,
      `${bienvenidaAleatoria}`,
      ``,
      `👤 *Usuario:* @${numeroUsuario} (${nombre})`,
      `🌍 *País:* ${pais}`,
      `💬 *Grupo:* ${groupMetadata?.subject ?? 'Grupo'}`,
      `👥 *Miembros:* ${groupSize}`,
      `📅 *Fecha:* ${dia}, ${fecha}`,
      `🕒 *Hora:* ${hora}`,
      ``,
      `🪷 Usa _.menu_ para ver los comandos.`,
      `> 𝘔𝘪𝘺𝘶𝘬𝘪𝘉𝘰𝘵-𝘔𝘋 | 𝘗𝘰𝘸𝘦𝘳𝘦𝘥 𝘉𝘺 𝘖𝘮𝘢𝘳𝘎𝘳𝘢𝘯𝘥𝘢`
    ].join('\n')

    const byeMessage = [
      `╔═══════❀༺🍁༻❀═══════╗`,
      `                       *ＡＤＩＯＳ*`,
      `╚═══════❀༺🍁༻❀═══════╝`,
      ``,
      `${despedidaAleatoria}`,
      ``,
      `👤 *Usuario:* @${numeroUsuario} (${nombre})`,
      `🌎 *País:* ${pais}`,
      `💬 *Grupo:* ${groupMetadata?.subject ?? 'Grupo'}`,
      `👥 *Miembros restantes:* ${groupSize}`,
      `📅 *Fecha:* ${dia}, ${fecha}`,
      `🕒 *Hora:* ${hora}`,
      ``,
      `> 💐 Esperamos verte pronto nuevamente.`,
      `> 𝘔𝘪𝘺𝘶𝘬𝘪𝘉𝘰𝘵-𝘔𝘋 | 𝘖𝘮𝘢𝘳𝘎𝘳𝘢𝘯𝘥𝘢`
    ].join('\n')

    // --- Contexto para que las menciones funcionen y el preview aparezca ---
    const fakeContext = {
      contextInfo: {
        isForwarded: true,
        mentionedJid: [usuarioJid],
        externalAdReply: {
          title: "MiyukiBot-MD",
          body: "By OmarGranda",
          mediaUrl: null,
          description: null,
          previewType: "PHOTO",
          thumbnailUrl: "https://qu.ax/gauVK.jpg",
          sourceUrl: "https://whatsapp.com",
          mediaType: 1,
          renderLargerThumbnail: false
        }
      }
    }

    // --- Envío robusto: intenta imagen+caption; si falla, envía texto normal ---
    if (chat?.welcome && m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
      try {
        await conn.sendMessage(m.chat, {
          image: { url: ppUrl },
          caption: welcomeMessage,
          mentions: [usuarioJid],
          ...fakeContext
        }, { quoted: fkontak })
      } catch (e) {
        console.log('[welcome] fallo enviar imagen, envío texto fallback:', e?.message ?? e)
        // fallback: enviar texto simple (con mentions)
        try {
          await conn.sendMessage(m.chat, {
            text: welcomeMessage,
            mentions: [usuarioJid],
            ...fakeContext
          }, { quoted: fkontak })
        } catch (e2) {
          console.error('[welcome] error envío fallback texto:', e2)
        }
      }
    }

    if (chat?.welcome && (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE || m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE)) {
      try {
        await conn.sendMessage(m.chat, {
          image: { url: ppUrl },
          caption: byeMessage,
          mentions: [usuarioJid],
          ...fakeContext
        }, { quoted: fkontak })
      } catch (e) {
        console.log('[bye] fallo enviar imagen, envío texto fallback:', e?.message ?? e)
        try {
          await conn.sendMessage(m.chat, {
            text: byeMessage,
            mentions: [usuarioJid],
            ...fakeContext
          }, { quoted: fkontak })
        } catch (e2) {
          console.error('[bye] error envío fallback texto:', e2)
        }
      }
    }

  } catch (err) {
    console.error('[before hook] error general:', err)
    return true
  }
}