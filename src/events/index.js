/**
 * Engancha los eventos de Discord a cada cliente.
 *
 * Solo el controlador recibe los comandos. Los workers no escuchan interacciones:
 * Discord solo envía una interacción a la aplicación dueña del comando,
 * y además aquí nunca se les engancha interactionCreate.
 */
import { Events } from 'discord.js';
import interactionCreate from './controller/interactionCreate.js';

/** Eventos del bot controlador. */
export function registerControllerEvents(controller) {
  // interactionCreate es un comando de barra, no un evento de Discord. Se engancha aquí para que el controlador lo reciba.
  controller.client.on(interactionCreate.name, (...args) => interactionCreate.execute(...args));
  // Los errores de un cliente no se propagan a la app, hay que escucharlos explícitamente.
  controller.client.on(Events.Error, (error) => {
    console.error(`Error en el ${controller.label}:`, error.message);
  });
}

/** Eventos de un worker de voz. En el hito 4 se suma voiceStateUpdate. */
export function registerWorkerEvents(worker) {
  worker.client.on(Events.Error, (error) => {
    console.error(`Error en el ${worker.label}:`, error.message);
  });
}
