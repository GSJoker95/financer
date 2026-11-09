# Trabajo en Financer

- Explicar en español sencillo. Si el propietario debe intervenir, usar pasos
  numerados con el resultado esperado.
- Leer primero `Codex_Financer.txt`, documento central de continuidad entre chats.
  Las indicaciones actuales del propietario prevalecen sobre documentos históricos.
  Los acuerdos técnicos complementarios están en `docs/Arquitectura.md`.
- Actualizar `Codex_Financer.txt` con cada cambio de código o estructura y cada
  indicación del propietario que les afecte, en la misma entrega. Distinguir lo
  acordado, implementado, probado y pendiente; conservar el registro de decisiones.
- Ante una duda sobre estructura o funcionamiento, preguntar antes de implementarla.
- Antes de cada cambio significativo crear un respaldo nuevo, sin mover los
  existentes; registrar referencia, SHA y recuperación en `Codex_Financer.txt`.
  Los cambios de datos o esquema requieren recuperación independiente de Git.
- Mantener coste cero, HTML/CSS/JavaScript, Supabase y alojamiento estático.
  No introducir APIs bancarias, de brokers ni servicios financieros externos.
- Crear ramas de trabajo desde el estado verificado de `desarrollo-v1.8`.
  Conservar `main` y los respaldos salvo autorización del propietario.
- Separar categorías, plataformas, posiciones y movimientos. No imponer los mismos
  niveles ni formularios a todas las estrategias. No inventar reglas financieras.
- Inspeccionar esquema, RLS y relaciones antes de cambiar datos o esquema. No probar
  borrados sobre registros reales ni incluir credenciales privadas o datos financieros
  en commits, logs, capturas o informes.
- Para verificar: `npm run check`, `npm test`, `npm run test:browser`, `git diff --check`.
  Las pruebas de navegador interceptan la red y no necesitan cuentas reales.
- Explicar qué está probado con simulaciones y qué se ha comprobado en el servicio real.
  No presentar el paso de sintaxis como validación funcional.
- Actualizar Control_Cambios.md y la documentación al entregar cambios significativos.
  Registrar recuperación de código por separado de la recuperación de datos.
