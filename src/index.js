/**
 * Punto de entrada.
 *
 * Orden de arranque: config → base de datos → ClientPool → VoiceManager.
 * Registra el apagado ordenado (SIGINT/SIGTERM): destruye sesiones, cierra clientes y la base.
 */
