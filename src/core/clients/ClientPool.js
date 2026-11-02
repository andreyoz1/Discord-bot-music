/**
 * Crea e inicia los 4 clientes de Discord: 1 controlador + 3 workers de voz.
 *
 * Login escalonado para no sumar picos de CPU.
 * Expone el controlador y la lista de workers.
 */
