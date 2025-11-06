// handler-glitch.js
let handler = async (m, { conn, text, usedPrefix, comando }) => {
  try {
    if (!text) return await m.reply(
      '*🪴 Ingresa un texto para generar tu logo.*\n\n`🪹 Ejemplo:`\n' +
      `> *${usedPrefix + (comando || 'glitch')} bot xd*`
    );

    // obtener un fetch compatible (global o node-fetch dinámico)
    let fetcher = (typeof fetch !== 'undefined') ? fetch : null;
    if (!fetcher) {
      try {
        const mod = await import('node-fetch');
        fetcher = mod.default || mod;
      } catch (err) {
        console.error('No se pudo cargar node-fetch:', err);
      }
    }
    if (!fetcher) throw new Error('fetch no disponible en este entorno.');

    // mini thumb
    const res3 = await fetcher("https://files.catbox.moe/wfd0ze.jpg");
    const thumb3 = Buffer.from(await res3.arrayBuffer());

    await m.react && m.react('⏳');
    await conn.reply && conn.reply(m.chat, '*🍃 ᴄʀᴇᴀɴᴅᴏ ᴛᴜ ʟᴏɢᴏ, ᴇsᴘᴇʀᴀ ᴜɴ ᴍᴏᴍᴇɴᴛᴏ.*', m);

    const shadow_log = {
      key: { fromMe: false, participant: "0@s.whatsapp.net" },
      message: {
        documentMessage: {
          title: "🚀 𝗟𝗢𝗚𝗢 𝗖𝗥𝗘𝗔𝗗𝗢 𝗖𝗢𝗡 𝗘𝗫𝗜𝗧𝗢.",
          fileName: global.botname || "Bot",
          jpegThumbnail: thumb3
        }
      }
    };

    // llama a la API
    const url = `https://api.vreden.my.id/api/v1/maker/ephoto/glitchtext?text=${encodeURIComponent(text)}`;
    const response = await fetcher(url);

    if (!response.ok) {
      // intenta leer cuerpo si hay info
      let errText = await response.text().catch(() => '');
      throw new Error(`La API respondió con status ${response.status}. ${errText ? ('Mensaje: ' + errText) : ''}`);
    }

    const data = await response.json().catch(() => null);
    if (!data) throw new Error('Respuesta inválida de la API (no JSON).');

    // detectar dónde está la imagen en la respuesta
    // la API podría devolver: { status: true, result: 'https://...' } o { result: { url: '...' } } etc.
    let imgCandidate = null;
    if (data.result) {
      if (typeof data.result === 'string') imgCandidate = data.result;
      else if (typeof data.result === 'object') {
        imgCandidate = data.result.url || data.result.image || data.result.src || data.result.path || null;
      }
    }
    // fallback a propiedades comunes
    imgCandidate = imgCandidate || data.url || data.image || (data.data && data.data.url) || null;

    if (!imgCandidate) {
      throw new Error('No se encontró la imagen en la respuesta de la API.');
    }

    // Si es una URL HTTP -> enviar como imagen por URL
    if (typeof imgCandidate === 'string' && /^https?:\/\//i.test(imgCandidate)) {
      await conn.sendMessage(
        m.chat,
        {
          image: { url: imgCandidate },
          caption: `\`ᴀǫᴜɪ ᴛɪᴇɴᴇs ᴛᴜ ʟᴏɢᴏ ᴜᴡᴜ\`\n\n> ${global.dev || ''}`
        },
        { quoted: shadow_log }
      );
      await m.react && m.react('✔️');
      return;
    }

    // Si es data URI base64: data:image/png;base64,AAAA...
    if (typeof imgCandidate === 'string' && /^data:image\/[a-zA-Z]+;base64,/.test(imgCandidate)) {
      const base64 = imgCandidate.split(',')[1];
      const buffer = Buffer.from(base64, 'base64');
      await conn.sendMessage(m.chat, { image: buffer, caption: `\`ᴀǫᴜɪ ᴛɪᴇɴᴇs ᴛᴜ ʟᴏɢᴏ ᴜᴡᴜ\`\n\n> ${global.dev || ''}` }, { quoted: shadow_log });
      await m.react && m.react('✔️');
      return;
    }

    // Si la API devolvió un "path" relativo o algún otro string: intentamos descargar ese recurso
    try {
      const r2 = await fetcher(imgCandidate);
      if (!r2.ok) throw new Error('No se pudo descargar la imagen secundaria.');
      const buffer = Buffer.from(await r2.arrayBuffer());
      await conn.sendMessage(m.chat, { image: buffer, caption: `\`ᴀǫᴜɪ ᴛɪᴇɴᴇs ᴛᴜ ʟᴏɢᴏ ᴜᴡᴜ\`\n\n> ${global.dev || ''}` }, { quoted: shadow_log });
      await m.react && m.react('✔️');
      return;
    } catch (err) {
      console.error('Error al intentar descargar imgCandidate:', err);
      throw new Error('No se pudo obtener la imagen final desde la respuesta de la API.');
    }

  } catch (error) {
    console.error('Handler glitch error:', error);
    try { await m.react && m.react('✖️'); } catch {}
    return await m.reply('*Error en la generación del logo.*\nReporta con: ' + (usedPrefix ? `${usedPrefix}report` : 'comando de report'), m);
  }
};

handler.help = ['glitch <texto>'];
handler.tags = ['maker'];
handler.command = ['glitch'];
handler.group = true;
handler.register = true;

export default handler;