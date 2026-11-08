# Verificación manual de la base flexible

## Antes de empezar

Usar la URL de pruebas de la rama `desarrollo-v1.8`, una vez confirmado su despliegue.
El enlace público de GitHub Pages de `main` puede seguir mostrando la versión anterior.
Las pruebas automáticas ya verifican los siguientes recorridos con datos ficticios;
esta lista sirve para la comprobación final con la cuenta del propietario.

1. **Acceso.** Abrir la URL e iniciar sesión. Deben aparecer Patrimonio total,
   Liquidez, Inversiones, Plataformas, Resultados, Gastos y Objetivos.
2. **Navegación.** Entrar en Liquidez e Inversiones y abrir Crypto si ya existe.
   La ruta superior debe permitir volver a sus categorías anteriores. En móvil,
   el botón Menú abre/cierra la navegación.
3. **Recarga.** Situarse en una subcategoría y recargar. Debe conservarse la ruta
   en la misma pestaña, si el navegador permite guardar esa preferencia.
4. **Creación de prueba.** Crear una subcategoría llamada `PRUEBA Financer` dentro
   de una categoría existente. Crear dentro otra llamada `PRUEBA Nivel 2` y repetir
   si se quiere comprobar más profundidad. Deben aparecer y seguir tras recargar.
5. **Edición de prueba.** Volver al padre y editar exclusivamente el nombre del
   elemento de prueba. Debe aparecer «Guardado correctamente» y conservarse tras recargar.
6. **Plataformas.** Registrar `PRUEBA Plataforma`. Debe aparecer una sola vez en
   Plataformas y seguir tras recargar. Intentar repetir el mismo nombre no debe crear otra.
7. **Limpieza.** Eliminar solo los elementos `PRUEBA` creados en estos pasos,
   empezando por el más profundo. Confirmar los borrados. Un padre con hijos no se
   elimina; una plataforma con productos asociados tampoco.
8. **Salida.** Cerrar sesión. Debe mostrarse el acceso y desaparecer el contenido
   privado. Recargar no debe volver a abrir la cuenta sin una sesión válida.

No eliminar categorías o plataformas anteriores ni introducir importes reales para
esta comprobación. No hay formularios de posiciones, rentabilidad o movimientos en
esta entrega, por lo que todavía no deben darse esas funciones por verificadas.

## Si algo falla

Anotar el número del paso, el mensaje visible y la URL utilizada, sin compartir
contraseñas. Si el guardado no se confirma, pulsar Actualizar datos para comprobar
si el elemento llegó a guardarse antes de repetirlo.

## Reversión

El código puede volver al commit anterior de `desarrollo-v1.8` mediante una reversión
de la propuesta de estructura flexible. No se requiere revertir esquema: esta entrega
no lo modifica. Los elementos creados manualmente son datos de Supabase y no desaparecen
al revertir Git; borrar solo los elementos de prueba identificados.
