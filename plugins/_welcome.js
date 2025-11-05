import { WAMessageStubType } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

export async function before(m, { conn, participants, groupMetadata }) {
  try {
    if (!m.messageStubType || !m.isGroup) return true

    const chat = global.db?.data?.chats?.[m.chat] ?? {}

    // --- Función para detectar país por prefijo (completa) ---
    const getPais = (numero) => {
      const paises = {
        "1": "🇺🇸 Estados Unidos / 🇨🇦 Canadá", "7": "🇷🇺 Rusia / 🇰🇿 Kazajistán",
        "20": "🇪🇬 Egipto", "27": "🇿🇦 Sudáfrica", "30": "🇬🇷 Grecia", "31": "🇳🇱 Países Bajos",
        "32": "🇧🇪 Bélgica", "33": "🇫🇷 Francia", "34": "🇪🇸 España", "36": "🇭🇺 Hungría",
        "39": "🇮🇹 Italia", "40": "🇷🇴 Rumania", "41": "🇨🇭 Suiza", "43": "🇦🇹 Austria",
        "44": "🇬🇧 Reino Unido", "45": "🇩🇰 Dinamarca", "46": "🇸🇪 Suecia", "47": "🇳🇴 Noruega",
        "48": "🇵🇱 Polonia", "49": "🇩🇪 Alemania", "51": "🇵🇪 Perú", "52": "🇲🇽 México",
        "53": "🇨🇺 Cuba", "54": "🇦🇷 Argentina", "55": "🇧🇷 Brasil", "56": "🇨🇱 Chile",
        "57": "🇨🇴 Colombia", "58": "🇻🇪 Venezuela", "60": "🇲🇾 Malasia", "61": "🇦🇺 Australia",
        "62": "🇮🇩 Indonesia", "63": "🇵🇭 Filipinas", "64": "🇳🇿 Nueva Zelanda", "65": "🇸🇬 Singapur",
        "66": "🇹🇭 Tailandia", "81": "🇯🇵 Japón", "82": "🇰🇷 Corea del Sur", "84": "🇻🇳 Vietnam",
        "86": "🇨🇳 China", "90": "🇹🇷 Turquía", "91": "🇮🇳 India", "92": "🇵🇰 Pakistán",
        "93": "🇦🇫 Afganistán", "94": "🇱🇰 Sri Lanka", "95": "🇲🇲 Birmania", "98": "🇮🇷 Irán",
        "212": "🇲🇦 Marruecos", "213": "🇩🇿 Argelia", "216": "🇹🇳 Túnez", "218": "🇱🇾 Libia",
        "220": "🇬🇲 Gambia", "221": "🇸🇳 Senegal", "222": "🇲🇷 Mauritania", "223": "🇲🇱 Mali",
        "224": "🇬🇳 Guinea", "225": "🇨🇮 Costa de Marfil", "226": "🇧🇫 Burkina Faso", "227": "🇳🇪 Níger",
        "228": "🇹🇬 Togo", "229": "🇧🇯 Benín", "230": "🇲🇺 Mauricio", "231": "🇱🇷 Liberia",
        "232": "🇸🇱 Sierra Leona", "233": "🇬🇭 Ghana", "234": "🇳🇬 Nigeria", "235": "🇹🇩 Chad",
        "236": "🇨🇫 RCA", "237": "🇨🇲 Camerún", "238": "🇨🇻 Cabo Verde", "239": "🇸🇹 Santo Tomé",
        "240": "🇬🇶 Guinea Ecuatorial", "241": "🇬🇦 Gabón", "242": "🇨🇬 Congo", "243": "🇨🇩 R.D. Congo",
        "244": "🇦🇴 Angola", "248": "🇸🇨 Seychelles", "249": "🇸🇩 Sudán", "250": "🇷🇼 Ruanda",
        "251": "🇪🇹 Etiopía", "252": "🇸🇴 Somalia", "254": "🇰🇪 Kenia", "255": "🇹🇿 Tanzania",
        "256": "🇺🇬 Uganda", "257": "🇧🇮 Burundi", "258": "🇲🇿 Mozambique", "260": "🇿🇲 Zambia",
        "261": "🇲🇬 Madagascar", "263": "🇿🇼 Zimbabue", "264": "🇳🇦 Namibia", "265": "🇲🇼 Malaui",
        "266": "🇱🇸 Lesoto", "267": "🇧🇼 Botsuana", "268": "🇸🇿 Esuatini", "291": "🇪🇷 Eritrea",
        "297": "🇦🇼 Aruba", "351": "🇵🇹 Portugal", "352": "🇱🇺 Luxemburgo", "353": "🇮🇪 Irlanda",
        "354": "🇮🇸 Islandia", "355": "🇦🇱 Albania", "356": "🇲🇹 Malta", "358": "🇫🇮 Finlandia",
        "359": "🇧🇬 Bulgaria", "370": "🇱🇹 Lituania", "371": "🇱🇻 Letonia", "372": "🇪🇪 Estonia",
        "380": "🇺🇦 Ucrania", "381": "🇷🇸 Serbia", "385": "🇭🇷 Croacia", "387": "🇧🇦 Bosnia",
        "389": "🇲🇰 Macedonia", "502": "🇬🇹 Guatemala", "503": "🇸🇻 El Salvador", "504": "🇭🇳 Honduras",
        "505": "🇳🇮 Nicaragua", "506": "🇨🇷 Costa Rica", "507": "🇵🇦 Panamá", "509": "🇭🇹 Haití",
        "591": "🇧🇴 Bolivia", "592": "🇬🇾 Guyana", "593": "🇪🇨 Ecuador", "595": "🇵🇾 Paraguay",
        "597": "🇸🇷 Surinam", "598": "🇺🇾 Uruguay", "670": "🇹🇱 Timor Oriental", "850": "🇰🇵 Corea del Norte",
        "852": "🇭🇰 Hong Kong", "853": "🇲🇴 Macao", "855": "🇰🇭 Camboya", "856": "🇱🇦 Laos",
        "880": "🇧🇩 Bangladesh", "886": "🇹🇼 Taiwán", "960": "🇲🇻 Maldivas", "961": "🇱🇧 Líbano",
        "962": "🇯🇴 Jordania", "963": "🇸🇾 Siria", "964": "🇮🇶 Irak", "965": "🇰🇼 Kuwait",
        "966": "🇸🇦 Arabia Saudita", "967": "🇾🇪 Yemen", "968": "🇴🇲 Omán", "971": "🇦🇪 Emiratos Árabes Unidos",
        "972": "🇮🇱 Israel", "973": "🇧🇭 Baréin", "974": "🇶🇦 Catar", "975": "🇧🇹 Bután",
        "977": "🇳🇵 Nepal", "992": "🇹🇯 Tayikistán", "993": "🇹🇲 Turkmenistán", "994": "🇦🇿 Azerbaiyán",
        "995": "🇬🇪 Georgia", "996": "🇰🇬 Kirguistán", "998": "🇺🇿 Uzbekistán"
      }
      for (let i = 1; i <= 3; i++) {
        const prefijo = numero.slice(0, i)
        if (paises[prefijo]) return paises[prefijo]
      }
      return "🌎 Desconocido"
    }

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
      `     *ＢＩＥＮＶＥＮＩＤＯ／Ａ*`,
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
      `           *ＡＤＩＯＳ*`,
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