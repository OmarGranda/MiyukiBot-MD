import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
try {
if (!text) return conn.reply(m.chat, `❀ Por favor, ingresa el nombre del Pokémon que deseas buscar.`, m)

await m.react('🕒')

const url = `https://some-random-api.com/pokemon/pokedex?pokemon=${encodeURIComponent(text)}`
const response = await fetch(url)
const json = await response.json()

if (!response.ok || !json?.name) {
    await m.react('✖️')
    return conn.reply(m.chat, `⚠️ No se encontró ese Pokémon, intenta con otro nombre.`, m)
}

// Separar datos
let tipos = json.type?.join(', ') || json.type || 'Desconocido'
let habilidades = json.abilities?.join(', ') || json.abilities || 'Desconocidas'
let genero = json.gender?.join(', ') || json.gender || '—'
let categoria = json.category || '—'
let stats = json.stats || {}
let descripcion = json.description || 'Sin descripción disponible.'

// Calcular debilidades según tipos
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
        if (typeWeakness[t]) debilidades.push(...typeWeakness[t])
    })
}
debilidades = [...new Set(debilidades)].join(', ') || '—'

// Nuevo diseño tipo tarjeta Pokédex
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
• ❤️ HP: ${stats.hp}
• 🗡️ Ataque: ${stats.attack}
• 🛡️ Defensa: ${stats.defense}
• 🔥 Ataque Esp.: ${stats.sp_atk}
• 🧱 Defensa Esp.: ${stats.sp_def}
• ⚡ Velocidad: ${stats.speed}

📜 *Descripción:* 
${descripcion}

🔗 *Más información:*  
https://www.pokemon.com/es/pokedex/${json.name.toLowerCase()}

╰━━━━━━━━━━━━━━━━━━━━━━╯
`

// Enviar imagen + texto
await conn.sendFile(
    m.chat,
    json.sprites?.animated || json.sprites?.normal || '',
    `${json.name}.jpg`,
    pokedex,
    m
)

await m.react('✔️')

} catch (error) {
await m.react('✖️')
await conn.reply(
    m.chat,
    `⚠︎ Se ha producido un problema.\n> Usa *${usedPrefix}report* para informarlo.\n\n${error.message}`,
    m
)
}}

handler.help = ['pokedex']
handler.tags = ['fun']
handler.command = ['pokedex']
handler.group = true

export default handler