# Configuración JSON comentada, línea por línea

JSON no admite comentarios. Añadir // o /* */ a estos archivos los invalidaría.
Por eso se mantienen intactos y se explica cada línea aquí. Esta correspondencia
es la de la entrega financer_V2; al modificar un JSON hay que actualizar su explicación.
No contiene credenciales privadas. Las huellas integrity son verificadores públicos de paquetes.

Los nombres financer_V0/V2/V3 identifican ramas y respaldos Git. La versión 1.8.9
de package.json se conserva porque este trabajo documenta, no cambia dependencias.

## package.json

El manifiesto declara los comandos; el lockfile fija lo que npm instala. No editar
manualmente versiones transitivas o huellas del lockfile: regenerarlas con npm y revisarlas.

| Línea | Campo o delimitador | Qué hace y por qué |
| --- | --- | --- |
| 1 | `{` | Abre el objeto o lista de configuración que agrupa sus propiedades; conserva la sintaxis válida de JSON. |
| 2 | `name` | Identifica el proyecto o paquete para que npm relacione instalación y manifiesto. |
| 3 | `private` | Impide publicar accidentalmente este proyecto en npm; NO oculta el repositorio de GitHub. |
| 4 | `version` | Conserva la versión exacta del proyecto o módulo para reproducir esta instalación. |
| 5 | `description` | Describe el propósito del paquete sin introducir un paso de compilación. |
| 6 | `scripts` | Agrupa los comandos técnicos que se pueden ejecutar mediante npm run. |
| 7 | `check` | Ejecuta la revisión de sintaxis para detectar código que el navegador no podría interpretar. |
| 8 | `test` | Ejecuta las pruebas de modelo y repositorio sin navegador ni conexión real a Supabase. |
| 9 | `test:browser` | Ejecuta los recorridos de interfaz con Chromium y toda la red interceptada. |
| 10 | `},` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
| 11 | `engines` | Declara qué versiones de Node pueden ejecutar estas herramientas; no impone Node al alojamiento estático. |
| 12 | `devDependencies` | Agrupa herramientas de desarrollo y pruebas; no introduce un servidor en la aplicación publicada. |
| 13 | `@supabase/supabase-js` | Declara la dependencia o comando @supabase/supabase-js y el valor requerido por el paquete contenedor; su instalación queda fijada por el lockfile. |
| 14 | `playwright` | Declara la dependencia o comando playwright y el valor requerido por el paquete contenedor; su instalación queda fijada por el lockfile. |
| 15 | `}` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
| 16 | `}` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |

## package-lock.json

El manifiesto declara los comandos; el lockfile fija lo que npm instala. No editar
manualmente versiones transitivas o huellas del lockfile: regenerarlas con npm y revisarlas.

