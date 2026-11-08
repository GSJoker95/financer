(function (app) {
  'use strict';
  const { validarNombre } = app.Modelo;
  const columnas = {
    bloques: 'id, nombre, bloque_padre_id',
    plataformas: 'id, nombre'
  };

  // Inyectar el cliente permite probar permisos y fallos sin tocar Supabase real.
  function crearRepositorio(cliente, usuarioId) {
    if (!cliente || !usuarioId) throw new Error('Necesitas una sesión válida.');

    async function leer(tabla) {
      const resultado = [];
      const tamano = 500;
      for (let desde = 0; ; desde += tamano) {
        const { data, error } = await cliente.from(tabla).select(columnas[tabla])
          .eq('usuario_id', usuarioId).order('id').range(desde, desde + tamano - 1);
        if (error) throw error;
        if (!Array.isArray(data)) throw new Error('La respuesta de datos no es válida.');
        resultado.push(...data);
        if (data.length < tamano) return resultado;
      }
    }

    async function guardar(tabla, nombre, id, padreId = null) {
      const campos = { nombre: validarNombre(nombre) };
      let consulta;
      if (id) {
        consulta = cliente.from(tabla).update(campos)
          .eq('id', id).eq('usuario_id', usuarioId);
      } else {
        campos.usuario_id = usuarioId;
        if (tabla === 'bloques') {
          if (!padreId) throw new Error('Selecciona la categoría que contendrá el nuevo elemento.');
          campos.bloque_padre_id = padreId;
        }
        consulta = cliente.from(tabla).insert(campos);
      }
      // No confundir una operación de cero filas (p. ej. RLS) con un éxito.
      const { data, error } = await consulta.select(columnas[tabla]).single();
      if (error) throw error;
      if (!data?.id) throw new Error('No se ha podido confirmar el guardado.');
      return data;
    }

    async function eliminar(tabla, id) {
      const { data, error } = await cliente.from(tabla).delete()
        .eq('id', id).eq('usuario_id', usuarioId).select('id').single();
      if (error) throw error;
      if (data?.id !== id) throw new Error('No se ha podido confirmar la eliminación.');
    }

    return Object.freeze({
      async cargar() {
        const [bloques, plataformas] = await Promise.all([leer('bloques'), leer('plataformas')]);
        return { bloques, plataformas };
      },
      guardarBloque: (nombre, id, padreId) => guardar('bloques', nombre, id, padreId),
      guardarPlataforma: (nombre, id) => guardar('plataformas', nombre, id),
      eliminarBloque: id => eliminar('bloques', id),
      eliminarPlataforma: id => eliminar('plataformas', id)
    });
  }

  function mensajeError(error, alternativa) {
    if (error?.code === '23503') {
      return 'Este elemento tiene categorías, productos o movimientos asociados. No se ha eliminado.';
    }
    if (error?.code === '42501' || error?.code === 'PGRST116') {
      return 'No se ha confirmado el cambio. Puede que el elemento ya no exista o que tu sesión no tenga permiso. Actualiza los datos antes de repetirlo.';
    }
    if (error instanceof Error && !error.code && !/fetch|network|timeout/i.test(error.message)) {
      return error.message;
    }
    return alternativa;
  }
  app.Datos = Object.freeze({ crearRepositorio, mensajeError });
})(globalThis.Financer = globalThis.Financer || {});
