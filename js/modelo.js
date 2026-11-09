// Aísla las reglas de datos para reutilizarlas sin depender del navegador.
(function (app) {
  // Activa modo estricto para detectar errores de programación antes.
  'use strict';

  // Convierte nombres a texto limpio y separa letras de acentos para compararlos.
  const normalizar = texto => String(texto).trim().normalize('NFD')
    // Elimina acentos y normaliza mayúsculas en español para detectar equivalencias.
    .replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');

  // Valida nombres antes de enviarlos al repositorio o mostrarlos como categorías.
  function validarNombre(valor) {
    // Convierte valores ausentes en texto vacío y retira espacios de los extremos.
    const nombre = String(valor ?? '').trim();
    // Exige un nombre visible y limita la longitud al máximo del formulario.
    if (!nombre || nombre.length > 80) {
      // Explica la validación al usuario sin depender de mensajes internos del servidor.
      throw new Error('Escribe un nombre de entre 1 y 80 caracteres.');
    // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
    }
    // Entrega el nombre limpio para guardar la misma versión que se validó.
    return nombre;
  // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
  }

  // Los IDs y relaciones se conservan. No se limita la profundidad ni se
  // confunden categorías, plataformas y productos dentro de un mismo array.
  // Construye el árbol desde las relaciones existentes sin limitar sus niveles.
  function crearArbol(bloques) {
    // Indexa nodos por ID para encontrar padres e hijos sin depender del nombre.
    const nodos = new Map();
    // Procesa cada registro cargado para conservar su identidad real.
    for (const bloque of bloques) {
      // Detecta IDs ausentes o repetidos antes de generar relaciones ambiguas.
      if (!bloque.id || nodos.has(bloque.id)) {
        // Interrumpe la carga cuando no se puede construir una estructura fiable.
        throw new Error('Hay categorías con identificadores repetidos o inválidos.');
      // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
      }
      // Copia el registro y prepara su lista de hijos sin modificar el original.
      nodos.set(bloque.id, { ...bloque, children: [] });
    // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
    }
    // Prepara la lista de categorías que no tienen padre.
    const raices = [];
    // Relaciona cada nodo con su padre después de haber creado todo el índice.
    for (const nodo of nodos.values()) {
      // Reconoce raíces mediante padre nulo, aunque aparezcan después en la entrada.
      if (nodo.bloque_padre_id === null) raices.push(nodo);
      // Trata como descendiente cualquier nodo que sí declara un padre.
      else {
        // Busca el padre por identificador para permitir nombres repetidos en ramas distintas.
        const padre = nodos.get(nodo.bloque_padre_id);
        // No oculta categorías huérfanas ni inventa su ubicación para aparentar una carga válida.
        if (!padre) throw new Error('Una categoría tiene un padre que no está disponible.');
        // Conserva el descendiente dentro de la lista del padre correspondiente.
        padre.children.push(nodo);
      // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
      }
    // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
    }
    // Recorrido iterativo: incluso un árbol muy profundo evita desbordar la pila.
    // Inicia un recorrido desde todas las raíces sin utilizar recursión profunda.
    const pendientes = [...raices];
    // Recuerda los IDs alcanzados para detectar estructuras inconsistentes.
    const visitados = new Set();
    // Avanza mientras queden nodos pendientes de visitar.
    while (pendientes.length) {
      // Extrae un nodo de la pila de trabajo sin crear llamadas recursivas.
      const nodo = pendientes.pop();
      // Impide recorrer dos veces el mismo nodo dentro de una estructura cíclica.
      if (visitados.has(nodo.id)) throw new Error('Hay un ciclo entre categorías.');
      // Marca el nodo como alcanzado desde una raíz válida.
      visitados.add(nodo.id);
      // Añade sus hijos para que tampoco se pierdan niveles profundos.
      pendientes.push(...nodo.children);
    // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
    }
    // Detecta ciclos desconectados de las raíces que nunca pudieron visitarse.
    if (visitados.size !== nodos.size) throw new Error('Hay un ciclo entre categorías.');
    // Devuelve tanto el índice por ID como las raíces para consultas y navegación.
    return { nodos, raices };
  // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
  }

  // Obtiene los antecesores de una categoría para dibujar su ruta superior.
  function ruta(arbol, id) {
    // Acumula el recorrido sin modificar las relaciones del árbol.
    const resultado = [];
    // Empieza en el identificador solicitado; si no existe, la ruta quedará vacía.
    let nodo = arbol.nodos.get(id);
    // Sube hasta una raíz mientras exista un nodo en el índice validado.
    while (nodo) {
      // Conserva cada categoría que forma parte del recorrido.
      resultado.push(nodo);
      // Avanza al padre real del nodo, en lugar de asumir un nivel fijo.
      nodo = arbol.nodos.get(nodo.bloque_padre_id);
    // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
    }
    // Invierte el orden para presentar la raíz antes que el destino.
    return resultado.reverse();
  // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
  }

  // Resuelve raíces funcionales como Liquidez e Inversiones sin ambigüedades.
  function principal(arbol, nombre) {
    // Compara solo raíces y normaliza nombres para tolerar acentos y espacios.
    const encontrados = arbol.raices.filter(n => normalizar(n.nombre) === normalizar(nombre));
    // Exige exactamente una raíz para evitar elegir por intuición entre coincidencias.
    if (encontrados.length !== 1) {
      // Explica qué categoría principal falta o está repetida.
      throw new Error('Debe existir una única categoría principal «' + nombre + '».');
    // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
    }
    // Entrega la única raíz que cumple el nombre funcional solicitado.
    return encontrados[0];
  // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
  }

  // Evita repetir nombres dentro del mismo apartado sin confundir una edición con un alta.
  function comprobarDuplicado(elementos, nombre, excluirId = null) {
    // Excluye el ID que se está editando y compara los demás nombres normalizados.
    if (elementos.some(e => e.id !== excluirId && normalizar(e.nombre) === normalizar(nombre))) {
      // Impide el duplicado local con un mensaje que permite corregirlo.
      throw new Error('Ya existe un elemento con ese nombre en este apartado.');
    // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
    }
  // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
  }

  // Enumera las pantallas admitidas para no restaurar destinos arbitrarios del almacenamiento.
  const paginas = ['patrimonio', 'liquidez', 'inversiones', 'bloques',
    // Completa los destinos permitidos, incluidos los módulos todavía pendientes.
    'plataformas', 'resultados', 'gastos', 'objetivos'];
  // Sanea la ruta guardada antes de utilizar IDs procedentes del navegador.
  function validarNavegacion(guardado, arbol) {
    // Define un destino seguro cuando la preferencia no es utilizable.
    const inicio = { page: 'patrimonio', bloqueId: null };
    // Descarta preferencias ausentes o páginas desconocidas en vez de ejecutarlas.
    if (!guardado || !paginas.includes(guardado.page)) return inicio;
    // Asocia Liquidez a su raíz verificada para comprobar pertenencia de rama.
    const raiz = guardado.page === 'liquidez' ? principal(arbol, 'Liquidez')
      // Hace la misma asociación para Inversiones; otras páginas no fuerzan una raíz.
      : guardado.page === 'inversiones' ? principal(arbol, 'Inversiones') : null;
    // Valida un ID de categoría solo cuando la página pertenece a una raíz principal.
    if (raiz) {
      // Usa la raíz como destino si no se seleccionó ninguna categoría concreta.
      const id = guardado.bloqueId || raiz.id;
      // Obtiene antecesores para comprobar que el destino pertenece a esta sección.
      const camino = ruta(arbol, id);
      // Conserva el destino válido o vuelve a la raíz si corresponde a otra rama.
      return { page: guardado.page, bloqueId: camino[0]?.id === raiz.id ? id : raiz.id };
    // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
    }
    // Gestiona raíces adicionales sin confundirlas con las secciones principales.
    if (guardado.page === 'bloques') {
      // Solo restaura una categoría adicional si su ID sigue existiendo.
      return arbol.nodos.has(guardado.bloqueId)
        // Mantiene el destino encontrado o vuelve al inicio si fue eliminado.
        ? { page: 'bloques', bloqueId: guardado.bloqueId } : inicio;
    // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
    }
    // Retira IDs de categorías de las páginas que no necesitan un bloque.
    return { page: guardado.page, bloqueId: null };
  // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
  }

  // Publica las reglas estables sin exponer las variables privadas del módulo.
  app.Modelo = Object.freeze({ normalizar, validarNombre, crearArbol, ruta,
    // Completa la interfaz de validación y navegación que utilizarán datos e interfaz.
    principal, comprobarDuplicado, validarNavegacion });
// Inicializa el espacio común de Financer si ningún script lo ha creado todavía.
})(globalThis.Financer = globalThis.Financer || {});
