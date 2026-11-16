/**
 * Administrador de canales. Único lugar que crea o destruye sesiones.
 *
 * Map voiceChannelId → sesión ({ worker, connection })
 * y cálculo de los workers libres.
 */
import { PermissionFlagsBits } from 'discord.js';
import { joinVoiceChannel, entersState, VoiceConnectionStatus } from '@discordjs/voice';
import { UserError } from '../../utils/errors.js';
import { VOICE_READY_TIMEOUT_MS } from '../../config/constants.js';

export class VoiceManager {
  #pool;
  #guildId;
  #sessions = new Map(); // channelId → { worker, connection }

  constructor(pool, guildId) {
    this.#pool = pool;
    this.#guildId = guildId;
  }

  /** La sesión de un canal, o undefined si no hay bot ahí. */
  getSession(channelId) {
    return this.#sessions.get(channelId);
  }

  /** Los workers que no están en ningún canal. */
  freeWorkers() {
    const busy = new Set();
    for (const session of this.#sessions.values()) {
      busy.add(session.worker);
    }
    return this.#pool.workers.filter((worker) => !busy.has(worker));
  }

  /**
   * Mete un worker en un canal de voz y devuelve la sesión.
   * Si se pasa workerId, usa ese bot; si no, el primero libre.
   */
  async join(channelId, { workerId } = {}) {
    // no permitir dos bots en el mismo canal.
    if (this.#sessions.has(channelId)) {
      throw new UserError('No se permiten dos bots en un mismo canal.');
    }

    // A. Elegir un worker libre
    let worker;
    if (workerId) {
      // El usuario eligió un bot específico
      worker = this.#pool.workers.find((w) => w.id === workerId);
      if (!worker) {
        throw new UserError('Ese bot no existe.');
      }
      if (!this.freeWorkers().includes(worker)) {
        throw new UserError(`${worker.client.user.username} ya está ocupado. Elige otro.`);
      }
    } else {
      // No eligió: el primero libre
      worker = this.freeWorkers()[0];
      if (!worker) {
        throw new UserError('No hay ningún bot libre.');
      }
    }

    // B. Buscar el canal visto por ESE worker (de ahí sale su adaptador de voz)
    const channel = worker.client.channels.cache.get(channelId);
    if (!channel?.isVoiceBased()) {
      throw new UserError('No encuentro ese canal de voz.');
    }

    if (channel.full) {
      throw new UserError('El canal está lleno.');
    }

    const permissions = channel.permissionsFor(worker.client.user);
    if (!channel.joinable || !permissions?.has(PermissionFlagsBits.Speak)) {
      throw new UserError('No tengo permiso para entrar a ese canal.');
    }

    // C. Reservar el canal ANTES de conectar, y luego iniciar la conexión
    const session = { worker, connection: null };
    this.#sessions.set(channelId, session);

    const connection = joinVoiceChannel({
      channelId,
      guildId: this.#guildId,
      adapterCreator: channel.guild.voiceAdapterCreator,
      group: `worker-${worker.id}`, // Un grupo por worker: así no se pisan en el mismo servidor
      selfDeaf: true,               // El bot no recibe el audio de los demás
    });

    // D. Esperar a que la conexión quede lista; si no, limpiar y avisar
    try {
      await entersState(connection, VoiceConnectionStatus.Ready, VOICE_READY_TIMEOUT_MS);
    } catch {
      connection.destroy();
      this.#sessions.delete(channelId); // Liberar la reserva: el worker vuelve a estar libre
      throw new UserError('No pude conectarme al canal, intenta de nuevo.');
    }

    session.connection = connection;
    return session;
  }

  /** Saca al bot de un canal y libera su worker. Devuelve false si no había bot. */
  leave(channelId) {
    const session = this.#sessions.get(channelId);
    if (!session) return false;

    session.connection?.destroy(); // ?. por si la sesión estaba a mitad de conectarse
    this.#sessions.delete(channelId);
    return true;
  }

  /** Saca a todos los bots de sus canales. Se usa al apagar. */
  destroyAll() {
    // Se recorre una copia de las llaves: leave() borra del Map mientras tanto.
    for (const channelId of [...this.#sessions.keys()]) {
      this.leave(channelId);
    }
  }
}
