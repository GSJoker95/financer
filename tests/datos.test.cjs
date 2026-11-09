// Activa modo estricto en las pruebas del repositorio para detectar errores accidentales.
'use strict';
// Usa pruebas integradas de Node, sin una librería adicional de ejecución.
const { test } = require('node:test');
// Permite exigir resultados y rechazos concretos mediante comparaciones estrictas.
const assert = require('node:assert/strict');
// Carga validaciones y repositorio reales en un contexto sin conexión al servicio.
const { Datos } = require('./cargar.cjs')('modelo.js', 'datos.js');
// Construye un cliente ficticio que registra consultas para inspeccionar sus filtros.
function clienteFalso(resolver) {
  // Acumula las operaciones simuladas sin escribir registros reales.
  const llamadas = [];
  // Imita from(tabla) para devolver la misma interfaz encadenable que usa el repositorio.
  const cliente = { from(tabla) {
    // Recoge tabla, filtros y operación para verificar propiedad y selección de datos.
    const pasos = { tabla, filtros: [], operacion: 'lectura' };
    // Prepara los métodos que necesita el código de acceso a datos.
    const consulta = {
      // Registra qué columnas se solicitarían sin descargar información real.
      select(columnas) { pasos.columnas = columnas; return consulta; },
      // Registra cada filtro para comprobar ID y propietario por separado.
      eq(campo, valor) { pasos.filtros.push([campo, valor]); return consulta; },
      // Acepta la ordenación para mantener el contrato de consulta del código probado.
      order() { return consulta; },
      // Recoge campos de una creación para comprobar nombre, padre y usuario.
      insert(campos) { pasos.operacion = 'crear'; pasos.campos = campos; return consulta; },
      // Recoge campos de edición para evitar que se reasigne propiedad accidentalmente.
      update(campos) { pasos.operacion = 'editar'; pasos.campos = campos; return consulta; },
      // Marca el borrado simulado para inspeccionar sus restricciones de identificación.
      delete() { pasos.operacion = 'eliminar'; return consulta; },
      // Registra el rango solicitado y responde de forma asíncrona para probar paginación.
      range(desde, hasta) { pasos.rango = [desde, hasta]; llamadas.push(pasos); return Promise.resolve(resolver(pasos)); },
      // Registra que se exige una sola fila y devuelve el caso de éxito o error elegido.
      single() { pasos.single = true; llamadas.push(pasos); return Promise.resolve(resolver(pasos)); }
    // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
    };
    // Permite continuar encadenando métodos como haría el SDK real.
    return consulta;
  // Cierra la fábrica del cliente ficticio manteniendo privadas las consultas parciales.
  } };
  // Entrega cliente y registro de llamadas para comparar intención y resultado.
  return { cliente, llamadas };
// Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
}
// Verifica que lecturas grandes no se truncan y quedan filtradas por usuario.
test('pagina lecturas y filtra ambas tablas por el usuario verificado', async () => {
  // Simula una primera página completa de bloques para forzar una segunda petición.
  const { cliente, llamadas } = clienteFalso(p => ({ data: p.tabla === 'bloques' && p.rango[0] === 0
    // Devuelve 500 filas ficticias y después una página vacía para indicar final de lectura.
    ? Array.from({ length: 500 }, (_, n) => ({ id: String(n) })) : [], error: null }));
  // Carga las dos colecciones con el repositorio que usa la aplicación.
  const datos = await Datos.crearRepositorio(cliente, 'usuario-a').cargar();
  // Comprueba que conserva todas las filas de la primera página.
  assert.equal(datos.bloques.length, 500);
  // Exige dos peticiones de bloques y una de plataformas, sin lecturas innecesarias.
  assert.equal(llamadas.length, 3);
  // Comprueba que todas las lecturas contienen el filtro del propietario verificado.
  assert.ok(llamadas.every(p => p.filtros.some(([c, v]) => c === 'usuario_id' && v === 'usuario-a')));
// Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
});
// Comprueba que los guardados confirman una fila y mantienen su propiedad.
test('escrituras asignan propietario y confirman la fila afectada', async () => {
  // Simula la fila que devolvería el servidor tras confirmar una escritura.
  const { cliente, llamadas } = clienteFalso(() => ({ data: { id: 'nuevo', nombre: 'Hold' }, error: null }));
  // Asocia el repositorio a un propietario ficticio conocido por la prueba.
  const repo = Datos.crearRepositorio(cliente, 'usuario-a');
  // Crea Hold bajo Crypto para comprobar limpieza de nombre y relación padre.
  await repo.guardarBloque(' Hold ', null, 'crypto');
  // Exige enviar el propietario explícito al crear una fila.
  assert.equal(llamadas[0].campos.usuario_id, 'usuario-a');
  // Exige conservar el padre seleccionado por el formulario de categorías.
  assert.equal(llamadas[0].campos.bloque_padre_id, 'crypto');
  // Comprueba que el texto enviado ya está limpio de espacios externos.
  assert.equal(llamadas[0].campos.nombre, 'Hold');
  // Edita una plataforma existente sin añadir relaciones de categoría.
  await repo.guardarPlataforma('Compartida', 'nuevo');
  // Comprueba que una edición filtra simultáneamente por ID y propietario.
  assert.deepEqual(llamadas[1].filtros, [['id', 'nuevo'], ['usuario_id', 'usuario-a']]);
  // Comprueba que cada guardado exige confirmar una fila, no solo ausencia de error.
  assert.ok(llamadas.every(p => p.single));
// Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
});
// Impide considerar éxito una fila invisible o un borrado rechazado por dependencias.
test('una escritura sin fila visible y un borrado rechazado no son éxitos', async () => {
  // Simula una respuesta sin fila para detectar confirmaciones insuficientes.
  const vacio = clienteFalso(() => ({ data: null, error: null }));
  // Exige rechazar el supuesto guardado cuando el servidor no confirma un registro.
  await assert.rejects(Datos.crearRepositorio(vacio.cliente, 'a').guardarPlataforma('X'), /confirmar/);
  // Simula el código de restricción de clave foránea de PostgreSQL.
  const restringido = clienteFalso(() => ({ data: null, error: { code: '23503' } }));
  // Exige mantener el rechazo de borrado para que la interfaz no retire el elemento.
  await assert.rejects(Datos.crearRepositorio(restringido.cliente, 'a').eliminarBloque('x'), e => e.code === '23503');
  // Comprueba que incluso el borrado restringido identificaba propietario y registro.
  assert.deepEqual(restringido.llamadas[0].filtros, [['id', 'x'], ['usuario_id', 'a']]);
// Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
});
// Evita repositorios sin sesión y altas raíz desde un formulario de subcategorías.
test('no crea categorías raíz ni usa repositorios sin sesión', async () => {
  // Comprueba que falta de identidad produce una validación previa al acceso a datos.
  assert.throws(() => Datos.crearRepositorio({}, ''), /sesión/);
  // Prepara un cliente cuyo registro permite demostrar que no recibió escrituras.
  const { cliente, llamadas } = clienteFalso(() => ({ data: null }));
  // Exige rechazar una categoría nueva sin padre antes de enviar la consulta.
  await assert.rejects(Datos.crearRepositorio(cliente, 'a').guardarBloque('Raíz'), /categoría/);
  // Confirma que el caso inválido no alcanzó ningún método de escritura simulada.
  assert.equal(llamadas.length, 0);
// Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
});
// Verifica que el usuario recibe mensajes útiles sin detalles privados del servidor.
test('errores de API se convierten en mensajes sin detalles financieros', () => {
  // Traduce una dependencia a una explicación comprensible de elemento asociado.
  assert.match(Datos.mensajeError({ code: '23503', details: 'privado' }, 'Fallo'), /asociados/);
  // Traduce cero filas a falta de confirmación en vez de un éxito falso.
  assert.match(Datos.mensajeError({ code: 'PGRST116' }, 'Fallo'), /No se ha confirmado/);
  // Evita mostrar mensajes desconocidos del servidor y utiliza el aviso seguro de la operación.
  assert.equal(Datos.mensajeError({ message: 'privado' }, 'Fallo'), 'Fallo');
// Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
});
