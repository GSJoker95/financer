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


## financer_V2 — código comentado y rama viva V0 — 9 de noviembre de 2026

- Petición: comentar cada línea de código propio y revisar todos los archivos;
  continuar documentando cada instrucción futura y preparar la portabilidad.
- Ajuste de Codex_Financer: solo peticiones sobre la estructura con «Lo que pides /
  Lo que entiendo / Lo que hago». Los detalles técnicos quedan en código y guías.
- Origen: `3d084c43509c651958eb95bc9b171fe590c9c424` de `desarrollo-v1.8`.
- Respaldo previo: `respaldo-pre-financer_V2`, sobre ese mismo SHA.
- Preparación: rama `codex/comentarios-v2`; incorporación a la rama de desarrollo.
- Respaldo de cierre: `financer_V2`, creado después de comprobar la versión comentada.
- Rama viva: `financer_V0`, nuevo nombre de `desarrollo-v1.8`. No se renombra main.
- Próximos cambios significativos: trabajar desde V0, verificar y crear V3, V4, etc.
  No mover versiones numeradas ya creadas.
- Archivos revisados: los 23 versionados al inicio. Se comentan los 11 JS/CJS,
  index.html, css/estilos.css, workflow y .gitignore; se revisan los seis documentos
  previos y se añaden dos guías. Los dos JSON conservan exactamente sus bytes.
- Cambio ejecutable permitido: filtros de ramas de GitHub Actions adaptados a V0.
  Comentarios y separación visual del CSS no deben alterar la aplicación ni sus pruebas.
- Verificación: comparación de estructura sintáctica JavaScript, árbol CSS y HTML
  con el origen; validación JSON/YAML; pruebas existentes y git diff --check.
  Resultados locales: equivalencia correcta, sintaxis correcta, 11 pruebas unitarias
  y todos los escenarios de navegador superados en 1280/390 px y fallos controlados.
  Los SHAs y la CI remota se contrastan con la propuesta y las referencias Git.
- Dependencias: sin cambios en package.json/package-lock.json. Las herramientas
  auxiliares de comparación se instalan fuera del repositorio, no en la aplicación.
- Datos y esquema Supabase: sin cambios ni nuevas pruebas de escritura reales.
- Cloudflare: el renombrado Git no garantiza cambiar su rama de producción; verificar
  el despliegue de V0 y documentar la URL real. No recrear desarrollo-v1.8 para simularlo.
- Recuperación: referencia previa para volver al código sin comentarios; V2 para
  volver a esta versión documentada. Git no restaura los datos de la cuenta.

El cambio de referencia a V0 puede acompañarse de un commit sin cambios de archivos
para activar sus comprobaciones e integración de publicación bajo el nombre nuevo.
Ese commit no cambia el contenido de la instantánea V2 ni crea una funcionalidad nueva.


### Cierre comprobado de financer_V2 y activación de V0

- Propuesta incorporada: https://github.com/GSJoker95/financer/pull/4
- Commit comentado: `17b80d66ce4dab1979b6b425d895b2a23b1bec8b`.
- Incorporación y respaldo inmutable `financer_V2`:
  `0572ef543f74a96ea72632046da3f549d9d39d94`.
- Renombrado real de GitHub: `desarrollo-v1.8` pasa a llamarse `financer_V0`.
- Activación sin modificar archivos: `c05a9cead0f7509d1008dbe669ef8f615b6033da`.
- CI de V0 completada correctamente:
  https://github.com/GSJoker95/financer/actions/runs/42540966444
- Cloudflare: despliegue de V0 correcto. URL de trabajo verificada:
  https://financer-v0.financer-pruebas.pages.dev/
- Pantalla de acceso publicada comprobada en 1280/390 px sin errores JavaScript.
  HTML, CSS e interfaz publicados coinciden con los archivos comentados probados.
  No se introduce autenticación ni escritura con cuentas reales en esta comprobación.
- Actualización documental posterior de README, esta guía de cambios y la guía de
  migración para conservar las referencias definitivas. No modifica el código
  respaldado ni mueve V2; no constituye una nueva versión funcional V3.
- La URL raíz anterior de Cloudflare no se garantiza vinculada a la rama renombrada.
  Se conserva la configuración externa y se usa el enlace específico de V0.


## Identificación visible de Financer V2 — 10 de noviembre de 2026

