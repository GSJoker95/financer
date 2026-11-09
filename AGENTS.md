# Trabajo en Financer

- Explicar en español sencillo. Si el propietario debe intervenir, usar pasos
  numerados con explicación breve y resultado esperado; desglosar lo delicado.
- Leer `Codex_Financer.txt` antes de continuar. Contiene solo peticiones que afectan
  a la estructura y su respuesta: «Lo que pides / Lo que entiendo / Lo que hago».
  Las indicaciones actuales del propietario prevalecen sobre documentos anteriores.
- Añadir a ese documento las nuevas instrucciones de estructura con ese formato.
  No usarlo como log de herramientas, historial técnico general ni estimación de tiempo.
  Los detalles de implementación y pruebas van en el código, docs y Control_Cambios.md.
- Preguntar antes de ejecutar cuando haya dudas sobre estructura o funcionamiento.
  La autonomía técnica no autoriza inventar fórmulas, campos o reglas financieras.
- Documentar cada nueva instrucción de código con comentarios en español: qué hace
  y por qué. Incluir código propio de aplicación, pruebas, estilos y automatización.
  Si el formato no acepta comentarios, usar su documentación asociada existente o
  crear una nueva. Revisar y actualizar esa explicación junto con el código.
- Mantener la documentación de instalación, configuración y dependencias necesaria
  para migrar de plataforma. No confundir esa preparación con autorización de traslado.
- Trabajar sobre la rama viva `financer_V0` o preparar ramas `codex/*` nacidas de su
  SHA verificado e incorporarlas de vuelta a V0. `desarrollo-v1.8` es el nombre anterior.
- Conservar sin cambios `financer_V2` y los siguientes respaldos numerados, además
  de main y los respaldos históricos. Revisar el último respaldo antes de cambios
  significativos; si no cubre el estado previo, guardar otra referencia sin moverlo.
  Al cerrar y verificar un cambio significativo crear el siguiente `financer_VN`
  disponible (V3, V4, etc.) y continuar desarrollando en V0. Registrar SHA, alcance
  y recuperación en Control_Cambios.md. No reutilizar nombres de respaldos existentes.
- Mantener nombre, entrega y revisión visibles en `js/version.js`. Al preparar una
  versión nueva actualizar ese identificador, las revisiones de recursos en HTML y
  sus comprobaciones de navegador para no presentar una entrega antigua como actual.
  V0 es la rama editable, no el número de la entrega mostrada.
- Git respalda código/documentación; datos y esquema necesitan su propia recuperación.
- Mantener coste cero, HTML/CSS/JavaScript, Supabase y alojamiento estático mientras
  no se acuerde otro diseño. No introducir APIs de bancos, brokers o cuentas de inversión.
- Separar categorías, plataformas, posiciones y movimientos. Mantener los recorridos
  distintos de las estrategias y priorizar posiciones activas, sin histórico obligatorio.
- Inspeccionar esquema, RLS y relaciones antes de cambios de datos o esquema. No probar
  borrados sobre datos reales ni incluir secretos o datos financieros en commits o logs.
- Verificar `npm run check`, `npm test`, `npm run test:browser` y `git diff --check`
  según el alcance. Las pruebas de navegador interceptan la red y usan cuentas ficticias.
  Distinguir siempre simulación de validación con los servicios y la cuenta reales.
- Actualizar Control_Cambios.md, comentarios y documentos asociados al entregar cambios.
  Registrar recuperación de código por separado de la recuperación de datos.
