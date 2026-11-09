// Activa modo estricto para que las pruebas también detecten errores de asignación.
'use strict';
// Utiliza el ejecutor integrado de Node sin instalar otro framework de pruebas.
const { test } = require('node:test');
// Importa comparaciones estrictas que convierten diferencias en fallos verificables.
const assert = require('node:assert/strict');
// Carga modelo y recorridos reales en un contexto aislado, sin usar Supabase.
const { Modelo: M, Estrategias } = require('./cargar.cjs')('modelo.js', 'estrategias.js');
// Define raíces ficticias que permiten probar la jerarquía sin datos del propietario.
const raices = [
  // Representa Liquidez como raíz con padre nulo, igual que en el esquema existente.
  { id: 'l', nombre: 'Liquidez', bloque_padre_id: null },
  // Representa Inversiones como raíz independiente para detectar cruces de navegación.
  { id: 'i', nombre: 'Inversiones', bloque_padre_id: null }
// Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
];
// Verifica que el modelo admite profundidad alta sin perder categorías ni desbordar llamadas.
test('conserva descendientes y sus IDs en árboles de 10.000 niveles', () => {
  // Copia las raíces para que esta prueba no modifique las de otras pruebas.
  const bloques = [...raices];
  // Genera 10.000 descendientes ficticios unidos por ID y no por nombre.
  for (let n = 0; n < 10000; n++) bloques.push({ id: 'n' + n, nombre: 'Nivel ' + n, bloque_padre_id: n ? 'n' + (n - 1) : 'i' });
  // Construye el árbol usando la misma función que utiliza la interfaz.
  const arbol = M.crearArbol(bloques);
  // Confirma que la ruta conserva la raíz y todos los descendientes profundos.
  assert.equal(M.ruta(arbol, 'n9999').length, 10001);
  // Comprueba que no se reemplaza el identificador del último descendiente.
  assert.equal(arbol.nodos.get('n9999').id, 'n9999');
  // Comprueba que ningún registro de entrada se perdió durante la construcción.
  assert.equal(arbol.nodos.size, bloques.length);
// Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
});
// Comprueba que estructuras inválidas fallan explícitamente en lugar de ocultar datos.
test('rechaza ciclos, padres inexistentes e IDs duplicados', () => {
  // Simula dos categorías que se referencian circularmente y exige detectar el ciclo.
  assert.throws(() => M.crearArbol([{ id: 'a', bloque_padre_id: 'b' }, { id: 'b', bloque_padre_id: 'a' }]), /ciclo/);
  // Simula una categoría que es su propio padre para cubrir el ciclo más pequeño.
  assert.throws(() => M.crearArbol([{ id: 'a', bloque_padre_id: 'a' }]), /ciclo/);
  // Exige rechazar una referencia a un padre que no está disponible.
  assert.throws(() => M.crearArbol([{ id: 'a', bloque_padre_id: 'otro' }]), /padre/);
  // Exige rechazar IDs duplicados para no sobrescribir categorías en el índice.
  assert.throws(() => M.crearArbol([...raices, raices[0]]), /repetidos/);
// Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
});
// Evita elegir raíces inexistentes o ambiguas por una suposición del programador.
test('no sustituye silenciosamente raíces faltantes o ambiguas', () => {
  // Comprueba que la ausencia de Liquidez produce un error identificable.
  assert.throws(() => M.principal(M.crearArbol([]), 'Liquidez'), /única/);
  // Considera equivalentes mayúsculas y espacios al detectar raíces repetidas.
  assert.throws(() => M.principal(M.crearArbol([...raices, { id: 'x', nombre: 'liquidez ', bloque_padre_id: null }]), 'Liquidez'), /única/);
// Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
});
// Verifica nombres y duplicados según las mismas reglas que usa el formulario.
test('normaliza nombres y previene duplicados locales en el mismo apartado', () => {
  // Confirma que los espacios externos no se guardan como parte del nombre.
  assert.equal(M.validarNombre('  Crypto  '), 'Crypto');
  // Comprueba que un nombre compuesto solo por espacios no se acepta.
  assert.throws(() => M.validarNombre('   '), /nombre/);
  // Comprueba el máximo de 80 caracteres compartido con el campo HTML.
  assert.throws(() => M.validarNombre('a'.repeat(81)), /80/);
  // Evita duplicados locales aunque cambien acentos, espacios o mayúsculas.
  assert.throws(() => M.comprobarDuplicado([{ id: 'a', nombre: 'Préstamos' }], ' prestamos '), /existe/);
  // Permite mantener el propio nombre al editar, excluyendo el mismo ID.
  assert.doesNotThrow(() => M.comprobarDuplicado([{ id: 'a', nombre: 'Hold' }], 'Hold', 'a'));
// Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
});
// Comprueba la recuperación de rutas sin aceptar destinos de otras ramas.
test('recupera navegación solo en una rama válida y tolera IDs eliminados', () => {
  // Añade Crypto ficticio bajo Inversiones para probar pertenencia del destino.
  const arbol = M.crearArbol([...raices, { id: 'c', nombre: 'Crypto', bloque_padre_id: 'i' }]);
  // Conserva una ruta a Crypto cuando la sección principal es correcta.
  assert.equal(M.validarNavegacion({ page: 'inversiones', bloqueId: 'c' }, arbol).bloqueId, 'c');
  // Devuelve a la raíz de Liquidez si la preferencia apunta a otra rama.
  assert.equal(M.validarNavegacion({ page: 'liquidez', bloqueId: 'c' }, arbol).bloqueId, 'l');
  // Devuelve a la raíz de Inversiones si la categoría guardada ya fue eliminada.
  assert.equal(M.validarNavegacion({ page: 'inversiones', bloqueId: 'borrado' }, arbol).bloqueId, 'i');
  // Descarta páginas no admitidas para no restaurar navegación arbitraria.
  assert.equal(M.validarNavegacion({ page: 'desconocida' }, arbol).page, 'patrimonio');
// Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
});
// Fija los cuatro recorridos acordados para detectar cambios funcionales involuntarios.
test('los cuatro recorridos Crypto son diferentes y no obligan a incluir plataforma o red', () => {
  // Obtiene los niveles de cada estrategia real y los convierte a una lista comparable.
  const pasos = nombre => Array.from(Estrategias.find(e => e.nombre === nombre).niveles);
  // Confirma que Hold no obliga a utilizar plataforma.
  assert.deepEqual(pasos('Hold'), ['red', 'crypto']);
  // Confirma que Farmeo DEX no obliga a utilizar red.
  assert.deepEqual(pasos('Farmeo DEX'), ['plataforma', 'trade']);
  // Conserva el orden plataforma, red y par de Pools de Liquidez.
  assert.deepEqual(pasos('Pools de Liquidez'), ['plataforma', 'red', 'par']);
  // Conserva plataforma y red antes del Trade individual de Shorts.
  assert.deepEqual(pasos('Shorts'), ['plataforma', 'red', 'trade']);
// Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
});
