/**
 * Registro de comandos.
 *
 * Cada comando exporta: { data, level, requiresVoice, requiresSameChannel, defer, execute }.
 * Un comando sin nivel declarado hace fallar el arranque (negar por defecto).
 */
/**
 * Registro de comandos.
 *
 * Cada comando exporta { data, level, execute }.
 * Si a uno le falta algo, el bot no arranca (negar por defecto).
 */
import ping from './util/ping.js';

// Para agregar un comando: impórtalo arriba y súmalo a esta lista.
const all = [ping];

// Pendiente: mover los niveles a src/config/permissions.js en el hito 6.
const LEVELS = new Set(['general', 'mod']);

export const commands = new Map(); // Map de nombre de comando → objeto de comando

for (const command of all) {
  const name = command?.data?.name;

  if (!name) {
    throw new Error('Hay un comando sin data.name');
  }
  if (!LEVELS.has(command.level)) {
    throw new Error(`/${name} no declara un nivel válido (general o mod)`);
  }
  if (typeof command.execute !== 'function') {
    throw new Error(`/${name} no tiene una función execute`);
  }
  if (commands.has(name)) {
    throw new Error(`Hay dos comandos llamados /${name}`);
  }

  commands.set(name, command);
}