import fetch from 'node-fetch';

export async function before(m, { conn }) {
  if (!m.text || !global.prefix.test(m.text)) return;

  const usedPrefix = global.prefix.exec(m.text)[0];
  const command = m.text.slice(usedPrefix.length).trim().split(' ')[0].toLowerCase();

  const thumbRes = await fetch("https://qu.ax/hHhch.jpg");
  const thumbBuffer = await thumbRes.buffer();

  const fkontak = {
    key: {
      participants: "0@s.whatsapp.net",
      remoteJid: "status@broadcast",
      fromMe: false,
      id: "Hola"
    },
    message: {
      locationMessage: {
        name: `MiyukiBot-MD`,
        jpegThumbnail: thumbBuffer
      }
    },
    participant: "0@s.whatsapp.net"
  };

  if (!command || command === 'bot') return;

  const isValidCommand = (command, plugins) => {
    for (let plugin of Object.values(plugins)) {
      const cmdList = Array.isArray(plugin.command) ? plugin.command : [plugin.command];
      if (cmdList.includes(command)) return true;
    }
    return false;
  };

  if (isValidCommand(command, global.plugins)) {
    let chat = global.db.data.chats[m.chat];
    let user = global.db.data.users[m.sender];

    if (chat?.isBanned) {
      const avisoDesactivado = `╭─── MiyukiBot-MD ───╮
│ ⚙️ El bot está *desactivado* en este grupo.
│ 🕓 Espera a que un *admin* lo active.
│ 💡 Usa: *${usedPrefix}bot on*
╰────────────────────╯`;

      await conn.sendMessage(m.chat, {
        text: avisoDesactivado,
        mentions: [m.sender],
        contextInfo: {
          externalAdReply: {
            title: 'MiyukiBot-MD',
            body: '© Powered by OmarGranda',
            thumbnailUrl: icono,
            sourceUrl: 'https://github.com/OmarGranda',
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: fkontak });
      return;
    }

    if (!user.commands) user.commands = 0;
    user.commands += 1;
    return;
  }

  // --- Mensaje cuando no existe el comando ---
  const mensajesNoEncontrado = [
    `❌ El comando *"${command}"* no existe.\n💬 Usa *${usedPrefix}menu* para ver todos los disponibles.`,
    `⚠️ No encontré el comando *"${command}"*.\n📖 Revisa *${usedPrefix}menu* para opciones válidas.`,
    `🧩 *"${command}"* no es un comando válido.\n➡️ Usa *${usedPrefix}menu* para ver los comandos.`,
    `💭 No reconozco *"${command}"*.\n✨ Mira *${usedPrefix}menu* para ver qué puedo hacer.`,
    `🔍 El comando *"${command}"* no está registrado.\n💡 Usa *${usedPrefix}menu* para ver la lista completa.`
  ];

  const texto = mensajesNoEncontrado[Math.floor(Math.random() * mensajesNoEncontrado.length)];
  const thumb = banner;

  await conn.sendMessage(m.chat, {
    text: texto,
    mentions: [m.sender],
    contextInfo: {
      externalAdReply: {
        title: 'MiyukiBot-MD',
        body: '© Powered by OmarGranda',
        thumbnailUrl: thumb,
        sourceUrl: 'https://instagram.com',
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: fkontak });
}