let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    let user = global.db.data.users[m.sender]
    if (!user) return m.reply("❗ Tu usuario no existe en la base de datos.")

    // Cooldown de 7 segundos
    if (!global.battleCD) global.battleCD = {}
    let now = Date.now()
    let wait = 7000
    if (global.battleCD[m.sender] && now - global.battleCD[m.sender] < wait) {
      let faltan = ((global.battleCD[m.sender] + wait) - now) / 1000
      return m.reply(`⏳ Debes esperar *${faltan.toFixed(1)}s* para volver a pelear.`)
    }
    global.battleCD[m.sender] = now

    await m.react('⚔️')

    const monsters = [
      { name: "Slime", hp: 50, atk: 10 },
      { name: "Goblin", hp: 80, atk: 18 },
      { name: "Lobo Salvaje", hp: 110, atk: 22 },
      { name: "Esqueleto", hp: 140, atk: 28 },
    ]

    let mentioned = m.mentionedJid?.[0]
    let enemy


    if (mentioned) {
      if (!global.db.data.users[mentioned])
        return m.reply("❌ Ese usuario no está registrado en la base de datos.")
      if (mentioned === m.sender)
        return m.reply("😹 No puedes pelear contigo mismo.")

      enemy = {
        name: conn.getName(mentioned),
        hp: global.db.data.users[mentioned].health || 100,
        atk: 20
      }
    } else {
    
      enemy = monsters[Math.floor(Math.random() * monsters.length)]
    }

    let playerAtk = Math.floor(Math.random() * 30) + 10
    if (Math.random() < 0.15) playerAtk *= 2

    let enemyAtk = Math.floor(Math.random() * enemy.atk) + 5
    if (Math.random() < 0.10) enemyAtk *= 2
    user.health -= enemyAtk
    if (user.health < 0) user.health = 0

    if (mentioned) {
      let ene = global.db.data.users[mentioned]
      ene.health -= playerAtk
      if (ene.health < 0) ene.health = 0
    }

    let coins = Math.floor(Math.random() * 70) + 30
    let exp = Math.floor(Math.random() * 50) + 15

    user.coin += coins
    user.exp += exp

    setTimeout(() => {
      try {
        let u = global.db.data.users[m.sender]
        if (!u) return
        u.health += 40
        if (u.health > 100) u.health = 100
      } catch { }
    }, 300000) // 5 minutos = 300k ms

    let txt = `⚔️ *B A T A L L A* ⚔️

👤 *Jugador:* ${m.name}
❤️ *Vida:* ${user.health}

${mentioned
  ? `🤺 *Enemigo:* @${enemy.name}\n❤️ Vida enemigo: ${global.db.data.users[mentioned].health}`
  : `👹 *Monstruo:* ${enemy.name}`
}

🗡️ *Tu daño:* ${playerAtk}
💥 *Daño enemigo:* ${enemyAtk}

🎁 *Recompensas:*
> 💰 +${coins} coins  
> ⭐ +${exp} exp

⏳ *Tu vida se regenerará automáticamente en 5 minutos…*`

    await conn.reply(m.chat, txt, m, {
      mentions: mentioned ? [mentioned] : []
    })

    await m.react('✔️')

  } catch (e) {
    await m.react('✖️')
    console.error(e)
    m.reply(`❌ Ocurrió un error inesperado.\n\n${e}`)
  }
}

handler.help = ['batalla', 'pelea']
handler.command = ['batalla', 'pelea']
handler.tags = ['games']
handler.group = true

export default handler