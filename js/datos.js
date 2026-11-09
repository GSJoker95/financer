// Encapsula el repositorio para separar Supabase de la presentación.
(function (app) {
  // Activa reglas estrictas que ayudan a detectar asignaciones erróneas.
  'use strict';
  // Reutiliza la validación de nombres para que interfaz y escritura coincidan.
  const { validarNombre } = app.Modelo;
  // Declara los campos que realmente necesita la interfaz, sin descargar datos financieros.
  const columnas = {
    // Conserva IDs y padre para reconstruir todas las categorías.
    bloques: 'id, nombre, bloque_padre_id',
    // Lee del catálogo solo identidad y nombre de las plataformas compartidas.
    plataformas: 'id, nombre'
  // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
  };

  // Inyectar el cliente permite probar permisos y fallos sin tocar Supabase real.
  // Crea un acceso a datos ligado a cliente e identidad verificados.
  function crearRepositorio(cliente, usuarioId) {
    // Impide consultar o modificar registros sin una cuenta conocida.
    if (!cliente || !usuarioId) throw new Error('Necesitas una sesión válida.');

    // Lee una tabla en páginas para no truncarla al límite de respuesta de Supabase.
    async function leer(tabla) {
      // Acumula filas de todas las páginas antes de entregar una colección completa.
      const resultado = [];
      // Fija páginas de 500 filas para mantenerse bajo el límite habitual del servicio.
      const tamano = 500;
      // Avanza el desplazamiento después de cada página descargada.
      for (let desde = 0; ; desde += tamano) {
        // Solicita únicamente las columnas declaradas de la tabla correspondiente.
        const { data, error } = await cliente.from(tabla).select(columnas[tabla])
          // Filtra por propietario y ordena por ID para paginar con un orden estable.
          .eq('usuario_id', usuarioId).order('id').range(desde, desde + tamano - 1);
        // Propaga el rechazo del servidor en vez de entregar datos incompletos como correctos.
        if (error) throw error;
        // Valida la forma de respuesta para que una carga inválida no parezca una lista vacía.
        if (!Array.isArray(data)) throw new Error('La respuesta de datos no es válida.');
        // Incorpora las filas recibidas sin perder las páginas anteriores.
        resultado.push(...data);
        // Termina cuando una página corta indica que se alcanzó el final de la colección.
        if (data.length < tamano) return resultado;
      // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
      }
    // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
    }

    // Comparte la lógica de alta y edición sin mezclar categorías con plataformas.
    async function guardar(tabla, nombre, id, padreId = null) {
      // Valida y limpia el nombre antes de construir la petición al servidor.
      const campos = { nombre: validarNombre(nombre) };
      // Reserva la consulta que dependerá de si existe un ID previo.
      let consulta;
      // Distingue editar un registro existente de crear uno nuevo.
      if (id) {
        // Actualiza solo los campos editables, sin reasignar propietario o padre.
        consulta = cliente.from(tabla).update(campos)
          // Limita la modificación al ID solicitado y a su propietario.
          .eq('id', id).eq('usuario_id', usuarioId);
      // Prepara la creación de una fila nueva cuando no se facilitó ID.
      } else {
        // Asigna explícitamente la cuenta verificada como propietaria de la nueva fila.
        campos.usuario_id = usuarioId;
        // Añade relaciones de padre solo a las categorías, no al catálogo de plataformas.
        if (tabla === 'bloques') {
          // Impide crear raíces desde este formulario, que solo gestiona subcategorías.
          if (!padreId) throw new Error('Selecciona la categoría que contendrá el nuevo elemento.');
          // Asocia el nuevo bloque a la categoría donde se abrió el editor.
          campos.bloque_padre_id = padreId;
        // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
        }
        // Prepara la inserción de los campos ya validados y con propietario explícito.
        consulta = cliente.from(tabla).insert(campos);
      // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
      }
      // No confundir una operación de cero filas (p. ej. RLS) con un éxito.
      // Exige recibir una única fila para no anunciar como guardada una operación de cero filas.
      const { data, error } = await consulta.select(columnas[tabla]).single();
      // No transforma un rechazo de permisos o validación del servidor en éxito.
      if (error) throw error;
      // Rechaza una respuesta sin identificador porque no confirma qué se guardó.
      if (!data?.id) throw new Error('No se ha podido confirmar el guardado.');
      // Devuelve la fila confirmada para actualizar la interfaz sin una recarga adicional.
      return data;
    // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
    }

    // Centraliza el borrado conservando la autorización y las restricciones de relaciones.
    async function eliminar(tabla, id) {
      // Prepara la eliminación en la tabla solicitada.
      const { data, error } = await cliente.from(tabla).delete()
        // Restringe ID y propietario y exige que se confirme exactamente el registro eliminado.
        .eq('id', id).eq('usuario_id', usuarioId).select('id').single();
      // Propaga restricciones o permisos para que la interfaz mantenga el elemento visible.
      if (error) throw error;
      // Comprueba que la confirmación corresponde al ID que el usuario pidió borrar.
      if (data?.id !== id) throw new Error('No se ha podido confirmar la eliminación.');
    // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
    }

    // Expone un conjunto de métodos que no debe alterarse accidentalmente.
    return Object.freeze({
      // Carga las colecciones necesarias para presentar la estructura de la cuenta.
      async cargar() {
        // Lee categorías y plataformas a la vez porque no dependen entre sí.
        const [bloques, plataformas] = await Promise.all([leer('bloques'), leer('plataformas')]);
        // Entrega ambas colecciones solo si se completaron las dos lecturas.
        return { bloques, plataformas };
      // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
      },
      // Permite guardar subcategorías mediante la operación común validada.
      guardarBloque: (nombre, id, padreId) => guardar('bloques', nombre, id, padreId),
      // Permite guardar plataformas sin añadirlas al árbol de categorías.
      guardarPlataforma: (nombre, id) => guardar('plataformas', nombre, id),
      // Expone el borrado de categorías respetando sus restricciones del servidor.
      eliminarBloque: id => eliminar('bloques', id),
      // Expone el borrado de plataformas sin duplicar lógica de permisos.
      eliminarPlataforma: id => eliminar('plataformas', id)
    // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
    });
  // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
  }

  // Traduce fallos conocidos a mensajes útiles sin exponer detalles de registros.
  function mensajeError(error, alternativa) {
    // Reconoce el error de clave foránea que protege elementos con dependencias.
    if (error?.code === '23503') {
      // Explica el rechazo de borrado sin revelar nombres o datos relacionados.
      return 'Este elemento tiene categorías, productos o movimientos asociados. No se ha eliminado.';
    // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
    }
    // Identifica permisos insuficientes o respuestas sin una fila visible.
    if (error?.code === '42501' || error?.code === 'PGRST116') {
      // No asegura que se guardó: pide actualizar para comprobar existencia y sesión.
      return 'No se ha confirmado el cambio. Puede que el elemento ya no exista o que tu sesión no tenga permiso. Actualiza los datos antes de repetirlo.';
    // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
    }
    // Permite mensajes locales de validación, reservando los fallos de red al texto genérico.
    if (error instanceof Error && !error.code && !/fetch|network|timeout/i.test(error.message)) {
      // Conserva la explicación local ya preparada para el usuario.
      return error.message;
    // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
    }
    // Utiliza el aviso seguro de la operación cuando no se reconoce el fallo.
    return alternativa;
  // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
  }
  // Publica la fábrica del repositorio y el traductor de errores como interfaz estable.
  app.Datos = Object.freeze({ crearRepositorio, mensajeError });
// Comparte el módulo con los demás scripts sin crear un cliente global adicional.
})(globalThis.Financer = globalThis.Financer || {});
