/**
 * Errores esperados: el usuario debe leer su mensaje tal cual.
 *
 * Se lanzan desde cualquier capa (por ejemplo, "No hay ningún bot libre.")
 * y interactionCreate los muestra con errorEmbed, en efímero.
 * Cualquier otro error es de programación: el usuario solo ve un mensaje genérico.
 */
export class UserError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UserError';
  }
}