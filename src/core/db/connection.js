/**
 * Abre DATA_DIR/bot.db con better-sqlite3.
 *
 * Aplica pragmas (WAL, synchronous NORMAL, foreign_keys ON, busy_timeout)
 * y prepara los statements una sola vez al arrancar.
 */
