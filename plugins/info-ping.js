import speed from 'performance-now'
import { spawn, exec, execSync } from 'child_process'

let handler = async (m, { conn }) => {
    const start = new Date().getTime();
await m.react('🚀')
    const { key } = await conn.sendMessage(m.chat, {text: `Cargando Datos 📡`}, {quoted: m});
    const end = new Date().getTime();

    const latency = end - start;
    const seconds = (latency / 1000).toFixed(1);

    const uptime = process.uptime(); // en segundos
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const secondsUp = Math.floor(uptime % 60);
    const uptimeFormatted = `${hours}h ${minutes}m ${secondsUp}s`;

    const usedRAM = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2); // en MB

    setTimeout(async () => {
        let response = `╭━━━〔 🍄 𝙎𝙩𝙖𝙩𝙪𝙨 𝙋𝙞𝙣𝙜 🪴 〕━━⬣
│ 📌 *\`Ping:\`* ${latency} ms
│ 🍁 *\`Latencia:\`* ${latensi.toFixed(4)} ms
│ 🕸 *\`RAM usada:\`* ${usedRAM} MB
│ 🍧 *\`Uptime:\`* ${uptimeFormatted}
│ ⏰ *\`Fecha/Hora:\`* ${fechaHora}
╰━━━〔 𝙈𝙞𝙮𝙪𝙠𝙞𝘽𝙤𝙩-𝙈𝘿 🌸 〕━━⬣

 © 𝘗𝘰𝘸𝘦𝘳𝘦𝘥 𝘉𝘺 𝘖𝘮𝘢𝘳𝘎𝘳𝘢𝘯𝘥𝘢`;

        await m.react('✅')
        await conn.sendMessage(m.chat, { text: response, edit: key, mentions: [m.sender] }, { quoted: m });
    }, latency);
};

handler.help = ['ping']
handler.tags = ['info']
handler.command = ['ping', 'p']

export default handler