# Guía de documentación, archivos y migración de Financer

Esta guía explica cómo conservar y trasladar el proyecto. **No se ha migrado de
proveedor ni modificado la base de datos en la entrega financer_V2.** Se revisa el
código propio versionado; las librerías descargadas de terceros no se comentan ni
se copian al repositorio. Sus versiones e integridad quedan en el lockfile.

## 1. Dónde se documenta cada cosa

- **Código:** cada línea de JavaScript propio, HTML, reglas CSS y automatización
  lleva una explicación de su finalidad. Las líneas de cierre delimitan los bloques.
  Al cambiar una instrucción, actualizar también su comentario para no dejarlo falso.
- **JSON:** no acepta comentarios. `Configuracion_Comentada.md` explica cada línea
  de package.json y package-lock.json sin invalidarlos. Mantener la correspondencia
  si npm regenera el lockfile. Los archivos generados se regeneran, no se parchean.
- **Peticiones de estructura:** `Codex_Financer.txt`, exclusivamente con los tres
  apartados pedidos: Lo que pides, Lo que entiendo y Lo que hago.
- **Decisiones técnicas:** `Arquitectura.md`, con implementación y límites reales.
- **Pruebas del propietario:** `Verificacion.md`, con pasos numerados y resultados esperados.
- **Entregas y recuperación:** `../Control_Cambios.md`, con referencias Git y limitaciones.
- **Instrucciones para otro agente o IA:** `../AGENTS.md`.

El código y la documentación se mantienen juntos. No dar por terminada una función
por tenerla descrita como intención, ni usar un comentario para prometer que una
comprobación de seguridad o un cálculo ya están implementados.

## 2. Inventario completo revisado

Se revisaron estos 23 archivos originales. Se añaden únicamente esta guía y la
explicación JSON; no se incluyen node_modules, capturas temporales ni secretos.

| Archivo | Finalidad y documentación aplicada |
| --- | --- |
| `index.html` | Pantallas, formularios y orden de scripts; cada línea lleva comentario HTML. |
| `css/estilos.css` | Estilos de ordenador/móvil; selectores y propiedades separados y comentados. |
| `js/version.js` | Identificación pública comentada de nombre, entrega, revisión y sitio; añadida después de la revisión inicial V2. |
| `js/supabase-config.js` | Conexión pública única; comentarios de cada instrucción y de la dependencia del CDN. |
| `js/modelo.js` | Árbol, nombres y navegación; comentarios de validaciones, recorridos y resultados. |
| `js/estrategias.js` | Recorridos acordados; comentarios por estrategia y alcance pendiente. |
| `js/datos.js` | Lecturas y escrituras; comentarios de filtros, paginación y confirmación. |
| `js/interfaz.js` | Nodos, navegación y formularios; comentarios de estado, eventos, mensajes y sesiones. |
| `js/acceso.js` | Verificación de identidad, entrada/salida y reintentos; comentarios de cada paso. |
| `scripts/check-js.cjs` | Comprobación de sintaxis; comentarios de lectura, ejecución y estado de salida. |
| `tests/cargar.cjs` | Cargador aislado para pruebas; comentarios de sus dependencias y ejecución. |
| `tests/modelo.test.cjs` | Casos de árbol y rutas; comentarios de datos, acciones y qué demuestra cada aserción. |
| `tests/datos.test.cjs` | Cliente ficticio y casos de repositorio; comentarios de simulación y comprobaciones. |
| `tests/browser.cjs` | Navegador con toda la red interceptada; comentarios de recursos, escenarios y aserciones. |
| `.github/workflows/comprobaciones.yml` | CI; comentarios de eventos, permisos y pasos; ramas adaptadas a V0. |
| `.gitignore` | Exclusiones de Git; comentario del motivo de cada patrón. |
| `package.json` | Manifiesto sin cambios de valores; explicado línea por línea en la guía JSON. |
| `package-lock.json` | Dependencias sin cambios de valores o huellas; explicado línea por línea en la guía JSON. |
| `AGENTS.md` | Instrucciones permanentes revisadas para documentación, dudas, V0 y respaldos. |
| `Codex_Financer.txt` | Reorganizado según la petición: estructura, interpretación e implementación. |
| `Control_Cambios.md` | Conserva el historial y registra la entrega comentada y su recuperación. |
| `README.md` | Presentación e instalación; comandos explicados y referencias actualizadas a V0/V2. |
| `docs/Arquitectura.md` | Responsabilidades y acuerdos; incorpora el método actual de documentación/versionado. |
| `docs/Verificacion.md` | Pasos manuales; actualiza rama viva, recuperación y comprobación de despliegues. |

