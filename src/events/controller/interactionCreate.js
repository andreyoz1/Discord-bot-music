/**
 * Recibe slash commands, autocompletado y botones.
 *
 * Busca el comando en el registro y lo pasa por el pipeline de middleware.
 */
/**
 * Recibe las interacciones y ejecuta el comando correspondiente.
 *
 * En el hito 6 el try/catch se reemplaza por el pipeline de middleware.
 */
import { Events, MessageFlags } from 'discord.js';
import { commands } from '../../commands/index.js';

export default {
  name: Events.InteractionCreate,

  async execute(interaction) {
    // Por ahora solo slash commands; botones y autocompletado vienen después.
    if (!interaction.isChatInputCommand()) return;

    const command = commands.get(interaction.commandName);
    if (!command) {
      console.warn(`Comando desconocido: /${interaction.commandName}`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`Error en /${interaction.commandName}:`, error);

      const message = {
        content: 'Ocurrió un error al ejecutar el comando.',
        flags: MessageFlags.Ephemeral,
      };

      // Si el comando ya respondió o hizo defer, reply() fallaría.
      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(message);
        } else {
          await interaction.reply(message);
        }
      } catch (replyError) {
        console.error('Tampoco se pudo avisar al usuario:', replyError.message);
      }
    }
  },
};