// Activa modo estricto en el cargador de pruebas para detectar errores accidentales.
'use strict';
// Utiliza una máquina virtual de Node para cargar módulos sin navegador.
const vm = require('node:vm');
// Lee el código real del repositorio, evitando probar una copia diferente.
const fs = require('node:fs');
// Resuelve rutas relativas al propio test para no depender del directorio de ejecución.
const path = require('node:path');
// Exporta un cargador compartido que admite los módulos necesarios en su orden real.
module.exports = function cargar(...archivos) {
  // Crea un espacio global aislado para que una prueba no contamine otra.
  const contexto = vm.createContext({});
  // Carga los archivos solicitados en el orden indicado por la prueba.
  for (const archivo of archivos) {
    // Ejecuta el código de aplicación en el contexto aislado, sin inicializar el cliente real.
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../js', archivo), 'utf8'), contexto);
  // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
  }
  // Entrega las interfaces publicadas por los módulos para comprobar su comportamiento.
  return contexto.Financer;
// Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
};
