/**
 * /ping: comprueba que el bot está vivo y muestra la latencia.
 */
// messageFlags
import { MessageFlags, SlashCommandBuilder } from 'discord.js';


export default { // export default: cada comando es un objeto con nombre, descripción y función de ejecución
  data: new SlashCommandBuilder() // SlashCommandBuilder: ayuda a construir la definición del comando
    .setName('ping') // Nombre del comando, en minúsculas y sin espacios
    .setDescription('Comprueba que el bot responde'), // Descripción del comando, se ve en Discord

  level: 'general', // Nivel de permisos: 'general' (cualquiera), 'mod' (moderadores), 'owner' (dueño del bot)

  async execute(interaction) {
    // ws.ping vale -1 hasta que el gateway mide la primera latencia.
    const ping = interaction.client.ws.ping; //client es el cliente de Discord, ws es la conexión WebSocket, ping es la latencia en ms
    const latency = ping >= 0 ? `${ping} ms` : 'midiendo…';

    await interaction.reply({
      content: `pong, estoy vivo y coleando... guaji es gay · ${latency}`,
      flags: MessageFlags.Ephemeral, // Solo lo ve quien lo escribió
    });
  },
};