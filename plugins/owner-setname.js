import fs from 'fs';
import path from 'path';

let handler = async (m, { conn, text }) => {
  const emoji = '⚙️';
  const emoji2 = '✅';
  const etiqueta = typeof global.etiqueta !== 'undefined' ? global.etiqueta : 'TuMarca';

  // Ruta absoluta al archivo de configuración
  const archivoConfig = path.resolve('./settings.json');

  // Validaciones básicas
  if (!text) {
    return await m.reply(`${emoji} Por favor, proporciona un nombre y el texto.\n> Ejemplo: #setname MiBot/Hola soy tu asistente`);
  }

  const sep = text.indexOf('/');
  if (sep === -1) {
    return await m.reply(`${emoji} Formato incorrecto.\n> Usa: nombre/texto`);
  }

  const namePart = text.slice(0, sep).trim();
  const textPart = text.slice(sep + 1).trim();

  if (!namePart || !textPart) {
    return await m.reply(`${emoji} Ambos valores deben contener texto.\n> Ejemplo: MiBot/Texto de presentación`);
  }

  // Asignar globals en memoria
  global.botname = namePart;
  global.textbot = `${textPart} • Powered By ${etiqueta}`;

  // Intentar leer/escribir el archivo de configuración (crearlo si no existe)
  try {
    let config = {};

    // Si no existe, crearlo con valores por defecto
    if (!fs.existsSync(archivoConfig)) {
      config = {
        botname: global.botname,
        textbot: global.textbot
      };
      fs.writeFileSync(archivoConfig, JSON.stringify(config, null, 2));
    } else {
      // Si existe, intentar parsear y actualizar
      const raw = fs.readFileSync(archivoConfig, { encoding: 'utf8' });
      try {
        config = raw.trim().length ? JSON.parse(raw) : {};
      } catch (parseErr) {
        // Si JSON está corrupto, hacer backup y recrear
        const backupPath = archivoConfig + '.backup-' + Date.now();
        fs.copyFileSync(archivoConfig, backupPath);
        console.warn(`settings.json corrupto — creado backup en: ${backupPath}`);
        config = {};
      }

      // Actualizar campos
      config.botname = global.botname;
      config.textbot = global.textbot;

      fs.writeFileSync(archivoConfig, JSON.stringify(config, null, 2));
    }
  } catch (err) {
    console.error('Error al leer/escribir settings.json:', err);
    return await m.reply(
      `${emoji} Ocurrió un error al guardar la configuración.\n` +
      `Revisa permisos de escritura en el servidor o la ruta: ${archivoConfig}\n` +
      `Error: ${err.message}`
    );
  }

  // Respuesta final al usuario
  return await m.reply(
`${emoji} *Nombre del bot actualizado correctamente:*\n> ${global.botname}\n\n` +
`${emoji2} *Texto del bot actualizado:*\n> ${global.textbot}`
  );
};

handler.help = ['setname'];
handler.tags = ['tools'];
handler.command = ['setname'];
handler.rowner = true;

export default handler;