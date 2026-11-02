/**
 * Administrador de canales. Único lugar que crea o destruye sesiones.
 *
 * Map voiceChannelId → VoiceSession, Map de creaciones en curso
 * y lista de workers libres. Incluye el recolector periódico de sesiones.
 */
