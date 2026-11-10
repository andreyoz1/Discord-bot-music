/**
 * El bot controlador quedó conectado.
 */
/**
 * El bot controlador quedó conectado.
 */
import { Events } from 'discord.js';

export default {
  name: Events.ClientReady,
  once: true,

  execute(client) {
    console.log(`Controlador conectado como ${client.user.tag}`);
  },
};