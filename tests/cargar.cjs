'use strict';
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
module.exports = function cargar(...archivos) {
  const contexto = vm.createContext({});
  for (const archivo of archivos) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../js', archivo), 'utf8'), contexto);
  }
  return contexto.Financer;
};
