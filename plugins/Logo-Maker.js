import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, comando }) => {
    if (!text) return m.reply(
        '*🪴 Ingresa un texto para generar tu logo.*\n\n`🪹 Ejemplo:`\n' +
        `> *${usedPrefix + comando} bot xd*`
    );

    const res3 = await fetch("https://files.catbox.moe/wfd0ze.jpg");
    const thumb3 = Buffer.from(await res3.arrayBuffer());

    await m.react('⏳');
    await conn.reply(m.chat, '*🍃 ᴄʀᴇᴀɴᴅᴏ ᴛᴜ ʟᴏɢᴏ, ᴇsᴘᴇʀᴀ ᴜɴ ᴍᴏᴍᴇɴᴛᴏ.*', m);

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

    try {
        const url = `https://api.vreden.my.id/api/v1/maker/ephoto/glitchtext?text=${encodeURIComponent(text)}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.status && data.result) {
            await conn.sendMessage(
                m.chat,
                { image: { url: data.result }, caption: `\`ᴀǫᴜɪ ᴛɪᴇɴᴇs ᴛᴜ ʟᴏɢᴏ ᴜᴡᴜ\`\n\n> ${global.dev}` },
                { quoted: shadow_log }
            );
            await m.react('✔️');
        } else {
            m.reply('*Ocurrió un error al generar la imagen*');
        }
    } catch (error) {
        console.error(error);
        m.reply('*Error en la API o en la conexión*');
    }
};

handler.help = ['glitch <texto>'];
handler.tags = ['maker'];
handler.command = ['glitch'];
handler.group = true;
handler.register = true;

export default handler;