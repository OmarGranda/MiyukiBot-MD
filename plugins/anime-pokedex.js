import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
try {

if (!text) return conn.reply(m.chat, `❀ Por favor, ingresa el nombre del Pokémon que deseas buscar.`, m)

await m.react('🕒')

const url = `https://some-random-api.com/pokemon/pokedex?pokemon=${encodeURIComponent(text)}`
const response = await fetch(url)
const json = await response.json()

// Validación
if (!response.ok || !json?.name) {
    await m.react('✖️')
    return conn.reply(m.chat, `⚠️ No se encontró ese Pokémon. Intenta con otro nombre.`, m)
}

// Procesar campos
let tipos = json.type || "Desconocido"
let habilidades = json.abilities || "Desconocidas"
let genero = json.gender || "—"
let categoria = json.category || "—"
let descripcion = json.description || "Sin descripción disponible."

let stats = json.stats || {
    hp: "—", attack: "—", defense: "—",
    sp_atk: "—", sp_def: "—", speed: "—"
}

// Cálculo de debilidades según el tipo
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
tipos.split(",").map(t => t.trim()).forEach(t => {
    if (typeWeakness[t]) debilidades.push(...typeWeakness[t])
})
debilidades = [...new Set(debilidades)].join(", ") || "—"

// 🔥 NUEVO DISEÑO
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
• 🔥 At. Especial: ${stats.sp_atk}
• 🧱 Def. Especial: ${stats.sp_def}
• ⚡ Velocidad: ${stats.speed}

📜 *Descripción:* 
${descripcion}

🔗 *Más info:*  
https://www.pokemon.com/es/pokedex/${json.name.toLowerCase()}

╰━━━━━━━━━━━━━━━━━━━━━━╯
`

// 🔥 IMAGEN — Corrección final
let imagenPokemon =
    json.sprites?.animated ||
    json.sprites?.normal ||
    null

if (imagenPokemon) {
    await conn.sendFile(
        m.chat,
        imagenPokemon,
        `${json.name}.png`,
        pokedex,
        m
    )
} else {
    await conn.reply(m.chat, pokedex, m)
}

await m.react('✔️')

} catch (error) {
await m.react('✖️')
await conn.reply(m.chat, `⚠︎ Se produjo un error.\n\n${error.message}`, m)
}}

handler.help = ['pokedex']
handler.tags = ['fun']
handler.command = ['pokedex']
handler.group = true

export default handler