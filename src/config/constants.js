/**
 * Límites y tiempos del sistema.
 *
 * Tamaño máximo de cola y de playlist, tiempos de inactividad,
 * intervalo del recolector de sesiones, límite de procesos yt-dlp, rate limit.
 */


// Pausa entre el inicio de sesión de cada bot, para no sumar picos de CPU.
export const LOGIN_GAP_MS = 1_500;

// Tiempo máximo para que un bot quede listo después de iniciar sesión.
export const READY_TIMEOUT_MS = 30_000;

// Tiempo máximo para que la conexión de voz quede lista.
export const VOICE_READY_TIMEOUT_MS = 15_000;