- Petición expresa: mostrar nombre y versión antes de las pruebas manuales y rehacer
  el respaldo con el mismo nombre financer_V2. Excepción autorizada a no mover versiones.
- Origen V0: `f882f1b21859615aa1f2927a28cce7e487fb25bf`.
- Respaldo previo: `respaldo-pre-identificacion-V2-2026-11-10`, sobre ese SHA.
- V2 anterior preservado como `archivo-financer_V2-2026-11-10`, sobre
  `0572ef543f74a96ea72632046da3f549d9d39d94`.
- Rama preparatoria: `codex/identificacion-v2`, para incorporar a `financer_V0`.
- Cambios: cabecera pública, nombre/pestaña Financer · V2, revisión 2026-11-10.1 y
  etiqueta Pruebas · financer_V0 solo en su hostname. Nuevo js/version.js independiente
  de Auth; estilos adaptados a móvil y comprobaciones de identificación en el navegador.
- Documentación: petición/interpretación/implementación en Codex_Financer y reglas
  de mantenimiento de la versión, arquitectura, migración, lectura y verificación.
- Sin cambios de dependencias, esquema, autenticación, posiciones o datos financieros.
- Comprobaciones: sintaxis, pruebas existentes y visibilidad pública de la identidad
  antes/después del acceso y sin CDN. Publicación y referencia V2 se verifican al cierre.
- Recuperación: conservar V2 anterior mediante su archivo; revertir la propuesta
  en V0 si se quiere retirar la cabecera. Git no cambia los registros de Supabase.


## Limpieza de ramas y nombres de respaldo elegidos por el propietario — 10 de noviembre de 2026

- Instrucción: mantener el enlace estable de V0; crear respaldos cuando lo indique
  el propietario y con su nombre; si falta, preguntar antes de crear la referencia.
  Sustituye la pauta anterior de generar V3/V4 o respaldos preventivos automáticamente.
- Limpieza autorizada: eliminadas 11 ramas remotas; quedan solo main, financer_V0
  y financer_V2. Sin propuestas abiertas. Se comprobó antes que todos los commits
  retirados pertenecen al historial de al menos una de las ramas conservadas.
- Eliminación atómica con comprobación del SHA esperado de cada referencia.
  El borrado no movió las tres referencias conservadas ni cambió el código.
- Origen de V0 y V2 al limpiar: `b08c3272ac5a021495782b9ecefeb2261459fd1e`.
- Cambios adicionales: solo documentación de las reglas en AGENTS, Codex_Financer,
  README, arquitectura y guía de migración. No se crea otra rama para esta entrega
  ni otro respaldo. V2 mantiene su commit; V0 recibe únicamente este registro documental.
- Verificación: inventario remoto final exacto, commits de main/V2 conservados y
  git diff --check. No se cambia código ejecutable ni se requieren nuevas pruebas
  funcionales mientras el propietario realiza sus comprobaciones manuales.
- Recuperación: si se necesita una referencia retirada, acordar su nombre y recrearla
  desde el SHA registrado a continuación. No recrear ramas automáticamente.

| Rama retirada | SHA al eliminarla |
| --- | --- |
| `archivo-financer_V2-2026-11-10` | `0572ef543f74a96ea72632046da3f549d9d39d94` |
| `codex/comentarios-v2` | `17b80d66ce4dab1979b6b425d895b2a23b1bec8b` |
| `codex/documentacion-contexto` | `7a1d98ce6ac1a77fe01dac4d0e9580b146ea780f` |
| `codex/estructura-flexible` | `2629fd87b72f28bc0609308310a0ada01573f495` |
| `codex/identificacion-v2` | `655dd084e29e96b234168c16c323da8d2124decb` |
| `codex/reparacion-arranque` | `e0f956a8171546bad8ea1667fff09e23eb49cc7f` |
| `respaldo-pre-financer_V2` | `3d084c43509c651958eb95bc9b171fe590c9c424` |
| `respaldo-pre-identificacion-V2-2026-11-10` | `f882f1b21859615aa1f2927a28cce7e487fb25bf` |
| `respaldo-v1.7` | `2227b038aa58bdec43b7bddc4df7df9c0ff61110` |
| `respaldo-v1.8.7` | `3cdc6702f41ebcedc7474444730a3025b3069df7` |
| `respaldo-v1.8.9` | `17307030ce6987eae0ed0d7b1c760ac67475f09a` |
