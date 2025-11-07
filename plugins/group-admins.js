const handler = async (m, { conn, participants, groupMetadata, args }) => {

  const pp = await conn.profilePictureUrl(m.chat, 'image').catch(_ => 'https://files.catbox.moe/xr2m6u.jpg')

  const groupAdmins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin')
  const listAdmin = groupAdmins.map(v => `● @${v.id.split('@')[0]}`).join('\n')

  const owner = groupMetadata.owner || groupAdmins.find(a => a.admin === 'superadmin')?.id || m.chat.split`-`[0] + '@s.whatsapp.net'

  const pesan = args.join(' ')
  const msg = pesan ? pesan : 'Sin especificar'

  const texto = `『✦』*Admins del grupo:*  
  
${listAdmin}

❍ *Mensaje:* ${msg}`

  await conn.sendMessage(m.chat, {
    image: { url: pp },
    caption: texto,
    mentions: [...groupAdmins.map(v => v.id), owner]
  }, { quoted: m })
}

handler.help = ['admins']
handler.tags = ['grupo']
handler.command = /^(admins|@admins|dmins)$/i
handler.group = true

export default handler