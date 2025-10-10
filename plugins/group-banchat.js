let handler = async (m, { conn, usedPrefix, command, args }) => {
  const chat = global.db.data.chats[m.chat];
  const estadoActual = chat.isBanned ? '✗ Desactivado' : '✓ Activado';
  const bot = global.botname;

  if (!args[0]) {
    const info = `
╭━━━〔 ⚙️ *Control del Bot* 〕━━⬣
┃ ✦ Un *administrador* puede:
┃
┃ 🟢 Activar » *${usedPrefix}bot enable*
┃ 🔴 Desactivar » *${usedPrefix}bot disable*
┃
┃ ✧ Estado actual » *${estadoActual}*
╰━━━━━━━━━━━━━━━━━━⬣`;
    return conn.reply(m.chat, info, m);
  }

  const arg = args[0].toLowerCase();

  if (['off', 'disable', 'desactivar'].includes(arg)) {
    if (chat.isBanned) 
      return conn.reply(m.chat, `⚠️ *${bot}* ya estaba *desactivado.*`, m);
    
    chat.isBanned = true;
    return conn.reply(m.chat, `🔒 Has *desactivado* a *${bot}* en este grupo.`, m);
  }

  if (['on', 'enable', 'activar'].includes(arg)) {
    if (!chat.isBanned)
      return conn.reply(m.chat, `⚠️ *${bot}* ya estaba *activado.*`, m);
    
    chat.isBanned = false;
    return conn.reply(m.chat, `✅ Has *activado* a *${bot}* en este grupo.`, m);
  }

  return conn.reply(m.chat, `❌ Opción no válida.\nUsa *${usedPrefix}bot enable* o *${usedPrefix}bot disable*`, m);
};

handler.help = ['bot [enable|disable]'];
handler.tags = ['grupo'];
handler.command = ['bot'];
handler.admin = true;

export default handler;