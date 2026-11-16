/**
 * Mensajes con estilo de tarjeta (embeds) para responder a los usuarios.
 *
 * Formato: barra de color a la izquierda + avatar pequeño + texto en negrita.
 * El texto va en el campo author: es texto plano, sin menciones ni markdown.
 * Si hace falta una mención (@usuario), va en la descripción (setDescription).
 */
import { EmbedBuilder } from 'discord.js';

const COLORS = Object.freeze({
  success: 0x23a55a, // Verde: algo salió bien
  error: 0xda373c,   // Rojo: un UserError
  info: 0x5865f2,    // Azul: información, como /queue
});

/** Arma la tarjeta base con el avatar de quien usó el comando. */
function baseEmbed(interaction, text, color) {
  return new EmbedBuilder()
    .setColor(color)
    .setAuthor({
      name: text, // Máximo 256 caracteres
      iconURL: interaction.user.displayAvatarURL({ size: 64 }),
    });
}

/** Tarjeta verde: "El Andrey detuvo la música." */
export function successEmbed(interaction, text) {
  return baseEmbed(interaction, text, COLORS.success);
}

/** Tarjeta roja: "No hay ningún bot libre." */
export function errorEmbed(interaction, text) {
  return baseEmbed(interaction, text, COLORS.error);
}

/** Tarjeta azul: información general. */
export function infoEmbed(interaction, text) {
  return baseEmbed(interaction, text, COLORS.info);
}
