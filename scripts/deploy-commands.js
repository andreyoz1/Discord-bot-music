/**
 * Registra los slash commands en el servidor (solo con el bot controlador).
 *
 * Se ejecuta a mano cuando cambia la definición de un comando, no en cada arranque.
 */
/**
 * Registra los slash commands en el servidor, usando el bot controlador.
 *
 * Se corre a mano (npm run deploy:commands) solo cuando cambia
 * la definición de un comando, no en cada arranque.
 */
import { REST, Routes } from 'discord.js';
import env from '../src/config/env.js';
import { commands } from '../src/commands/index.js';

const body = [...commands.values()].map((command) => command.data.toJSON());
const rest = new REST().setToken(env.controllerToken);

try {
  // PUT reemplaza la lista completa: un comando que ya no existe se borra.
  const registered = await rest.put(
    Routes.applicationGuildCommands(env.controllerClientId, env.guildId),
    { body },
  );
  console.log(`${registered.length} comando(s) registrado(s) en el servidor.`);
} catch (error) {
  console.error('No se pudieron registrar los comandos:', error.message);
  process.exitCode = 1;
}