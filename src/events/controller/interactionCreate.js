/**
 * Recibe las interacciones y ejecuta el comando correspondiente.
 *
 * En el hito 6 el try/catch se reemplaza por el pipeline de middleware.
 */
import { Events, MessageFlags } from 'discord.js';
import { commands } from '../../commands/index.js';
import { UserError } from '../../utils/errors.js';
import { errorEmbed } from '../../utils/embeds.js';

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
      let text;

      if (error instanceof UserError) {
        // Error esperado: el usuario lee el mensaje tal cual. No es una falla del bot.
        text = error.message;
      } else {
        // Error de programación: el detalle va a la consola, el usuario ve un mensaje genérico.
        console.error(`Error en /${interaction.commandName}:`, error);
        text = 'Ocurrió un error al ejecutar el comando.';
      }

      const message = {
        embeds: [errorEmbed(interaction, text)],
        flags: MessageFlags.Ephemeral, // Solo lo ve quien escribió el comando
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