Los documentos en prosa ya explican su contenido: no reciben comentarios de código
artificiales. Las ramas de respaldo anteriores se conservan intactas; modificar
sus archivos para comentarlos destruiría el significado de esas instantáneas.

## 3. Cómo funciona y qué necesita en ejecución

1. Un alojamiento estático sirve index.html, css y js por HTTP(S).
2. version.js identifica la entrega antes de comprobar el acceso. El navegador
   carga después el SDK Supabase 2.95.3 desde el CDN fijado en index.html.
3. supabase-config.js crea el cliente con la URL y clave pública del proyecto existente.
4. modelo.js y estrategias.js aportan reglas y contratos, sin consultas ni escrituras.
5. datos.js prepara el repositorio; interfaz.js prepara las pantallas y sus eventos.
6. acceso.js verifica la identidad y entonces carga categorías/plataformas del usuario.
7. Las modificaciones desde la aplicación usan la sesión de ese usuario y las reglas
   del servidor. El código no lleva credenciales de administrador ni un backend propio.

La clave pública que necesita un navegador no reemplaza las políticas RLS.
No convertir una clave privada o service_role en variable pública al trasladar la web.
El sitio necesita Internet para el CDN y Supabase. Una copia de los archivos estáticos
no convierte por sí sola a Financer en una aplicación financiera sin conexión.

## 4. Reproducir las comprobaciones en otro ordenador

Se necesita Git, Node.js 20 o superior, npm y un Chromium preparado para Playwright.
No se necesita instalar un framework ni construir el frontend. Desde la raíz del
repositorio, después de obtenerlo y situarse en la rama que se quiera comprobar:

```sh
# Descarga las versiones exactas del lockfile sin ejecutar scripts de instalación de terceros.
npm ci --ignore-scripts
# Detecta errores de sintaxis en todos los JavaScript de la aplicación, incluida la versión.
npm run check
# Verifica reglas y repositorio con datos ficticios y sin navegador.
npm test
# Descarga el navegador para las pruebas, si aún no está preparado en este ordenador.
npx playwright install chromium
# Comprueba la interfaz con SDK real y API ficticia; toda la red queda interceptada.
npm run test:browser
# Detecta problemas de espacios en el cambio antes de entregarlo.
git diff --check
```

Si Linux indica librerías del navegador ausentes, revisar los requisitos del sistema
que muestra Playwright. GitHub Actions instala esas librerías en su ejecutor efímero
mediante el comando comentado del workflow; no asumir privilegios de administrador
ni ejecutar cambios de sistema sin revisar el entorno de destino.

CHROMIUM_PATH permite indicar un navegador instalado. No se fijan rutas específicas
como requisito de la aplicación. Las capturas quedan en test-results y se ignoran
por Git. Las herramientas auxiliares utilizadas durante esta revisión para comparar
JavaScript, CSS y HTML no se añadieron a las dependencias del proyecto.

## 5. Trasladar únicamente el alojamiento web

Esta es una guía para un traslado futuro, no una acción realizada en V2:

1. Conservar un respaldo Git del estado aceptado y anotar su SHA. Identificar la URL
   y el commit que sirve el alojamiento actual para poder comparar después.
2. Copiar el código de la rama/version elegida al nuevo alojamiento estático. Los
   archivos necesarios en ejecución son index.html, css y js. No copiar node_modules,
   .git, .env ni credenciales privadas al directorio público.
3. Usar la raíz como salida y no introducir un comando de compilación inexistente.
   Mantener las rutas relativas para servir desde raíz o subcarpeta.
4. Si se conserva Supabase, mantener la URL y clave pública correctas en la configuración.
   Revisar en Auth las direcciones permitidas que requiera el flujo de acceso elegido.
   Un dominio nuevo tiene almacenamiento de sesión distinto: iniciar sesión de nuevo.
5. Comprobar la carga del CDN, la pantalla de acceso y la navegación. Con la cuenta
   del propietario, verificar escritura/recarga usando solo elementos de prueba.
6. Comprobar ordenador y móvil antes de sustituir la URL habitual. Conservar la
   anterior durante la verificación si el proveedor lo permite sin costes añadidos.

No es necesario mover los registros de Supabase por cambiar el alojamiento web.
Todas las ramas pueden seguir apuntando a la misma base: una URL de pruebas no
implica que existan datos de pruebas separados de los reales.

## 6. Trasladar también datos o autenticación

El repositorio documenta el contrato y las comprobaciones del esquema existente,
pero no contiene una exportación recuperable completa de la base de datos ni de Auth.
Por tanto, un traslado de esos servicios debe prepararse como una tarea específica:

1. Acordar destino, permisos, coste y alcance antes de modificar el proyecto actual.
2. Obtener con las herramientas oficiales una copia recuperable del esquema y los
   datos necesarios, incluidos restricciones, índices, políticas, triggers y funciones.
   Tratar la copia de datos y la información de cuentas como privada, fuera del Git público.
