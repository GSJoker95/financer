(function (app) {
  'use strict';

  const normalizar = texto => String(texto).trim().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');

  function validarNombre(valor) {
    const nombre = String(valor ?? '').trim();
    if (!nombre || nombre.length > 80) {
      throw new Error('Escribe un nombre de entre 1 y 80 caracteres.');
    }
    return nombre;
  }

  // Los IDs y relaciones se conservan. No se limita la profundidad ni se
  // confunden categorías, plataformas y productos dentro de un mismo array.
  function crearArbol(bloques) {
    const nodos = new Map();
    for (const bloque of bloques) {
      if (!bloque.id || nodos.has(bloque.id)) {
        throw new Error('Hay categorías con identificadores repetidos o inválidos.');
      }
      nodos.set(bloque.id, { ...bloque, children: [] });
    }
    const raices = [];
    for (const nodo of nodos.values()) {
      if (nodo.bloque_padre_id === null) raices.push(nodo);
      else {
        const padre = nodos.get(nodo.bloque_padre_id);
        if (!padre) throw new Error('Una categoría tiene un padre que no está disponible.');
        padre.children.push(nodo);
      }
    }
    // Recorrido iterativo: incluso un árbol muy profundo evita desbordar la pila.
    const pendientes = [...raices];
    const visitados = new Set();
    while (pendientes.length) {
      const nodo = pendientes.pop();
      if (visitados.has(nodo.id)) throw new Error('Hay un ciclo entre categorías.');
      visitados.add(nodo.id);
      pendientes.push(...nodo.children);
    }
    if (visitados.size !== nodos.size) throw new Error('Hay un ciclo entre categorías.');
    return { nodos, raices };
  }

  function ruta(arbol, id) {
    const resultado = [];
    let nodo = arbol.nodos.get(id);
    while (nodo) {
      resultado.push(nodo);
      nodo = arbol.nodos.get(nodo.bloque_padre_id);
    }
    return resultado.reverse();
  }

  function principal(arbol, nombre) {
    const encontrados = arbol.raices.filter(n => normalizar(n.nombre) === normalizar(nombre));
    if (encontrados.length !== 1) {
      throw new Error('Debe existir una única categoría principal «' + nombre + '».');
    }
    return encontrados[0];
  }

  function comprobarDuplicado(elementos, nombre, excluirId = null) {
    if (elementos.some(e => e.id !== excluirId && normalizar(e.nombre) === normalizar(nombre))) {
      throw new Error('Ya existe un elemento con ese nombre en este apartado.');
    }
  }

  const paginas = ['patrimonio', 'liquidez', 'inversiones', 'bloques',
    'plataformas', 'resultados', 'gastos', 'objetivos'];
  function validarNavegacion(guardado, arbol) {
    const inicio = { page: 'patrimonio', bloqueId: null };
    if (!guardado || !paginas.includes(guardado.page)) return inicio;
    const raiz = guardado.page === 'liquidez' ? principal(arbol, 'Liquidez')
      : guardado.page === 'inversiones' ? principal(arbol, 'Inversiones') : null;
    if (raiz) {
      const id = guardado.bloqueId || raiz.id;
      const camino = ruta(arbol, id);
      return { page: guardado.page, bloqueId: camino[0]?.id === raiz.id ? id : raiz.id };
    }
    if (guardado.page === 'bloques') {
      return arbol.nodos.has(guardado.bloqueId)
        ? { page: 'bloques', bloqueId: guardado.bloqueId } : inicio;
    }
    return { page: guardado.page, bloqueId: null };
  }

  app.Modelo = Object.freeze({ normalizar, validarNombre, crearArbol, ruta,
    principal, comprobarDuplicado, validarNavegacion });
})(globalThis.Financer = globalThis.Financer || {});
