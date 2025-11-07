import fs from "fs";

let handler = async (m, { conn, text }) => {
  const emoji = '⚙️';
  const emoji2 = '✅';
  const archivoConfig = './settings.json'; // Ruta del archivo donde se guardará
  const etiqueta = typeof global.etiqueta !== 'undefined' ? global.etiqueta : 'TuMarca';

  // Verificar texto
  if (!text) {
    return m.reply(`${emoji} Por favor, proporciona un nombre y el texto.\n> Ejemplo: #setname MiBot/Hola soy tu asistente`);
  }

  // Separar en la primera barra
  const sep = text.indexOf('/');
  if (sep === -1) {
    return m.reply(`${emoji} Formato incorrecto.\n> Usa: nombre/texto`);
  }

  const namePart = text.slice(0, sep).trim();
  const textPart = text.slice(sep + 1).trim();

  if (!namePart || !textPart) {
    return m.reply(`${emoji} Ambos valores deben contener texto.\n> Ejemplo: MiBot/Texto de presentación`);
  }

  // Cambiar globales
  global.botname = namePart;
  global.textbot = `${textPart} • Powered By ${etiqueta}`;

  // Guardar en settings.json
  try {
    let config = JSON.parse(fs.readFileSync(archivoConfig));
    config.botname = global.botname;
    config.textbot = global.textbot;
    fs.writeFileSync(archivoConfig, JSON.stringify(config, null, 2));
  } catch (e) {
    console.log(e);
    return m.reply(`${emoji} Error guardando configuración.\nRevisa si el archivo settings.json existe.`);
  }

  return m.reply(
`${emoji} *Nombre del bot actualizado correctamente:*
> ${global.botname}

${emoji2} *Texto del bot actualizado:*
> ${global.textbot}`
  );
};

handler.help = ['setname'];
handler.tags = ['tools'];
handler.command = ['setname'];
handler.rowner = true;

export default handler;