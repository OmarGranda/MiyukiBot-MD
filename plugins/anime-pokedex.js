import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  try {
    // Validación de entrada
    if (!text) return conn.reply(m.chat, `❀ Por favor, ingresa el nombre del Pokémon que deseas buscar.`, m)

    await m.react && m.react('🕒') // reacciona si la función existe

    // Petición a la API (asegúrate de que la API esté disponible)
    const url = `https://some-random-api.com/pokemon/pokedex?pokemon=${encodeURIComponent(text.trim())}`
    const response = await fetch(url)
    // Si la respuesta HTTP no es OK, leer posible JSON de error y notificar
    if (!response.ok) {
      let errText = ''
      try { const errJson = await response.json(); errText = errJson?.message || JSON.stringify(errJson) } catch { errText = await response.text().catch(()=> '') }
      await m.react && m.react('✖️')
      return conn.reply(m.chat, `⚠️ No se pudo obtener información (status ${response.status}).\n${errText || ''}`, m)
    }

    const json = await response.json()

    // Validación básica del JSON devuelto
    if (!json || !json.name) {
      await m.react && m.react('✖️')
      return conn.reply(m.chat, `⚠️ No se encontró ese Pokémon. Revisa la ortografía o prueba otro nombre.`, m)
    }

    // ---------- Procesamiento y fallbacks ----------
    const safe = (v, d = '—') => (v === undefined || v === null || v === '') ? d : v

    // Tipos y habilidades: la API puede devolver arrays o strings separados por comas
    const normalizeList = (v) => {
      if (!v) return 'Desconocido'
      if (Array.isArray(v)) return v.join(', ')
      if (typeof v === 'string') return v.includes(',') ? v.split(',').map(s=>s.trim()).join(', ') : v
      return String(v)
    }

    const tipos = normalizeList(json.type)
    const habilidades = normalizeList(json.abilities)
    const genero = normalizeList(json.gender) || '—'
    const categoria = safe(json.category, '—')
    const descripcion = safe(json.description, 'Sin descripción disponible.')
    const altura = safe(json.height, '—')
    const peso = safe(json.weight, '—')
    const id = safe(json.id, '—')
    const nombre = safe(json.name, 'Desconocido')

    // Estadísticas: la API puede usar distintas claves, así que buscamos varias alternativas
    const statsRaw = json.stats || {}
    const getStat = (obj, keys) => {
      for (const k of keys) {
        if (obj[k] !== undefined && obj[k] !== null && obj[k] !== '') return obj[k]
        if (obj[k.toLowerCase()] !== undefined) return obj[k.toLowerCase()]
        if (obj[k.toUpperCase()] !== undefined) return obj[k.toUpperCase()]
      }
      return '—'
    }

    const stats = {
      hp: getStat(statsRaw, ['hp', 'HP', 'Hp']),
      attack: getStat(statsRaw, ['attack', 'Attack', 'atk', 'ATK']),
      defense: getStat(statsRaw, ['defense', 'Defense', 'def']),
      sp_atk: getStat(statsRaw, ['sp_atk', 'special-attack', 'special_attack', 'Sp. Atk', 'spAttack']),
      sp_def: getStat(statsRaw, ['sp_def', 'special-defense', 'special_defense', 'Sp. Def', 'spDef']),
      speed: getStat(statsRaw, ['speed', 'Speed'])
    }

    // Calcular debilidades basadas en tipos (simple mapa, no 100% completo)
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

    let debilidadesList = []
    tipos.split(',').map(t => t.trim()).forEach(t => {
      // Normalizar primera letra mayúscula para buscar en el mapa
      const key = t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()
      if (typeWeakness[key]) debilidadesList.push(...typeWeakness[key])
    })
    const debilidades = [...new Set(debilidadesList)].join(', ') || '—'

    // Diseño (texto)
    const pokedex = `
╭━━━〔 *📘 P O K É D E X* 〕━━━╮

🎴 *Nombre:* ${nombre}
🔢 *ID:* ${id}

🔥 *Tipo:* ${tipos}
✨ *Habilidades:* ${habilidades}

🚻 *Género:* ${genero}
🏷️ *Categoría:* ${categoria}

📏 *Altura:* ${altura}
⚖️ *Peso:* ${peso}

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
https://www.pokemon.com/es/pokedex/${String(nombre).toLowerCase()}

╰━━━━━━━━━━━━━━━━━━━━━━╯
`.trim()

    // ---------- Obtener imagen (varias rutas posibles) ----------
    const imagenPokemon =
      json.sprites?.animated ||
      json.sprites?.normal ||
      json.sprite ||
      json.image ||
      json.sprites?.front_default ||
      null

    // Enviar imagen si existe, si no enviar solo texto
    if (imagenPokemon) {
      // sendFile acepta URL remota en muchos frameworks de bots
      await conn.sendFile
        ? await conn.sendFile(m.chat, imagenPokemon, `${nombre.replace(/\s+/g,'_')}.png`, pokedex, m)
        : await conn.reply(m.chat, pokedex, m) // fallback si sendFile no existe
    } else {
      await conn.reply(m.chat, pokedex, m)
    }

    await m.react && m.react('✔️')

  } catch (error) {
    await m.react && m.react('✖️')
    // Mensaje de error simple (no uses usedPrefix si no existe)
    await conn.reply(m.chat, `⚠️ Ocurrió un error al ejecutar la búsqueda.\n\n${error.message || String(error)}`, m)
  }
}

handler.help = ['pokedex']
handler.tags = ['fun']
handler.command = ['pokedex']
handler.group = true

export default handler