3. Verificar qué elementos de Auth, claves y configuraciones se exportan y cuáles no.
   No prometer que las contraseñas o sesiones existentes funcionarán en otro proveedor.
4. Restaurar primero en un entorno aislado y comprobar relaciones de propiedad,
   claves foráneas, ciclos, permisos y acceso desde dos cuentas controladas.
5. Si se abandona Supabase, adaptar el repositorio y acceso.js al nuevo servicio.
   auth.uid(), roles y RLS son parte del contrato de seguridad del backend actual;
   no desaparecen por trasladar HTML ni deben sustituirse solo por filtros de pantalla.
6. Verificar conteos, relaciones, fechas e importes sin volcar información financiera
   en el informe. Conservar el origen hasta demostrar lectura y recuperación correctas.

Cambios de esquema o datos requieren un plan de reversión propio. Un respaldo Git
no deshace registros creados o eliminados mientras se utiliza la aplicación.

## 7. Rama viva, respaldos y publicación

URL de trabajo de V0 verificada: https://financer-v0.financer-pruebas.pages.dev/
Instantánea publicada de la activación: https://345e318a.financer-pruebas.pages.dev/
Ambas corresponden al código comentado. La pantalla de acceso se comprobó en
1280/390 px, sin errores JavaScript y sin iniciar sesión real.

- **financer_V0:** rama de trabajo permanente, antes llamada desarrollo-v1.8.
- **financer_V2:** instantánea de la entrega comentada tras comprobarla.
- **financer_V3, V4, etc.:** se crean después de futuros cambios significativos
  comprobados, sin mover versiones existentes ni desarrollar dentro de ellas.
- **respaldo-pre-financer_V2:** estado previo a esta documentación, en el SHA
  3d084c43509c651958eb95bc9b171fe590c9c424.
- main y las referencias históricas se conservan. La numeración de respaldos no
  cambia automáticamente la versión de dependencias o del manifiesto npm.

Para investigar una recuperación, crear una rama nueva desde el respaldo y comparar
antes de incorporar nada a V0. No usar force push ni sustituir el historial de V0.

```sh
# Actualiza las referencias remotas sin reemplazar por la fuerza archivos de trabajo.
git fetch origin
# Crea una rama de investigación desde la instantánea V2, conservando V0 sin cambios.
git switch -c recuperacion-V2 origin/financer_V2
```

El workflow comprueba V0 y ramas preparatorias codex/*. Los respaldos numerados no
se usan como destinos de propuestas de desarrollo ni requieren ejecutar CI por
cada creación de referencia si apuntan a un commit ya verificado.

Renombrar una rama de GitHub no garantiza que Cloudflare actualice su campo de rama
de producción. Verificar su check de despliegue y la URL que corresponde a V0.
Si conserva desarrollo-v1.8, seleccionar financer_V0 en la configuración del proyecto
Cloudflare; no recrear la rama antigua para ocultar el problema. Esta configuración
es externa al repositorio y no debe darse por cambiada sin verificarla.

## 8. Comprobaciones de esta revisión

Para evitar que los comentarios introduzcan comportamiento nuevo se comparan con el
commit de origen: estructura de instrucciones JavaScript sin comentarios/posiciones,
selectores y declaraciones CSS en el mismo orden y árbol HTML sin comentarios o
espacios de formato. Los JSON conservan sus bytes. En YAML la diferencia intencionada
es el filtro de ramas de CI, adaptado a V0. Los patrones efectivos de .gitignore se
conservan. Se ejecutan además las pruebas existentes y la revisión Git de espacios.

Estas comprobaciones no añaden un login real ni escrituras financieras nuevas.
Continúa pendiente la prueba manual autenticada del propietario y los formularios
de posiciones activas, redes, activos, pares y Trades de cada estrategia.


## Identificación y sustitución autorizada del respaldo V2

La versión visible se mantiene en `js/version.js`: nombre Financer, entrega V2 y
revisión 2026-11-10.1. La rama V0 se presenta solo en su dirección de trabajo; una
vista previa genérica muestra el hostname real para no atribuirle una rama falsa.

Al preparar nuevas entregas, actualizar esos datos y las revisiones de recursos
HTML, mantener comentarios y comprobar la identificación antes/después del acceso
y con el CDN caído. La versión npm del manifiesto sigue identificando las herramientas
y no se utiliza para decidir qué respaldo está comprobando el propietario.

Por petición expresa del 10 de noviembre, V2 se actualiza tras verificar esta
identificación. Su estado anterior se conserva en `archivo-financer_V2-2026-11-10`.
No trasladar esta excepción a los respaldos futuros sin una instrucción equivalente.
