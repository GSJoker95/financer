'use strict';
const { readdirSync } = require('node:fs');
const { spawnSync } = require('node:child_process');
for (const archivo of readdirSync('js').filter(n => n.endsWith('.js'))) {
  const resultado = spawnSync(process.execPath, ['--check', 'js/' + archivo], { stdio: 'inherit' });
  if (resultado.status !== 0) process.exit(resultado.status || 1);
  console.log('Sintaxis correcta: js/' + archivo);
}
