# Financer

Aplicación web personal para organizar patrimonio, liquidez e inversiones.
HTML, CSS y JavaScript, con Supabase Auth y base de datos. Sin compilación ni
framework y sin conexiones a bancos o brokers.

## Qué funciona en esta entrega

Antes de entrar debe verse **Financer · V2**, la **revisión 2026-11-10.1** y,
en el enlace de trabajo, **Pruebas · financer_V0**. La identificación se conserva
al iniciar o cerrar sesión. V2 es la entrega; V0 es su rama editable.

- Inicio/cierre de sesión, recuperación de acceso y reintento de carga.
- Categorías y subcategorías de profundidad flexible: consultar, crear, renombrar
  y eliminar. Las categorías principales se conservan; no se borran ramas con hijos.
- Plataformas compartidas: registrar una vez, consultar, renombrar y eliminar si
  no existen productos asociados.
- Ruta de navegación por usuario y pestaña, conservada al recargar cuando el
  navegador permite `sessionStorage`.

Las escrituras se guardan en Supabase: no es una demostración en memoria.
Los formularios de posiciones, redes, activos, pares y operaciones todavía no
están implementados. Resultados, Gastos y Objetivos quedan pendientes. No hay
saldos, rentabilidades ni operaciones pasadas inventadas.

## Desarrollo y pruebas

Se necesita Node.js 20 o superior para las comprobaciones. La aplicación sigue
siendo estática: Node no es necesario en el alojamiento.

```sh
# Instala las versiones fijadas sin ejecutar scripts de instalación.
npm ci --ignore-scripts
# Revisa sintaxis de todos los JavaScript de la aplicación.
npm run check
# Comprueba modelo y repositorio con datos ficticios.
npm test
# Prepara el navegador que se utilizará en las pruebas aisladas.
npx playwright install chromium
# Ejecuta la interfaz con toda la red interceptada y sin cuentas reales.
npm run test:browser
```

Si ya tienes Chromium: `CHROMIUM_PATH=/ruta/al/chromium npm run test:browser`.
Las pruebas de navegador usan la librería real Supabase de la versión fijada,
interceptan toda la red y solo trabajan con usuarios y registros ficticios.
No necesitan claves privadas ni credenciales reales.

Para abrir la aplicación localmente, servir esta carpeta con un servidor HTTP
(por ejemplo, `python3 -m http.server 8000`) y abrir `http://localhost:8000`.
**La aplicación normal sí conecta al proyecto Supabase configurado**; no utilizar
registros financieros reales para pruebas de escritura.

## Publicación y recuperación

Web de trabajo de V0: https://financer-v0.financer-pruebas.pages.dev/

La dirección anterior https://financer-pruebas.pages.dev/ puede conservar la
configuración de producción de la rama antigua. Usar la URL específica de V0
para comprobar sus cambios hasta revisar ese ajuste externo en Cloudflare.

La rama viva de trabajo es `financer_V0` (antes `desarrollo-v1.8`). Ese enlace
permanece estable cuando se incorporan cambios. `main` se conserva como referencia
separada y `financer_V2` mantiene el respaldo vigente. Tras la limpieza autorizada
solo quedan esas tres ramas en GitHub.

El propietario decide cuándo crear un respaldo y con qué nombre. Si hace falta
uno y no ha dado nombre, preguntárselo antes de crearlo; no generar V3/V4 ni ramas
auxiliares automáticamente. Las referencias históricas retiradas y sus SHAs están
en Control_Cambios.md. GitHub Pages servía main durante la auditoría; para las
comprobaciones actuales utilizar el enlace estable de V0 indicado arriba.

Publicar como web estática con la raíz del repositorio como directorio de salida;
no se necesita comando de compilación. Si el alojamiento instala dependencias,
las de desarrollo solo sirven para pruebas.

Antes de publicar una rama de pruebas conectada al Supabase actual, recordar que
**las ramas Git comparten la misma base de datos**. No proporcionan copias de sus
registros. Volver a un commit anterior revierte código, no cambios de datos.

Ver [arquitectura](docs/Arquitectura.md), [verificación manual](docs/Verificacion.md)
y [control de cambios](Control_Cambios.md).

Ver también la [guía de documentación y migración](docs/Documentacion_y_Migracion.md)
y la [configuración JSON explicada línea por línea](docs/Configuracion_Comentada.md).
`Codex_Financer.txt` recoge las peticiones de estructura con el formato solicitado
por el propietario; los detalles técnicos permanecen en el código y las guías.
