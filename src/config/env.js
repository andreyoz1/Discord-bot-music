/**
 * Lee y valida las variables de entorno al arrancar.
 *
 * Es el único archivo que toca process.env: el resto del proyecto
 * importa este objeto. Si algo falta o está mal, el proceso no arranca.
 */


/*
CONTROLLER_TOKEN=token_del_bot_controlador
WORKER_1_TOKEN=token_del_primer_bot
WORKER_2_TOKEN=token_del_segundo_bot
WORKER_3_TOKEN=token_del_tercer_bot
*/

import path from 'node:path';

// Raíz del proyecto: este archivo vive en src/config/, así que se suben dos niveles.
//Esto permite que las rutas funcionen aunque ejecute el bot desde otra carpeta.
const ROOT_DIR = path.resolve(import.meta.dirname, '..', '..');


//-----------------validaciones-----------------------------------

// Un ID de Discord (snowflake) son solo dígitos, entre 17 y 20.
const SNOWFLAKE = /^\d{17,20}$/;
const LOG_LEVELS = ['debug', 'info', 'warn', 'error'];

// Se acumulan todos los errores para mostrarlos juntos al final.
const errors = [];

/** Lee una variable sin espacios. Si no existe, devuelve ''. */
function read(name) {
  return (process.env[name] ?? '').trim();
}

/** Lee una variable obligatoria. */
function required(name) {
  const value = read(name);
  if (!value) errors.push(`${name}: falta`);
  return value;
}

/** Lee una variable obligatoria que debe ser un ID de Discord. */
function snowflake(name) {
  const value = required(name);
  if (value && !SNOWFLAKE.test(value)) {
    errors.push(`${name}: "${value}" no parece un ID de Discord (17 a 20 dígitos)`);
  }
  return value;
}

/** Convierte "a, b,,c" en ['a', 'b', 'c']. */
function list(name) {
  return read(name)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * Convierte una ruta del .env en absoluta, tomando la raíz del proyecto como base.
 * Si la ruta ya es absoluta (por ejemplo /data), se deja igual.
 */
function projectPath(name, fallback) {
  return path.resolve(ROOT_DIR, read(name) || fallback);
}

/** Junta WORKER_1_TOKEN, WORKER_2_TOKEN, ... hasta el primero vacío. */
function workerTokens() {
  const tokens = [];
  for (let i = 1; read(`WORKER_${i}_TOKEN`); i++) {
    tokens.push(read(`WORKER_${i}_TOKEN`));
  }
  return tokens;
}

//-----------------configuración final-----------------------------------

const config = {
  guildId: snowflake('GUILD_ID'),
  ownerId: snowflake('OWNER_ID'),
  modRoleIds: Object.freeze(list('MOD_ROLE_IDS')),

  controllerToken: required('CONTROLLER_TOKEN'),
  controllerClientId: snowflake('CONTROLLER_CLIENT_ID'),
  workerTokens: Object.freeze(workerTokens()), // Opcionales en el hito 1

  rootDir: ROOT_DIR,
  dataDir: projectPath('DATA_DIR', 'data'),
  ytdlpPath: projectPath('YTDLP_PATH', 'bin/yt-dlp'),
  logLevel: read('LOG_LEVEL') || 'info',
};

for (const roleId of config.modRoleIds) {
  if (!SNOWFLAKE.test(roleId)) {
    errors.push(`MOD_ROLE_IDS: "${roleId}" no parece un ID de rol`);
  }
}

if (!LOG_LEVELS.includes(config.logLevel)) {
  errors.push(`LOG_LEVEL: "${config.logLevel}" no es válido (usa ${LOG_LEVELS.join(', ')})`);
}

if (errors.length > 0) {
  console.error(`Configuración inválida en .env:\n  - ${errors.join('\n  - ')}`);
  process.exit(1);
}


//-----------------export-----------------------------------
export default Object.freeze(config);