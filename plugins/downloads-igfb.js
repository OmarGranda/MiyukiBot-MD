const handler = async (m, { args, conn, usedPrefix }) => {
try {
if (!args[0]) return conn.reply(m.chat, `🌸 *Ingresa un enlace válido de Instagram o Facebook.*`, m)

let data = []
await m.react('⏳') // Indicador "Cargando..."

try {
const api = `${global.APIs.vreden.url}/api/igdownload?url=${encodeURIComponent(args[0])}`
const res = await fetch(api)
const json = await res.json()
if (json.resultado?.respuesta?.datos?.length) {
data = json.resultado.respuesta.datos.map(v => v.url)
}}
catch (e) {}

if (!data.length) {
try {
const api = `${global.APIs.delirius.url}/download/instagram?url=${encodeURIComponent(args[0])}`
const res = await fetch(api)
const json = await res.json()
if (json.status && json.data?.length) {
data = json.data.map(v => v.url)
}}
catch (e) {}
}

if (!data.length) return conn.reply(m.chat, `🚫 *No se pudo obtener el contenido.*\nIntenta con otro enlace.`, m)

// 🌟 NUEVA DESCRIPCIÓN BONITA AL ENVIAR EL VIDEO 🌟
for (let media of data) {
let caption = `
╭─❀ *DESCARGA COMPLETADA* ❀
│ 🎬 *Video encontrado con éxito*
│ 🌐 *Origen:* Instagram / Facebook
│ 💾 *Descarga:* Exitosa sin marca de agua
│ 💟 *Calidad:* Full HD
╰─────────────────────❀
✨ Disfrútalo y comparte 💗`

await conn.sendFile(m.chat, media, `download_${new Date().getTime()}.mp4`, caption, m)
}

await m.react('✅')

} catch (error) {
await m.react('❌')
await m.reply(`⚠️ *Error inesperado.*\nReporta usando *${usedPrefix}report*\n\n${error.message}`)
}}

handler.command = ['instagram', 'ig', 'facebook', 'fb']
handler.tags = ['descargas']
handler.help = ['instagram', 'ig', 'facebook', 'fb']
handler.group = true

export default handler