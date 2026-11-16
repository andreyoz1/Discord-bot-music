/**
 * Opciones de cliente para el controlador y los workers.
 *
 * Intents mínimos: Guilds y GuildVoiceStates.
 * Caché recortada: sin mensajes, presencias ni miembros ajenos.
 */
import { GatewayIntentBits, Options } from 'discord.js';

export const clientOptions = Object.freeze({
  intents: [
    GatewayIntentBits.Guilds,           // Servidores y canales
    GatewayIntentBits.GuildVoiceStates, // Quién está en qué canal de voz; necesario para conectarse a la voz
  ],

  // Con 4 clientes en una VM de 1 GB, no se guarda en memoria lo que el bot no usa.
  makeCache: Options.cacheWithLimits({
    ...Options.DefaultMakeCacheSettings,
    MessageManager: 0,
    PresenceManager: 0,
    ReactionManager: 0,
    // Solo se conserva al propio bot como miembro (lo necesita para revisar sus permisos).
    GuildMemberManager: {
      maxSize: 0,
      keepOverLimit: (member) => member.id === member.client.user.id,
    },
    // VoiceStateManager NO se recorta: dice en qué canal de voz está cada usuario.
  }),
});
