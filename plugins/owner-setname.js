let handler = async (m, { conn, text }) => {
  const emoji = '⚙️';
  const emoji2 = '✅';
  const etiqueta = typeof global.etiqueta !== 'undefined' ? global.etiqueta : 'TuMarca';

  if (!text) {
    return m.reply(`${emoji} Por favor, proporciona un nombre para el bot.\n> Ejemplo: #setname Nombre/Texto`);
  }

  const sepIndex = text.indexOf('/');
  if (sepIndex === -1) {
    return m.reply(`${emoji} Formato incorrecto.\n> Usa: nombre/texto`);
  }

  const namePart = text.slice(0, sepIndex).trim();
  const textPart = text.slice(sepIndex + 1).trim();

  if (!namePart || !textPart) {
    return m.reply(`${emoji} Ambos valores deben contener texto.\n> Ejemplo correcto: MiBot/Texto del bot`);
  }

  global.botname = namePart;
  global.textbot = `${textPart} • Powered By ${etiqueta}`;

  return m.reply(`${emoji} El nombre del bot ha sido cambiado a: *${global.botname}*\n\n${emoji2} Nuevo texto del bot:\n> ${global.textbot}`);
};

handler.help = ['setname'];
handler.tags = ['tools'];
handler.command = ['setname'];
handler.rowner = true;

export default handler;