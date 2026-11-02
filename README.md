# Discord Bot Music

Bot de música privado para un solo servidor de Discord, con soporte para varios canales de voz a la vez.

- 1 bot controlador recibe todos los slash commands.
- 3 workers de voz, uno por canal simultáneo.
- Cola temporal aislada por canal, en memoria.
- Playlists globales en SQLite (`better-sqlite3`, modo WAL).
- Audio Opus nativo, sin transcodificar con FFmpeg.

## Estructura

| Carpeta | Responsabilidad |
| --- | --- |
| `src/config` | Variables de entorno validadas, constantes y matriz de permisos |
| `src/core` | Estado y recursos: clientes, sesiones de voz, audio, base de datos, telemetría |
| `src/events` | Escucha eventos de Discord y los enruta, sin lógica de negocio |
| `src/commands` | Un archivo por slash command: definición y handler |
| `src/middleware` | Cadena de validación antes de cada comando (contexto, canal, RBAC, límite de uso) |
| `src/utils` | Funciones puras de apoyo |
| `scripts` | Tareas manuales: registrar comandos, migrar, respaldar |
| `deploy` | Unidades systemd para la VM |
| `bin` | Binario de yt-dlp (no se versiona) |
| `data` | Base SQLite y copias de seguridad (no se versiona) |

## Puesta en marcha

1. Copia `.env.example` como `.env` y completa los valores.
2. `npm install`
3. `npm run migrate`
4. `npm run deploy:commands`
5. `npm start`


- Esto deberia funcionar para maximo 3 bots en simultaneo teniendo en cuenta la papa
de MV que ofrece azure o google cloud.
