# Control de cambios — Financer

El texto anterior era un marcador sin historial verificable. Este registro empieza
con los cambios inspeccionados y realizados en esta sesión; no reconstruye versiones
anteriores como si hubieran sido probadas.

## Reparación del arranque — 9 de noviembre de 2026

- Estado: incorporada a `desarrollo-v1.8` con autorización del propietario.
- Propuesta: https://github.com/GSJoker95/financer/pull/1
- Base: `23d45315d459d32db6bb7bcf39568f0cfc072465`.
- Commit de reparación: `e0f956a8171546bad8ea1667fff09e23eb49cc7f`.
- Incorporación: `6409420ada5d67e3e36196bbeddaec534f973017`.
- Archivo: `js/interfaz.js`, eliminación del fragmento duplicado fuera de función.
- Pruebas: sintaxis de los cuatro JS y navegador 1280/390 px, sesión/datos simulados.
- Base de datos: sin cambios.
- Reversión: revertir la propuesta #1; no revierte registros de Supabase.

## Base flexible — 9 de noviembre de 2026

- Estado: incorporada a `desarrollo-v1.8`; CI y despliegue Cloudflare correctos.
- Propuesta: https://github.com/GSJoker95/financer/pull/2
- Commit de implementación: `2629fd87b72f28bc0609308310a0ada01573f495`.
- Incorporación: `17307030ce6987eae0ed0d7b1c760ac67475f09a`.
- Base: `6409420ada5d67e3e36196bbeddaec534f973017` de `desarrollo-v1.8`.
- Rama: `codex/estructura-flexible`.
- Alcance: estructura de programación, navegación de profundidad flexible, gestión
  de categorías y plataformas compartidas, recuperación de errores y sesión.
- Archivos: `index.html`, `css/estilos.css`, los cuatro JS existentes, nuevos
  `js/modelo.js` y `js/estrategias.js`; pruebas, scripts, package/lockfile,
  comprobaciones GitHub Actions y documentación.
- Cambios de BD: ninguno. Esquema, políticas RLS y triggers inspeccionados en lectura.
- Pruebas unitarias: 11 casos de modelo y repositorio.
- Navegador: SDK Supabase real y API ficticia en 1280/390 px, CRUD y persistencia
  simulada tras recarga, fallos, cero filas, FK, texto malicioso, cambio de cuenta,
  salida entre pestañas, CDN ausente y almacenamiento de navegación bloqueado.
- Prueba en servicio: un sujeto ficticio con rol `authenticated` ve cero registros
  de las cuatro tablas. No se han realizado escrituras ni login con la cuenta real.
- Limitaciones: formularios de posiciones/redes y cálculos pendientes. Los recorridos
  Crypto están definidos como contratos de extensión, no como formularios terminados.
- Publicación verificada: https://financer-pruebas.pages.dev/
  y https://1e2ccea9.financer-pruebas.pages.dev/ corresponden a esta entrega.
  Pantalla pública de acceso comprobada; la prueba autenticada real sigue pendiente.
  `main` permanece sin cambios.
- Recuperación: revertir esta propuesta sobre desarrollo. No hay esquema que revertir.
  Las altas que el propietario haga desde la aplicación se conservan en Supabase.
- Propuesta y commit final: consultar el historial Git de esta rama y su solicitud
  de cambio; no se escribe un SHA futuro dentro de su propio commit.


## Contexto entre chats — 9 de noviembre de 2026

- Petición del propietario: crear `Codex_Financer.txt` con estructura, trabajo
  realizado, implementación y continuidad para otra IA o chat. Actualizarlo con
  cada cambio de código/estructura y cada indicación del propietario que les afecte.
- Respaldo previo: `respaldo-v1.8.9`, creado en
  `17307030ce6987eae0ed0d7b1c760ac67475f09a`. Conserva código, no datos Supabase.
- Origen: ese mismo commit de `desarrollo-v1.8`.
- Rama de trabajo: `codex/documentacion-contexto`.
- Archivos: `Codex_Financer.txt`, `AGENTS.md`, `Control_Cambios.md`.
- Cambios: documento de continuidad; lectura/actualización obligatoria y reglas
  de respaldo y aclaración de dudas en AGENTS; actualización del estado de la entrega #2.
- Verificación: coherencia con el código/historial y `git diff --check`.
  No se añade ni modifica código ejecutable; no se necesitan nuevas pruebas funcionales.
- Base de datos: sin cambios.
- Reversión: revertir esta propuesta documental; conservar intacto el respaldo previo.
