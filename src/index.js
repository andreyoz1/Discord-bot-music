/**
 * Punto de entrada.
 *
 * Orden de arranque: config → ClientPool (controlador + workers de voz) → VoiceManager.
 * Más adelante: base de datos.
 * Registra el apagado ordenado (SIGINT/SIGTERM): saca a los bots de la voz y cierra los clientes.
 */
import env from './config/env.js';
import { ClientPool } from './core/clients/ClientPool.js';
import { registerControllerEvents, registerWorkerEvents } from './events/index.js';
import { VoiceManager } from './core/voice/VoiceManager.js';

// ---------------- Clientes de Discord ----------------

const pool = new ClientPool({
  controllerToken: env.controllerToken,
  workerTokens: env.workerTokens,
  guildId: env.guildId,
});

// El constructor no se conecta a nada: puede crearse antes de que los bots inicien sesión.
// Debe existir antes de shutdown(), que lo usa.
const voiceManager = new VoiceManager(pool, env.guildId);

// Los eventos se enganchan ANTES de start(): ClientReady ocurre durante el arranque.
registerControllerEvents(pool.controller);
for (const worker of pool.workers) registerWorkerEvents(worker);

// ---------------- Errores globales ----------------

// Una promesa rechazada que nadie atrapó no debe pasar en silencio.
process.on('unhandledRejection', (error) => {
  console.error('Promesa rechazada sin manejar:', error);
});

// ---------------- Apagado ordenado ----------------

// Al recibir una señal de apagado (SIGINT o SIGTERM): primero los bots salen de los
// canales de voz y después se desconectan de Discord.
async function shutdown(signal) {
  console.log(`${signal} recibido, apagando…`);
  voiceManager.destroyAll();
  await pool.destroy();
  process.exit(0);
}

process.once('SIGINT', () => shutdown('SIGINT'));   // Ctrl+C
process.once('SIGTERM', () => shutdown('SIGTERM')); // systemd en la VM

// ---------------- Arranque ----------------

try {
  await pool.start();
} catch (error) {
  console.error(error.message);
  await pool.destroy();
  process.exit(1);
}

// ---------------- Pruebas temporales: borrar cuando exista /join ----------------

async function probar(descripcion, accion) {
  try {
    await accion();
    console.log(`OK    ${descripcion}`);
  } catch (error) {
    console.log(`FALLA ${descripcion} → ${error.message}`);
  }
}


/* pruebas de join() y freeWorkers() 
const CANAL_A = '1571871437889867907';
const CANAL_B = '1571839833402507294';
const CANAL_C = '1571839927253991444';

await probar('Bot 1 entra al canal A', () => voiceManager.join(CANAL_A, {}));
await probar('Otro bot al canal A', () => voiceManager.join(CANAL_A));
await probar('bot 2 al canal B', () => voiceManager.join(CANAL_B, {}));
await probar('otro bot al canal B', () => voiceManager.join(CANAL_B));
await probar('bot 3 al canal C', () => voiceManager.join(CANAL_C, {}));
await probar('otro bot al canal C', () => voiceManager.join(CANAL_C));
console.log('Bots libres:', voiceManager.freeWorkers().map((worker) => worker.label));
*/
// ---------------- Diagnóstico (opcional) ----------------

/* Revisa la memoria del bot cada 30 segundos; útil para detectar fugas de memoria.
setInterval(() => {
  const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  const memory = process.memoryUsage();
  console.log({
    rss: `${mb(memory.rss)} -> memoria total del bot`,
    heapTotal: `${mb(memory.heapTotal)} -> memoria JavaScript reservada para el bot`,
    heapUsed: `${mb(memory.heapUsed)} -> memoria JavaScript usada por el bot`,
    external: `${mb(memory.external)} -> memoria externa asociada a Node.js y librerías`,
    arrayBuffers: `${mb(memory.arrayBuffers)} -> parte de la memoria usada en buffers binarios`,
    uptime: `${(process.uptime() / 60).toFixed(2)} min -> tiempo de actividad del bot`,
  });
}, 30_000);
*/