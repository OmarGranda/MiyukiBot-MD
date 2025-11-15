// === AntiBot2 Handler Completo === // Este archivo contiene: // - Middleware "before" corregido // - Comandos: antibot2on / antibot2off / antibot2 // Compatible con Baileys y sistemas tipo Multi-Device

import { areJidsSameUser } from '@whiskeysockets/baileys'

// ======== MIDDLEWARE ======== export async function before(m, { participants, conn }) { if (!m.isGroup) return;

let chat = global.db.data.chats[m.chat];
if (!chat) global.db.data.chats[m.chat] = {};
chat = global.db.data.chats[m.chat];

if (!chat.antiBot2) return;

let botJid = global.conn.user.jid;
let currentBotJid = conn.user.jid;

if (areJidsSameUser(botJid, currentBotJid)) return;

let isBotPresent = participants.some(p => areJidsSameUser(botJid, p.id));

if (isBotPresent) {
    setTimeout(async () => {
        await conn.reply(
            m.chat,
            `《✧》El bot principal está en este grupo, así que me retiraré para evitar spam.`,
            m
        );
        await conn.groupLeave(m.chat);
    }, 5000);
}

}

// ======== COMANDOS ========

let handler = async (m, { conn, command }) => { let chat = global.db.data.chats[m.chat]; if (!chat) global.db.data.chats[m.chat] = {}; chat = global.db.data.chats[m.chat];

switch (command) {
    case 'antibot2on':
        chat.antiBot2 = true;
        conn.reply(m.chat, '🔰 AntiBot2 ha sido ACTIVADO.', m);
        break;

    case 'antibot2off':
        chat.antiBot2 = false;
        conn.reply(m.chat, '❌ AntiBot2 ha sido DESACTIVADO.', m);
        break;

    case 'antibot2':
        let estado = chat.antiBot2 ? '🟢 ACTIVADO' : '🔴 DESACTIVADO';
        conn.reply(m.chat, `⚙️ Estado actual de AntiBot2: ${estado}`, m);
        break;
}

};

handler.command = ['antibot2on', 'antibot2off', 'antibot2']; \export default handler;