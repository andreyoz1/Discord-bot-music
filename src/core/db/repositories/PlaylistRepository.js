/**
 * Acceso a playlists y sus canciones.
 *
 * Métodos asíncronos (aunque SQLite responda al instante) para poder
 * cambiar de motor de base de datos sin tocar los comandos.
 * Las escrituras usan transacción y concurrencia optimista (columna version).
 */