| Línea | Campo o delimitador | Qué hace y por qué |
| --- | --- | --- |
| 1 | `{` | Abre el objeto o lista de configuración que agrupa sus propiedades; conserva la sintaxis válida de JSON. |
| 2 | `name` | Identifica el proyecto o paquete para que npm relacione instalación y manifiesto. |
| 3 | `version` | Conserva la versión exacta del proyecto o módulo para reproducir esta instalación. |
| 4 | `lockfileVersion` | Identifica la versión del formato de bloqueo para que npm lo interprete correctamente. |
| 5 | `requires` | Conserva la marca de resolución de dependencias generada por npm para este lockfile. |
| 6 | `packages` | Enumera el proyecto raíz y cada paquete instalado con su resolución exacta. |
| 7 | `(proyecto raíz)` | Describe el proyecto raíz dentro del lockfile para relacionarlo con package.json. |
| 8 | `name` | Identifica el proyecto o paquete para que npm relacione instalación y manifiesto. |
| 9 | `version` | Conserva la versión exacta del proyecto o módulo para reproducir esta instalación. |
| 10 | `devDependencies` | Agrupa herramientas de desarrollo y pruebas; no introduce un servidor en la aplicación publicada. |
| 11 | `@supabase/supabase-js` | Declara la dependencia o comando @supabase/supabase-js y el valor requerido por el paquete contenedor; su instalación queda fijada por el lockfile. |
| 12 | `playwright` | Declara la dependencia o comando playwright y el valor requerido por el paquete contenedor; su instalación queda fijada por el lockfile. |
| 13 | `},` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
| 14 | `engines` | Declara qué versiones de Node pueden ejecutar estas herramientas; no impone Node al alojamiento estático. |
| 15 | `node` | Conserva la condición de compatibilidad de Node indicada por este proyecto o dependencia. |
| 16 | `}` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
| 17 | `},` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
| 18 | `node_modules/@supabase/auth-js` | Abre la ficha de @supabase/auth-js con su versión, origen, integridad y dependencias reproducibles. |
| 19 | `version` | Conserva la versión exacta del proyecto o módulo para reproducir esta instalación. |
| 20 | `resolved` | Fija la URL de distribución del paquete para no descargar un origen distinto al reinstalar. |
| 21 | `integrity` | Guarda una huella criptográfica pública para detectar un archivo de paquete diferente; no es una contraseña. |
| 22 | `dev` | Marca el paquete como dependencia de las herramientas de desarrollo, no como backend de producción. |
| 23 | `license` | Conserva la licencia declarada del paquete para poder revisarla al redistribuir o migrar. |
| 24 | `dependencies` | Registra dependencias del paquete; los rangos solicitados se resuelven en entradas exactas del mismo lockfile. |
| 25 | `tslib` | Declara la dependencia o comando tslib y el valor requerido por el paquete contenedor; su instalación queda fijada por el lockfile. |
| 26 | `},` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
| 27 | `engines` | Declara qué versiones de Node pueden ejecutar estas herramientas; no impone Node al alojamiento estático. |
| 28 | `node` | Conserva la condición de compatibilidad de Node indicada por este proyecto o dependencia. |
| 29 | `}` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
| 30 | `},` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
| 31 | `node_modules/@supabase/functions-js` | Abre la ficha de @supabase/functions-js con su versión, origen, integridad y dependencias reproducibles. |
| 32 | `version` | Conserva la versión exacta del proyecto o módulo para reproducir esta instalación. |
| 33 | `resolved` | Fija la URL de distribución del paquete para no descargar un origen distinto al reinstalar. |
| 34 | `integrity` | Guarda una huella criptográfica pública para detectar un archivo de paquete diferente; no es una contraseña. |
| 35 | `dev` | Marca el paquete como dependencia de las herramientas de desarrollo, no como backend de producción. |
| 36 | `license` | Conserva la licencia declarada del paquete para poder revisarla al redistribuir o migrar. |
| 37 | `dependencies` | Registra dependencias del paquete; los rangos solicitados se resuelven en entradas exactas del mismo lockfile. |
| 38 | `tslib` | Declara la dependencia o comando tslib y el valor requerido por el paquete contenedor; su instalación queda fijada por el lockfile. |
| 39 | `},` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
| 40 | `engines` | Declara qué versiones de Node pueden ejecutar estas herramientas; no impone Node al alojamiento estático. |
| 41 | `node` | Conserva la condición de compatibilidad de Node indicada por este proyecto o dependencia. |
| 42 | `}` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
| 43 | `},` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
| 44 | `node_modules/@supabase/postgrest-js` | Abre la ficha de @supabase/postgrest-js con su versión, origen, integridad y dependencias reproducibles. |
| 45 | `version` | Conserva la versión exacta del proyecto o módulo para reproducir esta instalación. |
| 46 | `resolved` | Fija la URL de distribución del paquete para no descargar un origen distinto al reinstalar. |
| 47 | `integrity` | Guarda una huella criptográfica pública para detectar un archivo de paquete diferente; no es una contraseña. |
| 48 | `dev` | Marca el paquete como dependencia de las herramientas de desarrollo, no como backend de producción. |
| 49 | `license` | Conserva la licencia declarada del paquete para poder revisarla al redistribuir o migrar. |
| 50 | `dependencies` | Registra dependencias del paquete; los rangos solicitados se resuelven en entradas exactas del mismo lockfile. |
| 51 | `tslib` | Declara la dependencia o comando tslib y el valor requerido por el paquete contenedor; su instalación queda fijada por el lockfile. |
| 52 | `},` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
| 53 | `engines` | Declara qué versiones de Node pueden ejecutar estas herramientas; no impone Node al alojamiento estático. |
| 54 | `node` | Conserva la condición de compatibilidad de Node indicada por este proyecto o dependencia. |
| 55 | `}` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
| 56 | `},` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
| 57 | `node_modules/@supabase/realtime-js` | Abre la ficha de @supabase/realtime-js con su versión, origen, integridad y dependencias reproducibles. |
| 58 | `version` | Conserva la versión exacta del proyecto o módulo para reproducir esta instalación. |
| 59 | `resolved` | Fija la URL de distribución del paquete para no descargar un origen distinto al reinstalar. |
| 60 | `integrity` | Guarda una huella criptográfica pública para detectar un archivo de paquete diferente; no es una contraseña. |
| 61 | `dev` | Marca el paquete como dependencia de las herramientas de desarrollo, no como backend de producción. |
| 62 | `license` | Conserva la licencia declarada del paquete para poder revisarla al redistribuir o migrar. |
| 63 | `dependencies` | Registra dependencias del paquete; los rangos solicitados se resuelven en entradas exactas del mismo lockfile. |
| 64 | `@types/phoenix` | Declara la dependencia o comando @types/phoenix y el valor requerido por el paquete contenedor; su instalación queda fijada por el lockfile. |
| 65 | `@types/ws` | Declara la dependencia o comando @types/ws y el valor requerido por el paquete contenedor; su instalación queda fijada por el lockfile. |
| 66 | `tslib` | Declara la dependencia o comando tslib y el valor requerido por el paquete contenedor; su instalación queda fijada por el lockfile. |
| 67 | `ws` | Declara la dependencia o comando ws y el valor requerido por el paquete contenedor; su instalación queda fijada por el lockfile. |
| 68 | `},` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
| 69 | `engines` | Declara qué versiones de Node pueden ejecutar estas herramientas; no impone Node al alojamiento estático. |
| 70 | `node` | Conserva la condición de compatibilidad de Node indicada por este proyecto o dependencia. |
| 71 | `}` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
| 72 | `},` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
| 73 | `node_modules/@supabase/storage-js` | Abre la ficha de @supabase/storage-js con su versión, origen, integridad y dependencias reproducibles. |
| 74 | `version` | Conserva la versión exacta del proyecto o módulo para reproducir esta instalación. |
| 75 | `resolved` | Fija la URL de distribución del paquete para no descargar un origen distinto al reinstalar. |
| 76 | `integrity` | Guarda una huella criptográfica pública para detectar un archivo de paquete diferente; no es una contraseña. |
| 77 | `dev` | Marca el paquete como dependencia de las herramientas de desarrollo, no como backend de producción. |
| 78 | `license` | Conserva la licencia declarada del paquete para poder revisarla al redistribuir o migrar. |
| 79 | `dependencies` | Registra dependencias del paquete; los rangos solicitados se resuelven en entradas exactas del mismo lockfile. |
| 80 | `iceberg-js` | Declara la dependencia o comando iceberg-js y el valor requerido por el paquete contenedor; su instalación queda fijada por el lockfile. |
| 81 | `tslib` | Declara la dependencia o comando tslib y el valor requerido por el paquete contenedor; su instalación queda fijada por el lockfile. |
| 82 | `},` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
| 83 | `engines` | Declara qué versiones de Node pueden ejecutar estas herramientas; no impone Node al alojamiento estático. |
| 84 | `node` | Conserva la condición de compatibilidad de Node indicada por este proyecto o dependencia. |
| 85 | `}` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
| 86 | `},` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
| 87 | `node_modules/@supabase/supabase-js` | Abre la ficha de @supabase/supabase-js con su versión, origen, integridad y dependencias reproducibles. |
| 88 | `version` | Conserva la versión exacta del proyecto o módulo para reproducir esta instalación. |
| 89 | `resolved` | Fija la URL de distribución del paquete para no descargar un origen distinto al reinstalar. |
| 90 | `integrity` | Guarda una huella criptográfica pública para detectar un archivo de paquete diferente; no es una contraseña. |
| 91 | `dev` | Marca el paquete como dependencia de las herramientas de desarrollo, no como backend de producción. |
| 92 | `license` | Conserva la licencia declarada del paquete para poder revisarla al redistribuir o migrar. |
| 93 | `dependencies` | Registra dependencias del paquete; los rangos solicitados se resuelven en entradas exactas del mismo lockfile. |
| 94 | `@supabase/auth-js` | Declara la dependencia o comando @supabase/auth-js y el valor requerido por el paquete contenedor; su instalación queda fijada por el lockfile. |
| 95 | `@supabase/functions-js` | Declara la dependencia o comando @supabase/functions-js y el valor requerido por el paquete contenedor; su instalación queda fijada por el lockfile. |
| 96 | `@supabase/postgrest-js` | Declara la dependencia o comando @supabase/postgrest-js y el valor requerido por el paquete contenedor; su instalación queda fijada por el lockfile. |
| 97 | `@supabase/realtime-js` | Declara la dependencia o comando @supabase/realtime-js y el valor requerido por el paquete contenedor; su instalación queda fijada por el lockfile. |
| 98 | `@supabase/storage-js` | Declara la dependencia o comando @supabase/storage-js y el valor requerido por el paquete contenedor; su instalación queda fijada por el lockfile. |
| 99 | `},` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
| 100 | `engines` | Declara qué versiones de Node pueden ejecutar estas herramientas; no impone Node al alojamiento estático. |
| 101 | `node` | Conserva la condición de compatibilidad de Node indicada por este proyecto o dependencia. |
| 102 | `}` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
| 103 | `},` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
| 104 | `node_modules/@types/node` | Abre la ficha de @types/node con su versión, origen, integridad y dependencias reproducibles. |
| 105 | `version` | Conserva la versión exacta del proyecto o módulo para reproducir esta instalación. |
| 106 | `resolved` | Fija la URL de distribución del paquete para no descargar un origen distinto al reinstalar. |
| 107 | `integrity` | Guarda una huella criptográfica pública para detectar un archivo de paquete diferente; no es una contraseña. |
| 108 | `dev` | Marca el paquete como dependencia de las herramientas de desarrollo, no como backend de producción. |
| 109 | `license` | Conserva la licencia declarada del paquete para poder revisarla al redistribuir o migrar. |
| 110 | `dependencies` | Registra dependencias del paquete; los rangos solicitados se resuelven en entradas exactas del mismo lockfile. |
| 111 | `undici-types` | Declara la dependencia o comando undici-types y el valor requerido por el paquete contenedor; su instalación queda fijada por el lockfile. |
| 112 | `}` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
| 113 | `},` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
| 114 | `node_modules/@types/phoenix` | Abre la ficha de @types/phoenix con su versión, origen, integridad y dependencias reproducibles. |
| 115 | `version` | Conserva la versión exacta del proyecto o módulo para reproducir esta instalación. |
| 116 | `resolved` | Fija la URL de distribución del paquete para no descargar un origen distinto al reinstalar. |
| 117 | `integrity` | Guarda una huella criptográfica pública para detectar un archivo de paquete diferente; no es una contraseña. |
| 118 | `dev` | Marca el paquete como dependencia de las herramientas de desarrollo, no como backend de producción. |
| 119 | `license` | Conserva la licencia declarada del paquete para poder revisarla al redistribuir o migrar. |
| 120 | `},` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
| 121 | `node_modules/@types/ws` | Abre la ficha de @types/ws con su versión, origen, integridad y dependencias reproducibles. |
| 122 | `version` | Conserva la versión exacta del proyecto o módulo para reproducir esta instalación. |
| 123 | `resolved` | Fija la URL de distribución del paquete para no descargar un origen distinto al reinstalar. |
| 124 | `integrity` | Guarda una huella criptográfica pública para detectar un archivo de paquete diferente; no es una contraseña. |
| 125 | `dev` | Marca el paquete como dependencia de las herramientas de desarrollo, no como backend de producción. |
| 126 | `license` | Conserva la licencia declarada del paquete para poder revisarla al redistribuir o migrar. |
| 127 | `dependencies` | Registra dependencias del paquete; los rangos solicitados se resuelven en entradas exactas del mismo lockfile. |
| 128 | `@types/node` | Declara la dependencia o comando @types/node y el valor requerido por el paquete contenedor; su instalación queda fijada por el lockfile. |
| 129 | `}` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
| 130 | `},` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
| 131 | `node_modules/fsevents` | Abre la ficha de fsevents con su versión, origen, integridad y dependencias reproducibles. |
| 132 | `version` | Conserva la versión exacta del proyecto o módulo para reproducir esta instalación. |
| 133 | `resolved` | Fija la URL de distribución del paquete para no descargar un origen distinto al reinstalar. |
| 134 | `integrity` | Guarda una huella criptográfica pública para detectar un archivo de paquete diferente; no es una contraseña. |
| 135 | `dev` | Marca el paquete como dependencia de las herramientas de desarrollo, no como backend de producción. |
| 136 | `hasInstallScript` | Indica que el paquete tiene un script de instalación; npm ci --ignore-scripts evita ejecutarlo automáticamente. |
| 137 | `license` | Conserva la licencia declarada del paquete para poder revisarla al redistribuir o migrar. |
| 138 | `optional` | Declara que este componente es opcional para no exigirlo en sistemas donde no corresponde. |
| 139 | `os` | Limita los sistemas donde corresponde instalar esta dependencia nativa. |
| 140 | `darwin` | Restringe fsevents a macOS; otros sistemas no necesitan instalar ese componente opcional. |
| 141 | `],` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
| 142 | `engines` | Declara qué versiones de Node pueden ejecutar estas herramientas; no impone Node al alojamiento estático. |
| 143 | `node` | Conserva la condición de compatibilidad de Node indicada por este proyecto o dependencia. |
| 144 | `}` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
| 145 | `},` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
| 146 | `node_modules/iceberg-js` | Abre la ficha de iceberg-js con su versión, origen, integridad y dependencias reproducibles. |
| 147 | `version` | Conserva la versión exacta del proyecto o módulo para reproducir esta instalación. |
| 148 | `resolved` | Fija la URL de distribución del paquete para no descargar un origen distinto al reinstalar. |
| 149 | `integrity` | Guarda una huella criptográfica pública para detectar un archivo de paquete diferente; no es una contraseña. |
| 150 | `dev` | Marca el paquete como dependencia de las herramientas de desarrollo, no como backend de producción. |
| 151 | `license` | Conserva la licencia declarada del paquete para poder revisarla al redistribuir o migrar. |
| 152 | `engines` | Declara qué versiones de Node pueden ejecutar estas herramientas; no impone Node al alojamiento estático. |
| 153 | `node` | Conserva la condición de compatibilidad de Node indicada por este proyecto o dependencia. |
| 154 | `}` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
| 155 | `},` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
| 156 | `node_modules/playwright` | Abre la ficha de playwright con su versión, origen, integridad y dependencias reproducibles. |
| 157 | `version` | Conserva la versión exacta del proyecto o módulo para reproducir esta instalación. |
| 158 | `resolved` | Fija la URL de distribución del paquete para no descargar un origen distinto al reinstalar. |
| 159 | `integrity` | Guarda una huella criptográfica pública para detectar un archivo de paquete diferente; no es una contraseña. |
| 160 | `dev` | Marca el paquete como dependencia de las herramientas de desarrollo, no como backend de producción. |
| 161 | `license` | Conserva la licencia declarada del paquete para poder revisarla al redistribuir o migrar. |
| 162 | `dependencies` | Registra dependencias del paquete; los rangos solicitados se resuelven en entradas exactas del mismo lockfile. |
| 163 | `playwright-core` | Declara la dependencia o comando playwright-core y el valor requerido por el paquete contenedor; su instalación queda fijada por el lockfile. |
| 164 | `},` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
| 165 | `bin` | Relaciona un comando ejecutable con su archivo de entrada dentro del paquete. |
| 166 | `playwright` | Declara la dependencia o comando playwright y el valor requerido por el paquete contenedor; su instalación queda fijada por el lockfile. |
| 167 | `},` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
| 168 | `engines` | Declara qué versiones de Node pueden ejecutar estas herramientas; no impone Node al alojamiento estático. |
| 169 | `node` | Conserva la condición de compatibilidad de Node indicada por este proyecto o dependencia. |
| 170 | `},` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
| 171 | `optionalDependencies` | Agrupa componentes que npm puede omitir cuando no son compatibles con el sistema. |
| 172 | `fsevents` | Declara la dependencia o comando fsevents y el valor requerido por el paquete contenedor; su instalación queda fijada por el lockfile. |
| 173 | `}` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
| 174 | `},` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
| 175 | `node_modules/playwright-core` | Abre la ficha de playwright-core con su versión, origen, integridad y dependencias reproducibles. |
| 176 | `version` | Conserva la versión exacta del proyecto o módulo para reproducir esta instalación. |
| 177 | `resolved` | Fija la URL de distribución del paquete para no descargar un origen distinto al reinstalar. |
| 178 | `integrity` | Guarda una huella criptográfica pública para detectar un archivo de paquete diferente; no es una contraseña. |
| 179 | `dev` | Marca el paquete como dependencia de las herramientas de desarrollo, no como backend de producción. |
| 180 | `license` | Conserva la licencia declarada del paquete para poder revisarla al redistribuir o migrar. |
| 181 | `bin` | Relaciona un comando ejecutable con su archivo de entrada dentro del paquete. |
| 182 | `playwright-core` | Declara la dependencia o comando playwright-core y el valor requerido por el paquete contenedor; su instalación queda fijada por el lockfile. |
| 183 | `},` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
| 184 | `engines` | Declara qué versiones de Node pueden ejecutar estas herramientas; no impone Node al alojamiento estático. |
| 185 | `node` | Conserva la condición de compatibilidad de Node indicada por este proyecto o dependencia. |
| 186 | `}` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
| 187 | `},` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
| 188 | `node_modules/tslib` | Abre la ficha de tslib con su versión, origen, integridad y dependencias reproducibles. |
| 189 | `version` | Conserva la versión exacta del proyecto o módulo para reproducir esta instalación. |
| 190 | `resolved` | Fija la URL de distribución del paquete para no descargar un origen distinto al reinstalar. |
| 191 | `integrity` | Guarda una huella criptográfica pública para detectar un archivo de paquete diferente; no es una contraseña. |
| 192 | `dev` | Marca el paquete como dependencia de las herramientas de desarrollo, no como backend de producción. |
| 193 | `license` | Conserva la licencia declarada del paquete para poder revisarla al redistribuir o migrar. |
| 194 | `},` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
| 195 | `node_modules/undici-types` | Abre la ficha de undici-types con su versión, origen, integridad y dependencias reproducibles. |
| 196 | `version` | Conserva la versión exacta del proyecto o módulo para reproducir esta instalación. |
| 197 | `resolved` | Fija la URL de distribución del paquete para no descargar un origen distinto al reinstalar. |
| 198 | `integrity` | Guarda una huella criptográfica pública para detectar un archivo de paquete diferente; no es una contraseña. |
| 199 | `dev` | Marca el paquete como dependencia de las herramientas de desarrollo, no como backend de producción. |
| 200 | `license` | Conserva la licencia declarada del paquete para poder revisarla al redistribuir o migrar. |
| 201 | `},` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
| 202 | `node_modules/ws` | Abre la ficha de ws con su versión, origen, integridad y dependencias reproducibles. |
| 203 | `version` | Conserva la versión exacta del proyecto o módulo para reproducir esta instalación. |
| 204 | `resolved` | Fija la URL de distribución del paquete para no descargar un origen distinto al reinstalar. |
| 205 | `integrity` | Guarda una huella criptográfica pública para detectar un archivo de paquete diferente; no es una contraseña. |
| 206 | `dev` | Marca el paquete como dependencia de las herramientas de desarrollo, no como backend de producción. |
| 207 | `license` | Conserva la licencia declarada del paquete para poder revisarla al redistribuir o migrar. |
| 208 | `engines` | Declara qué versiones de Node pueden ejecutar estas herramientas; no impone Node al alojamiento estático. |
| 209 | `node` | Conserva la condición de compatibilidad de Node indicada por este proyecto o dependencia. |
| 210 | `},` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
| 211 | `peerDependencies` | Indica dependencias compatibles que el paquete puede compartir con su entorno. |
| 212 | `bufferutil` | Declara la dependencia o comando bufferutil y el valor requerido por el paquete contenedor; su instalación queda fijada por el lockfile. |
| 213 | `utf-8-validate` | Declara la dependencia o comando utf-8-validate y el valor requerido por el paquete contenedor; su instalación queda fijada por el lockfile. |
| 214 | `},` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
| 215 | `peerDependenciesMeta` | Añade condiciones a las dependencias compartidas, por ejemplo que no sean obligatorias. |
| 216 | `bufferutil` | Declara la dependencia o comando bufferutil y el valor requerido por el paquete contenedor; su instalación queda fijada por el lockfile. |
| 217 | `optional` | Declara que este componente es opcional para no exigirlo en sistemas donde no corresponde. |
| 218 | `},` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
| 219 | `utf-8-validate` | Declara la dependencia o comando utf-8-validate y el valor requerido por el paquete contenedor; su instalación queda fijada por el lockfile. |
| 220 | `optional` | Declara que este componente es opcional para no exigirlo en sistemas donde no corresponde. |
| 221 | `}` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
| 222 | `}` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
| 223 | `}` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
| 224 | `}` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
| 225 | `}` | Cierra el objeto o lista anterior; la coma, si existe, separa la siguiente propiedad sin alterar valores. |
