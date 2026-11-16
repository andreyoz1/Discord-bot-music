/**
 * Crea e inicia los 4 clientes de Discord: 1 controlador + 3 workers de voz.
 *
 * Login escalonado para no sumar picos de CPU.
 * Expone el controlador y la lista de workers.
 */
import { once } from 'node:events'; // Para esperar a que el cliente esté listo.
import { setTimeout as sleep } from 'node:timers/promises'; // Para pausar entre logins de cada bot.
import { Client, Events } from 'discord.js';
import { LOGIN_GAP_MS, READY_TIMEOUT_MS } from '../../config/constants.js';
import { clientOptions } from './clientOptions.js';

/*
La clase administra:

El bot controlador.
Los bots workers.
Sus conexiones.
El inicio escalonado.
El cierre de todos los clientes.
*/
export class ClientPool {
  // Campos privados (#): nadie fuera de la clase puede leerlos ni reasignarlos.
  #guildId;
  #controller;
  #workers;
  #tokens = new Map(); // bot → token. Los tokens nunca salen de la clase.

  /**
   * @param {object} options
   * @param {string} options.controllerToken // el token del bot controlador
   * @param {readonly string[]} options.workerTokens // los tokens de los bots workers
   * @param {string} options.guildId // el ID del servidor donde deben estar los bots
   */
  constructor({ controllerToken, workerTokens, guildId }) {
    this.#guildId = guildId;

    this.#controller = Object.freeze({
      label: 'controlador', // Etiqueta para identificar el bot en los logs
      client: new Client(clientOptions),
    });
    this.#tokens.set(this.#controller, controllerToken);

    // id 1, 2, 3… coincide con WORKER_1_TOKEN, WORKER_2_TOKEN…
    this.#workers = Object.freeze(workerTokens.map((token, index) => {
      const worker = Object.freeze({
        id: index + 1,
        label: `worker ${index + 1}`,
        client: new Client(clientOptions),
      });
      this.#tokens.set(worker, token);
      return worker;
    }));
  }

  /** El bot controlador: { label, client }. */
  get controller() {
    return this.#controller;
  }

  /** Los workers de voz: [{ id, label, client }, …]. */
  get workers() {
    return this.#workers;
  }

  /** Inicia sesión con todos los bots, uno tras otro. */
  async start() {
    await this.#login(this.#controller);

    for (const worker of this.#workers) {
      await sleep(LOGIN_GAP_MS); // Pausa entre logins para no sumar picos de CPU.
      await this.#login(worker);
    }

    if (this.#workers.length === 0) {
      console.warn('No hay workers configurados: ningún bot podrá entrar a la voz.');
    }
  }

  /** Cierra todas las conexiones. Nunca falla, aunque algún cliente falle al cerrar. */
  async destroy() {
    const all = [this.#controller, ...this.#workers];
    await Promise.allSettled(all.map((bot) => bot.client.destroy()));
  }

  /** Inicia sesión con un bot y espera a que esté listo para usarse. */
  async #login(bot) {
    // Se empieza a escuchar ClientReady ANTES de login, para no perder el evento.
    // Si no llega a tiempo, la espera falla en vez de quedarse colgada para siempre.
    const ready = once(bot.client, Events.ClientReady, {
      signal: AbortSignal.timeout(READY_TIMEOUT_MS),
    });

    try {
      // Promise.all espera ambas y atrapa la falla de cualquiera de las dos.
      await Promise.all([ready, bot.client.login(this.#tokens.get(bot))]);
    } catch (error) {
      throw new Error(`No se pudo iniciar sesión con el ${bot.label}: ${error.message}`, { cause: error });
    }

    // Un bot que no fue invitado al servidor no puede entrar a sus canales.
    if (!bot.client.guilds.cache.has(this.#guildId)) {
      throw new Error(`${bot.client.user.tag} (${bot.label}) no está en el servidor GUILD_ID. Invítalo primero.`);
    }

    console.log(`${bot.label} conectado como ${bot.client.user.tag}`);
  }
}
