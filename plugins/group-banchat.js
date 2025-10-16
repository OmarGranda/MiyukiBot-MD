let handler = async (m, { conn, usedPrefix, command, args }) => {
  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {};
  let chat = global.db.data.chats[m.chat];

  if (command === 'bot') {
    if (!args || args.length === 0) {
      const estado = chat.isBanned ? '✘ 𝘿𝙀𝙎𝘼𝘾𝙏𝙄𝙑𝘼𝘿𝙊 🌙' : '✔ 𝘼𝘾𝙏𝙄𝙑𝙊 🌸';
      const info = `
╭───🌸 〘 *MiyukiBot-MD Control Center* 〙 🌸───╮
│
│ 💫 *Solo los administradores pueden controlar a Miyuki.*
│
│ 🎀 *Comandos Disponibles:*
│    ◦ ${usedPrefix}bot on  ➜ *Activar a Miyuki*
│    ◦ ${usedPrefix}bot off ➜ *Descansar a Miyuki*
│
│ 🌷 *Estado Actual:* ${estado}
│
│ 🩵 *Miyuki siempre cuidando de su servidor con amor~* 💌
│
╰───❀ 〘 *MiyukiBot-MD* 〙❀───╯`;
      return conn.reply(m.chat, info, m);
    }

    if (args[0].toLowerCase() === 'off') {
      if (chat.isBanned) {
        return conn.reply(m.chat, `😴 *Miyuki ya está descansando en este grupo...* 🌙`, m);
      }
      chat.isBanned = true;
      return conn.reply(m.chat, `💤 *Miyuki entra en modo descanso... el grupo queda en calma.* 💤`, m);
    }

    if (args[0].toLowerCase() === 'on') {
      if (!chat.isBanned) {
        return conn.reply(m.chat, `🌸 *Miyuki ya está despierta y lista para ayudarte!* 💖`, m);
      }
      chat.isBanned = false;
      return conn.reply(m.chat, `✨ *Miyuki vuelve al grupo con energía y ternura~* 💕`, m);
    }

    return conn.reply(m.chat, `❀ *Uso correcto:* ${usedPrefix}bot [on/off]`, m);
  }
};

handler.help = ['bot'];
handler.tags = ['grupo'];
handler.command = ['bot'];
handler.admin = true;

export default handler;