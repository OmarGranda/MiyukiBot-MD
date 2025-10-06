import axios from 'axios';

let handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) return conn.reply(
    m.chat,
    `🌸 *Ingresa el nombre de una canción o artista para buscar en SoundCloud.*\n\n` +
    `💡 *Ejemplo:* \n> ${usedPrefix + command} Tokyo Nights`,
    m,
    rcanal
  );

  await m.react('🎧');

  try {
    const response = await axios.get(`https://apis-starlights-team.koyeb.app/starlight/soundcloud-search?text=${encodeURIComponent(text)}`);

    if (response.data && Array.isArray(response.data)) {
      const results = response.data;

      if (results.length > 0) {
        for (let i = 0; i < results.length; i++) {
          let track = results[i];

          let txt = `
╭───────────────────────╮
│ 🌺 *ＭＩＹＵＫＩＢＯＴ - ＭＤ* 🌺
╰───────────────────────╯
🎵 *SoundCloud Search Result* 🎶

💫 *N°:* ${i + 1}
🎼 *Título:* ${track.title || 'Sin título'}
👤 *Artista:* ${track.artist || 'Desconocido'}
🎧 *Reproducciones:* ${track.repro || 'N/A'}
⏱️ *Duración:* ${track.duration || 'N/A'}
🪶 *Creador:* ${track.creator || 'Desconocido'}
🌐 *URL:* ${track.url}

🖼️ *Portada:* ${track.image}

╭───────────────────────╮
│ 🌸 *Disfruta tu música con estilo* 💖
╰───────────────────────╯
`;

          await conn.sendMessage(m.chat, { text: txt }, { quoted: m });
        }

        await m.react('✅');
      } else {
        await m.react('❌');
        await conn.reply(m.chat, '🌙 *No se encontraron resultados en SoundCloud.*', m);
      }
    } else {
      await m.react('⚠️');
      await conn.reply(m.chat, '🚧 *Error al obtener datos de la API de SoundCloud.*', m);
    }
  } catch (error) {
    console.error(error);
    await m.react('💥');
    await conn.reply(m.chat, '❌ *Hubo un error al procesar la solicitud. Intenta nuevamente más tarde.*', m);
  }
};

handler.tags = ['buscador'];
handler.help = ['soundcloudsearch *<texto>*'];
handler.command = ['soundcloudsearch', 'scsearch'];
handler.register = true;
handler.coin = 5;

export default handler;