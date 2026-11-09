// Activa modo estricto también en la herramienta de comprobación.
'use strict';
// Lee los nombres de archivos sin añadir una dependencia externa.
const { readdirSync } = require('node:fs');
// Permite ejecutar el comprobador de sintaxis de Node y consultar su resultado.
const { spawnSync } = require('node:child_process');
// Comprueba todos los JavaScript de la aplicación, no una lista que pueda quedarse desactualizada.
for (const archivo of readdirSync('js').filter(n => n.endsWith('.js'))) {
  // Ejecuta node --check y conserva su salida para localizar una línea inválida.
  const resultado = spawnSync(process.execPath, ['--check', 'js/' + archivo], { stdio: 'inherit' });
  // Devuelve fallo a GitHub Actions si cualquier archivo tiene un error de sintaxis.
  if (resultado.status !== 0) process.exit(resultado.status || 1);
  // Deja constancia del archivo revisado para interpretar el resultado de la comprobación.
  console.log('Sintaxis correcta: js/' + archivo);
// Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
}
