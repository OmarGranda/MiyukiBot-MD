import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
try {
    if (!text) 
        return conn.reply(m.chat, `❀ Por favor, ingresa el nombre del Pokémon que deseas buscar.`, m)

    await m.react('🕒')

    const url = `https://some-random-api.com/pokemon/pokedex?pokemon=${encodeURIComponent(text)}`
    const response = await fetch(url)
    const json = await response.json()

    if (!response.ok || !json?.name) {
        await m.react('✖️')
        return conn.reply(m.chat, `⚠️ No se encontró ese Pokémon, intenta con otro nombre.`, m)
    }

    // Normalizar valores (porque la API a veces manda string o array)
    const normalize = (val) => Array.isArray(val) ? val.join(', ') : (val || '—')

    let tipos = normalize(json.type)
    let habilidades = normalize(json.abilities)
    let genero = normalize(json.gender)
    let categoria = json.category || '—'
    let descripcion = json.description || 'Sin descripción disponible.'
    let stats = json.stats || {}

    // Sistema de debilidades simple
    const typeWeakness = {
        Fire: ["Water", "Ground", "Rock"],
        Water: ["Electric", "Grass"],
        Grass: ["Fire", "Ice", "Poison", "Flying", "Bug"],
        Electric: ["Ground"],
        Ice: ["Fire", "Fighting", "Rock", "Steel"],
        Fighting: ["Flying", "Psychic", "Fairy"],
        Poison: ["Ground", "Psychic"],
        Ground: ["Water", "Grass", "Ice"],
        Flying: ["Electric", "Ice", "Rock"],
        Psychic: ["Bug", "Ghost", "Dark"],
        Bug: ["Fire", "Flying", "Rock"],
        Rock: ["Water", "Grass", "Fighting", "Ground", "Steel"],
        Ghost: ["Ghost", "Dark"],
        Dragon: ["Ice", "Dragon", "Fairy"],
        Dark: ["Fighting", "Bug", "Fairy"],
        Steel: ["Fire", "Fighting", "Ground"],
        Fairy: ["Poison", "Steel"]
    }

    let debilidades = []

    if (Array.isArray(json.type)) {
        json.type.forEach(t => {
            let fix = t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()
            if (typeWeakness[fix]) debilidades.push(...typeWeakness[fix])
        })
    }

    debilidades = debilidades.length ? [...new Set(debilidades)].join(', ') : '—'

    // Texto bonito
    let pokedex = `
╭━━━〔 *📘 P O K É D E X* 〕━━━╮

🎴 *Nombre:* ${json.name}
🔢 *ID:* ${json.id}

🔥 *Tipo:* ${tipos}
✨ *Habilidades:* ${habilidades}

🚻 *Género:* ${genero}
🏷️ *Categoría:* ${categoria}

📏 *Altura:* ${json.height}
⚖️ *Peso:* ${json.weight}

⚠️ *Debilidades:* ${debilidades}

📊 *Estadísticas Base:*
• ❤️ HP: ${stats.hp || '—'}
• 🗡️ Ataque: ${stats.attack || '—'}
• 🛡️ Defensa: ${stats.defense || '—'}
• 🔥 Ataque Esp.: ${stats.sp_atk || '—'}
• 🧱 Defensa Esp.: ${stats.sp_def || '—'}
• ⚡ Velocidad: ${stats.speed || '—'}

📜 *Descripción:* 
${descripcion}

🔗 *Más información:*  
https://www.pokemon.com/es/pokedex/${json.name.toLowerCase()}

╰━━━━━━━━━━━━━━━━━━━━━━╯
`

    // Seleccionar sprite válido
    let img =
        json.sprites?.animated ||
        json.sprites?.normal ||
        json.sprites?.large ||
        json.sprites?.thumbnail ||
        json.sprites?.front_default ||
        json.sprite ||
        json.image ||
        null

    // Si NO hay imagen, mando solo el texto
    if (!img) {
        await conn.reply(m.chat, pokedex, m)
        await m.react('✔️')
        return
    }

    // Enviar imagen + texto
    await conn.sendFile(m.chat, img, `${json.name}.jpg`, pokedex, m)

    await m.react('✔️')

} catch (error) {
    await m.react('✖️')
    await conn.reply(
        m.chat,
        `⚠︎ Ocurrió un error al obtener el Pokémon.\n\n${error.message}`,
        m
    )
}}

handler.help = ['pokedex']
handler.tags = ['fun']
handler.command = ['pokedex']
handler.group = true

export default handler