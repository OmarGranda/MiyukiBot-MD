let handler = async (m, { conn, text, isRowner }) => {
  // valores por defecto si no los tienes definidos en otra parte
  const emoji = typeof global.emoji !== 'undefined' ? global.emoji : '⚙️';
  const emoji2 = typeof global.emoji2 !== 'undefined' ? global.emoji2 : 'ℹ️';
  const etiqueta = typeof global.etiqueta !== 'undefined' ? global.etiqueta : 'TuMarca';

  // permiso (opcional si tu framework ya lo controla con handler.rowner = true)
  if (!isRowner) return await m.reply(`${emoji} Solo el propietario remoto puede usar este comando.`);

  if (!text) {
    return await m.reply(`${emoji} Por favor, proporciona un nombre para el bot.\n> Ejemplo: #setname Nombre/Texto`);
  }

  // separar por la PRIMERA barra '/' para permitir barras dentro de cada parte
  const sepIndex = text.indexOf('/');
  if (sepIndex === -1) {
    return await m.reply(`${emoji} Por favor, proporciona ambos nombres separados por una barra (/) en el formato: nombre1/nombre2.`);
  }

  const namePart = text.slice(0, sepIndex).trim();
  const textPart = text.slice(sepIndex + 1).trim();

  if (!namePart || !textPart) {
    return await m.reply(`${emoji} Ambos valores son obligatorios. Asegúrate de usar: nombre1/nombre2 (ninguno puede quedar vacío).`);
  }

  // Asignar globales (puedes adaptarlo si prefieres guardar en otra parte)
  global.botname = namePart;
  const texto1bot = ` • Powered By ${etiqueta}`;
  global.textbot = `${textPart}${texto1bot}`;

  await m.reply(`${emoji} El nombre del bot ha sido cambiado a: ${global.botname}\n\n> ${emoji2} El texto del bot ha sido cambiado a: ${global.textbot}`);
};

handler.help = ['setname'];
handler.tags = ['tools'];
handler.command = ['setname'];
handler.rowner = true;

export default handler;