# Arquitectura y acuerdos vigentes

## Límites de esta entrega

Mantener HTML/CSS/JavaScript, Supabase y el alojamiento estático existente.
No cambiar de framework, contratar servicios, crear proyectos ni duplicar datos.
Los cambios de esta entrega no requieren migraciones ni escrituras de mantenimiento
sobre registros existentes. No se crea contenido al iniciar sesión.

## Responsabilidades del código

| Archivo | Responsabilidad |
| --- | --- |
| `js/supabase-config.js` | Crear el cliente con URL y clave pública; tolerar un fallo de carga del CDN. |
| `js/modelo.js` | Construir el árbol por IDs, validar relaciones/nombres y sanear navegación. Funciones independientes del DOM y de Supabase. |
| `js/estrategias.js` | Describir los recorridos Crypto acordados; no crear datos ni imponer campos. |
| `js/datos.js` | Repositorio con cliente y usuario inyectados; lectura paginada y escrituras confirmadas. |
| `js/interfaz.js` | Renderizar por texto, navegar y gestionar categorías/plataformas. |
| `js/acceso.js` | Verificar usuario, cargar datos, gestionar sesión y descartar respuestas obsoletas. |

Todos los archivos se encapsulan y exponen su interfaz en `globalThis.Financer`.
No se necesitan `render`, `$`, `page` ni colecciones globales intercambiables.
El orden de scripts es explícito en `index.html`; no hay compilación.

El árbol conserva todos los descendientes y usa recorridos iterativos. Los ciclos,
padres ausentes e IDs repetidos provocan un error visible; no se ocultan ramas
ni se reescriben sus relaciones para intentar repararlas automáticamente.
Liquidez e Inversiones se identifican inicialmente por sus nombres normalizados
entre las raíces existentes. La interfaz protege las raíces de edición y borrado.
Asignarles un identificador funcional independiente del nombre requeriría un cambio
de esquema, fuera de esta entrega.

## Modelo financiero acordado, pendiente de formularios

```text
Patrimonio total
├── Liquidez
└── Inversiones
    ├── Bolsa
    ├── Crypto
    │   ├── Pools de Liquidez → Plataforma → Red → Par
    │   ├── Hold → Red → Crypto
    │   ├── Farmeo DEX → Plataforma → Trade
    │   └── Shorts → Plataforma → Red → Trade
    ├── Préstamos
    └── Cuentas remuneradas
```

- Los niveles varían por estrategia. Una rama puede ser más corta o incorporar
  más subdivisiones en el futuro. Se pueden añadir categorías nuevas desde la UI.
- Una plataforma es una entidad compartida, no una categoría distinta cada vez que
  aparece en un recorrido. Su pantalla de gestión es común.
- Una red tampoco debe convertirse en una plataforma ni duplicar el catálogo de
  plataformas. Su formulario y forma de almacenamiento quedan para la próxima fase.
- Trade significa una operación individual con apertura y cierre.
- El usuario no necesita varias posiciones independientes sobre el mismo activo/par
  dentro de la misma combinación de estrategia, plataforma y red cuando correspondan.
  La definición de esa identidad se aplicará al diseñar las posiciones; no se ha
  inventado una clave única sobre el nombre del producto.
- Solo se partirá de posiciones abiertas/activas. No se importará histórico pasado.
- El tratamiento al cerrar una posición se decidirá en Resultados.
- Las fórmulas, importes y campos específicos se decidirán antes de implementarlos.

La tabla `productos` ya distingue `bloque_id` y `plataforma_id` opcional. Su campo
`configuracion` es un objeto JSON que permitirá conservar atributos específicos
sin forzar una ficha idéntica a todas las estrategias. Al implementar edición se
deberán preservar las propiedades no reconocidas. No usar este objeto como sustituto
de las relaciones, la propiedad del usuario ni las futuras reglas de integridad.
Los recorridos de `estrategias.js` son contratos para esa siguiente fase, no una
implementación completa de menús Plataforma/Red/Posición.

## Base de datos verificada en lectura el 9 de noviembre de 2026

El proyecto inspeccionado coincide con la URL configurada por el frontend.
Existen `bloques`, `plataformas`, `productos` y `movimientos`, con RLS activada.
Las cuatro tablas tienen políticas SELECT/INSERT/UPDATE/DELETE por `usuario_id`;
UPDATE incluye `USING` y `WITH CHECK`. La propiedad tiene valor por defecto
`auth.uid()`. El repositorio además envía el propietario verificado en las creaciones
y lo filtra en lecturas y modificaciones; esto complementa RLS, no la reemplaza.

Las relaciones de categoría padre, producto/categoría, producto/plataforma y
movimiento/producto usan `ON DELETE RESTRICT`. Existen triggers, sin
`SECURITY DEFINER`, que comprueban propietario de las relaciones y evitan ciclos
entre categorías. No se han modificado estas definiciones.

Una transacción de solo lectura con rol `authenticated` y un sujeto ficticio
vio cero registros en las cuatro tablas. Esta comprobación no sustituye una
prueba completa con dos usuarios reales y no valida todavía el guardado autenticado.
No se utilizaron claves privadas en el frontend ni se exportaron datos financieros.

## Escrituras y sesión

- Las respuestas `.select(...).single()` confirman una fila afectada; cero filas
  no se anuncian como guardadas o eliminadas.
- Tras un guardado se usa la fila devuelta. No se encadena una recarga cuyo fallo
  pueda presentar un éxito confirmado como fracaso.
- Ante un fallo de conexión sin confirmación, se pide actualizar antes de repetir.
- La UI bloquea envíos repetidos mientras escribe y deja el formulario abierto
  cuando falla. El borrado necesita confirmación y respeta las FK de la base.
- Los duplicados de nombre se comprueban dentro del apartado en la copia cargada.
  No es una garantía transaccional entre pestañas: no se añadió una restricción
  única de base de datos sin definir antes sus implicaciones sobre datos existentes.
- Las respuestas de una sesión anterior no vuelven a pintar datos tras una salida.
  El evento de Auth limpia la UI inmediatamente y difiere las nuevas consultas
  fuera de su callback. La navegación se guarda con una clave por usuario.
- Las pruebas no escriben en el proyecto Supabase real.


## Documentación y versionado desde financer_V2

La rama viva pasa a ser `financer_V0`, nombre nuevo de `desarrollo-v1.8`. La versión
comentada se conserva en `financer_V2`. Los siguientes cierres significativos crean
`financer_V3`, V4 y sucesivos; los respaldos se preservan, no se usan para desarrollar.

Por instrucción del propietario, cada nueva instrucción de código propio debe
explicar qué hace y por qué en un comentario. HTML, CSS, JavaScript, YAML y Git ignore
admiten comentarios; los JSON se explican en `Configuracion_Comentada.md`. Las reglas
se conservan sintácticamente válidas. No se editan dependencias de terceros ni
respaldos anteriores para añadir comentarios retroactivamente.

`Codex_Financer.txt` se limita a peticiones de estructura y a la respuesta
«Lo que pides / Lo que entiendo / Lo que hago». El historial técnico se conserva
en este documento, Control_Cambios.md y las guías asociadas, con detalle de migración
en `Documentacion_y_Migracion.md`.
