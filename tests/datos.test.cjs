'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Datos } = require('./cargar.cjs')('modelo.js', 'datos.js');
function clienteFalso(resolver) {
  const llamadas = [];
  const cliente = { from(tabla) {
    const pasos = { tabla, filtros: [], operacion: 'lectura' };
    const consulta = {
      select(columnas) { pasos.columnas = columnas; return consulta; },
      eq(campo, valor) { pasos.filtros.push([campo, valor]); return consulta; },
      order() { return consulta; },
      insert(campos) { pasos.operacion = 'crear'; pasos.campos = campos; return consulta; },
      update(campos) { pasos.operacion = 'editar'; pasos.campos = campos; return consulta; },
      delete() { pasos.operacion = 'eliminar'; return consulta; },
      range(desde, hasta) { pasos.rango = [desde, hasta]; llamadas.push(pasos); return Promise.resolve(resolver(pasos)); },
      single() { pasos.single = true; llamadas.push(pasos); return Promise.resolve(resolver(pasos)); }
    };
    return consulta;
  } };
  return { cliente, llamadas };
}
test('pagina lecturas y filtra ambas tablas por el usuario verificado', async () => {
  const { cliente, llamadas } = clienteFalso(p => ({ data: p.tabla === 'bloques' && p.rango[0] === 0
    ? Array.from({ length: 500 }, (_, n) => ({ id: String(n) })) : [], error: null }));
  const datos = await Datos.crearRepositorio(cliente, 'usuario-a').cargar();
  assert.equal(datos.bloques.length, 500);
  assert.equal(llamadas.length, 3);
  assert.ok(llamadas.every(p => p.filtros.some(([c, v]) => c === 'usuario_id' && v === 'usuario-a')));
});
test('escrituras asignan propietario y confirman la fila afectada', async () => {
  const { cliente, llamadas } = clienteFalso(() => ({ data: { id: 'nuevo', nombre: 'Hold' }, error: null }));
  const repo = Datos.crearRepositorio(cliente, 'usuario-a');
  await repo.guardarBloque(' Hold ', null, 'crypto');
  assert.equal(llamadas[0].campos.usuario_id, 'usuario-a');
  assert.equal(llamadas[0].campos.bloque_padre_id, 'crypto');
  assert.equal(llamadas[0].campos.nombre, 'Hold');
  await repo.guardarPlataforma('Compartida', 'nuevo');
  assert.deepEqual(llamadas[1].filtros, [['id', 'nuevo'], ['usuario_id', 'usuario-a']]);
  assert.ok(llamadas.every(p => p.single));
});
test('una escritura sin fila visible y un borrado rechazado no son éxitos', async () => {
  const vacio = clienteFalso(() => ({ data: null, error: null }));
  await assert.rejects(Datos.crearRepositorio(vacio.cliente, 'a').guardarPlataforma('X'), /confirmar/);
  const restringido = clienteFalso(() => ({ data: null, error: { code: '23503' } }));
  await assert.rejects(Datos.crearRepositorio(restringido.cliente, 'a').eliminarBloque('x'), e => e.code === '23503');
  assert.deepEqual(restringido.llamadas[0].filtros, [['id', 'x'], ['usuario_id', 'a']]);
});
test('no crea categorías raíz ni usa repositorios sin sesión', async () => {
  assert.throws(() => Datos.crearRepositorio({}, ''), /sesión/);
  const { cliente, llamadas } = clienteFalso(() => ({ data: null }));
  await assert.rejects(Datos.crearRepositorio(cliente, 'a').guardarBloque('Raíz'), /categoría/);
  assert.equal(llamadas.length, 0);
});
test('errores de API se convierten en mensajes sin detalles financieros', () => {
  assert.match(Datos.mensajeError({ code: '23503', details: 'privado' }, 'Fallo'), /asociados/);
  assert.match(Datos.mensajeError({ code: 'PGRST116' }, 'Fallo'), /No se ha confirmado/);
  assert.equal(Datos.mensajeError({ message: 'privado' }, 'Fallo'), 'Fallo');
});
