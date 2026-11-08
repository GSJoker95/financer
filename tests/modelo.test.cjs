'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Modelo: M, Estrategias } = require('./cargar.cjs')('modelo.js', 'estrategias.js');
const raices = [
  { id: 'l', nombre: 'Liquidez', bloque_padre_id: null },
  { id: 'i', nombre: 'Inversiones', bloque_padre_id: null }
];
test('conserva descendientes y sus IDs en árboles de 10.000 niveles', () => {
  const bloques = [...raices];
  for (let n = 0; n < 10000; n++) bloques.push({ id: 'n' + n, nombre: 'Nivel ' + n, bloque_padre_id: n ? 'n' + (n - 1) : 'i' });
  const arbol = M.crearArbol(bloques);
  assert.equal(M.ruta(arbol, 'n9999').length, 10001);
  assert.equal(arbol.nodos.get('n9999').id, 'n9999');
  assert.equal(arbol.nodos.size, bloques.length);
});
test('rechaza ciclos, padres inexistentes e IDs duplicados', () => {
  assert.throws(() => M.crearArbol([{ id: 'a', bloque_padre_id: 'b' }, { id: 'b', bloque_padre_id: 'a' }]), /ciclo/);
  assert.throws(() => M.crearArbol([{ id: 'a', bloque_padre_id: 'a' }]), /ciclo/);
  assert.throws(() => M.crearArbol([{ id: 'a', bloque_padre_id: 'otro' }]), /padre/);
  assert.throws(() => M.crearArbol([...raices, raices[0]]), /repetidos/);
});
test('no sustituye silenciosamente raíces faltantes o ambiguas', () => {
  assert.throws(() => M.principal(M.crearArbol([]), 'Liquidez'), /única/);
  assert.throws(() => M.principal(M.crearArbol([...raices, { id: 'x', nombre: 'liquidez ', bloque_padre_id: null }]), 'Liquidez'), /única/);
});
test('normaliza nombres y previene duplicados locales en el mismo apartado', () => {
  assert.equal(M.validarNombre('  Crypto  '), 'Crypto');
  assert.throws(() => M.validarNombre('   '), /nombre/);
  assert.throws(() => M.validarNombre('a'.repeat(81)), /80/);
  assert.throws(() => M.comprobarDuplicado([{ id: 'a', nombre: 'Préstamos' }], ' prestamos '), /existe/);
  assert.doesNotThrow(() => M.comprobarDuplicado([{ id: 'a', nombre: 'Hold' }], 'Hold', 'a'));
});
test('recupera navegación solo en una rama válida y tolera IDs eliminados', () => {
  const arbol = M.crearArbol([...raices, { id: 'c', nombre: 'Crypto', bloque_padre_id: 'i' }]);
  assert.equal(M.validarNavegacion({ page: 'inversiones', bloqueId: 'c' }, arbol).bloqueId, 'c');
  assert.equal(M.validarNavegacion({ page: 'liquidez', bloqueId: 'c' }, arbol).bloqueId, 'l');
  assert.equal(M.validarNavegacion({ page: 'inversiones', bloqueId: 'borrado' }, arbol).bloqueId, 'i');
  assert.equal(M.validarNavegacion({ page: 'desconocida' }, arbol).page, 'patrimonio');
});
test('los cuatro recorridos Crypto son diferentes y no obligan a incluir plataforma o red', () => {
  const pasos = nombre => Array.from(Estrategias.find(e => e.nombre === nombre).niveles);
  assert.deepEqual(pasos('Hold'), ['red', 'crypto']);
  assert.deepEqual(pasos('Farmeo DEX'), ['plataforma', 'trade']);
  assert.deepEqual(pasos('Pools de Liquidez'), ['plataforma', 'red', 'par']);
  assert.deepEqual(pasos('Shorts'), ['plataforma', 'red', 'trade']);
});
