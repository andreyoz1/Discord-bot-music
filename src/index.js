/**
 * Punto de entrada.
 *
 * Orden de arranque: config → base de datos → ClientPool → VoiceManager.
 * Registra el apagado ordenado (SIGINT/SIGTERM): destruye sesiones, cierra clientes y la base.
 */
/**
 * Punto de entrada.
 *
 * Hito 1: solo el bot controlador. Los workers de voz llegan en el hito 2.
 */
import { Client, GatewayIntentBits } from 'discord.js';
import env from './config/env.js';
import ready from './events/controller/ready.js';
import interactionCreate from './events/controller/interactionCreate.js';

const controller = new Client({
  intents: [
    GatewayIntentBits.Guilds,           // Servidores y canales
    GatewayIntentBits.GuildVoiceStates, // Quién está en qué canal de voz
  ],
});

// Conecta cada evento a su manejador.
for (const event of [ready, interactionCreate]) {
  const handler = (...args) => event.execute(...args);
  if (event.once) controller.once(event.name, handler);
  else controller.on(event.name, handler);
}

// Una promesa rechazada que nadie atrapó no debe pasar en silencio.
process.on('unhandledRejection', (error) => {
  console.error('Promesa rechazada sin manejar:', error);
});

async function shutdown(signal) {
  console.log(`${signal} recibido, apagando…`);
  await controller.destroy();
  process.exit(0);
}

process.once('SIGINT', () => shutdown('SIGINT'));   // Ctrl+C
process.once('SIGTERM', () => shutdown('SIGTERM')); // systemd en la VM

try {
  await controller.login(env.controllerToken);
} catch (error) {
  console.error('No se pudo iniciar sesión con CONTROLLER_TOKEN:', error.message);
  process.exit(1);
}