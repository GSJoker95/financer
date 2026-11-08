(function (app) {
  'use strict';
  const M = app.Modelo;
  const $ = id => document.getElementById(id);
  let datos = null;
  let arbol = null;
  let repositorio = null;
  let usuarioId = null;
  let navegacion = { page: 'patrimonio', bloqueId: null };
  let edicion = null;
  let ocupado = false;
  let generacion = 0;

  function elemento(tag, clase, texto) {
    const nodo = document.createElement(tag);
    if (clase) nodo.className = clase;
    if (texto !== undefined) nodo.textContent = texto;
    return nodo;
  }
  function boton(texto, clase, accion) {
    const nodo = elemento('button', clase, texto);
    nodo.type = 'button';
    nodo.addEventListener('click', accion);
    return nodo;
  }
  function aviso(texto) { return elemento('p', 'notice', texto); }
  function claveNavegacion() { return 'financer_navegacion:' + usuarioId; }
  function guardarNavegacion() {
    try { sessionStorage.setItem(claveNavegacion(), JSON.stringify(navegacion)); } catch { /* opcional */ }
  }
  function navegar(page, bloqueId = null) {
    if (ocupado || !arbol) return;
    navegacion = M.validarNavegacion({ page, bloqueId }, arbol);
    guardarNavegacion();
    $('dataStatus').textContent = '';
    render();
    $('nav').classList.remove('open');
    $('mobileToggle').setAttribute('aria-expanded', 'false');
    $('heading').focus();
  }
  function abrirBloque(id) {
    const raiz = M.ruta(arbol, id)[0];
    const page = raiz.id === M.principal(arbol, 'Liquidez').id ? 'liquidez'
      : raiz.id === M.principal(arbol, 'Inversiones').id ? 'inversiones' : 'bloques';
    navegar(page, id);
  }
  function cambiarOcupado(valor) {
    ocupado = valor;
    document.querySelectorAll('.app button, #editor button, #editor input').forEach(b => { b.disabled = valor; });
    $('editorForm').setAttribute('aria-busy', String(valor));
  }
  function reconstruir() {
    arbol = M.crearArbol(datos.bloques);
    M.principal(arbol, 'Liquidez');
    M.principal(arbol, 'Inversiones');
    navegacion = M.validarNavegacion(navegacion, arbol);
  }
  function lista(area, entradas, tipo, abrir) {
    if (!entradas.length) {
      area.append(elemento('p', 'muted', 'Todavía no hay elementos en este apartado.'));
      return;
    }
    for (const entrada of [...entradas].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))) {
      const fila = elemento('div', 'item');
      if (abrir) fila.append(boton(entrada.nombre + ' ›', 'item-name', () => abrir(entrada.id)));
      else fila.append(elemento('span', 'item-label', entrada.nombre));
      const acciones = elemento('div', 'actions');
      const editar = boton('Editar', 'secondary', () => abrirEditor(tipo, entrada));
      editar.setAttribute('aria-label', 'Editar ' + entrada.nombre);
      const eliminar = boton('Eliminar', 'danger', () => borrar(tipo, entrada));
      eliminar.setAttribute('aria-label', 'Eliminar ' + entrada.nombre);
      acciones.append(editar, eliminar);
      fila.append(acciones);
      area.append(fila);
    }
  }
  function render() {
    const area = $('content');
    area.replaceChildren();
    $('breadcrumb').replaceChildren();
    $('addButton').hidden = true;
    const titulos = { patrimonio: 'Patrimonio total', liquidez: 'Liquidez', inversiones: 'Inversiones',
      bloques: 'Categorías', plataformas: 'Plataformas', resultados: 'Resultados', gastos: 'Gastos', objetivos: 'Objetivos' };
    $('heading').textContent = titulos[navegacion.page];
    $('subtitle').textContent = 'Organiza tus categorías y plataformas';
    document.querySelectorAll('#nav [data-page]').forEach(b => {
      const activo = b.dataset.page === navegacion.page;
      b.classList.toggle('active', activo);
      if (activo) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
    });
    const nav = $('investmentNav');
    nav.replaceChildren();
    const inversiones = M.principal(arbol, 'Inversiones');
    for (const categoria of inversiones.children) {
      const b = boton('• ' + categoria.nombre, '', () => abrirBloque(categoria.id));
      const activo = M.ruta(arbol, navegacion.bloqueId).some(n => n.id === categoria.id);
      b.classList.toggle('active', activo);
      if (activo) b.setAttribute('aria-current', 'location');
      nav.append(b);
    }
    if (navegacion.page === 'patrimonio') {
      area.append(aviso('Organiza aquí tu patrimonio. Los saldos, valoraciones y resultados se incorporarán en los siguientes pasos.'));
      const grid = elemento('div', 'tiles');
      for (const raiz of arbol.raices) {
        const b = boton(raiz.nombre, 'tile', () => abrirBloque(raiz.id));
        b.append(elemento('span', '', 'Consultar y organizar categorías'));
        grid.append(b);
      }
      area.append(grid);
    } else if (navegacion.bloqueId) {
      const nodo = arbol.nodos.get(navegacion.bloqueId);
      $('heading').textContent = nodo.nombre;
      for (const [indice, parte] of M.ruta(arbol, nodo.id).entries()) {
        if (indice) $('breadcrumb').append(' / ');
        if (parte.id === nodo.id) $('breadcrumb').append(elemento('span', '', parte.nombre));
        else $('breadcrumb').append(boton(parte.nombre, '', () => abrirBloque(parte.id)));
      }
      area.append(elemento('h3', 'section-heading', 'Subcategorías'));
      $('addButton').hidden = false;
      $('addButton').textContent = '+ Añadir subcategoría';
      $('addButton').onclick = () => abrirEditor('bloques');
      lista(area, nodo.children, 'bloques', abrirBloque);
      const camino = M.ruta(arbol, nodo.id);
      const indiceCrypto = camino.findIndex(n => M.normalizar(n.nombre) === 'crypto');
      if (indiceCrypto >= 0) {
        const estrategia = app.Estrategias.find(e => M.normalizar(e.nombre) === M.normalizar(camino[indiceCrypto + 1]?.nombre || ''));
        if (estrategia) {
          const etiquetas = { plataforma: 'Plataforma', red: 'Red', par: 'Par', crypto: 'Crypto', trade: 'Trade' };
          area.append(aviso('Recorrido previsto: ' + estrategia.niveles.map(n => etiquetas[n]).join(' → ') +
            '. Los formularios de posiciones se incorporarán en el siguiente paso.'));
        } else if (indiceCrypto === camino.length - 1) {
          area.append(aviso('Puedes organizar aquí Pools de Liquidez, Hold, Farmeo DEX, Shorts y futuras estrategias. Las plataformas se registran una sola vez en «Plataformas».'));
        }
      }
    } else if (navegacion.page === 'plataformas') {
      area.append(aviso('Registra cada plataforma una sola vez. Podrá utilizarse en distintas categorías y estrategias cuando incorporemos sus posiciones.'));
      $('addButton').hidden = false;
      $('addButton').textContent = '+ Añadir plataforma';
      $('addButton').onclick = () => abrirEditor('plataformas');
      lista(area, datos.plataformas, 'plataformas');
    } else {
      area.append(aviso('Este apartado está pendiente de desarrollo. Primero prepararemos el registro de tus posiciones activas.'));
    }
  }
  function abrirEditor(tipo, entrada = null) {
    if (ocupado) return;
    edicion = { tipo, id: entrada?.id || null, padreId: navegacion.bloqueId };
    $('dialogTitle').textContent = (entrada ? 'Editar ' : 'Añadir ') + (tipo === 'bloques' ? 'subcategoría' : 'plataforma');
    $('itemName').value = entrada?.nombre || '';
    $('editorError').textContent = '';
    $('editor').showModal();
    $('itemName').focus();
  }
  async function guardar(evento) {
    evento.preventDefault();
    if (ocupado || !edicion) return;
    const operacion = { ...edicion };
    const turno = generacion;
    const repo = repositorio;
    $('editorError').textContent = '';
    try {
      const nombre = M.validarNombre($('itemName').value);
      const elementos = operacion.tipo === 'bloques'
        ? arbol.nodos.get(operacion.padreId).children : datos.plataformas;
      M.comprobarDuplicado(elementos, nombre, operacion.id);
      cambiarOcupado(true);
      const guardado = operacion.tipo === 'bloques'
        ? await repo.guardarBloque(nombre, operacion.id, operacion.padreId)
        : await repo.guardarPlataforma(nombre, operacion.id);
      if (turno !== generacion) return;
      // El servidor devuelve la fila guardada: no hay una segunda petición cuya
      // caída pudiera hacer creer que un guardado confirmado había fallado.
      datos[operacion.tipo] = datos[operacion.tipo].filter(e => e.id !== guardado.id).concat(guardado);
      reconstruir();
      $('editor').close();
      edicion = null;
      render();
      $('dataStatus').textContent = 'Guardado correctamente.';
    } catch (error) {
      if (turno === generacion) $('editorError').textContent = app.Datos.mensajeError(error,
        'No se ha podido confirmar el guardado. Comprueba tu conexión y actualiza los datos antes de repetirlo.');
    } finally {
      if (turno === generacion) cambiarOcupado(false);
    }
  }
  async function borrar(tipo, entrada) {
    if (ocupado) return;
    if (tipo === 'bloques' && arbol.nodos.get(entrada.id).children.length) {
      $('dataStatus').textContent = 'Esta categoría contiene subcategorías. No se ha eliminado.';
      return;
    }
    if (!window.confirm('¿Eliminar «' + entrada.nombre + '»? Esta acción no se puede deshacer.')) return;
    const turno = generacion;
    try {
      cambiarOcupado(true);
      if (tipo === 'bloques') await repositorio.eliminarBloque(entrada.id);
      else await repositorio.eliminarPlataforma(entrada.id);
      if (turno !== generacion) return;
      datos[tipo] = datos[tipo].filter(e => e.id !== entrada.id);
      reconstruir();
      render();
      $('dataStatus').textContent = 'Eliminado correctamente.';
    } catch (error) {
      if (turno === generacion) $('dataStatus').textContent = app.Datos.mensajeError(error,
        'No se ha podido confirmar la eliminación. Actualiza los datos antes de repetirla.');
    } finally {
      if (turno === generacion) cambiarOcupado(false);
    }
  }
  function limpiar(borrarNavegacion = false) {
    generacion++;
    if (borrarNavegacion && usuarioId) {
      try { sessionStorage.removeItem(claveNavegacion()); } catch { /* opcional */ }
    }
    datos = null;
    arbol = null;
    repositorio = null;
    usuarioId = null;
    navegacion = { page: 'patrimonio', bloqueId: null };
    edicion = null;
    if ($('editor').open) $('editor').close();
    $('itemName').value = '';
    $('editorError').textContent = '';
    $('content').replaceChildren();
    $('investmentNav').replaceChildren();
    $('breadcrumb').replaceChildren();
    $('dataStatus').textContent = '';
    $('addButton').hidden = true;
    cambiarOcupado(false);
  }
  function iniciar(nuevosDatos, repo, id) {
    limpiar();
    datos = nuevosDatos;
    repositorio = repo;
    usuarioId = id;
    reconstruir();
    let guardado = null;
    try { guardado = JSON.parse(sessionStorage.getItem(claveNavegacion())); } catch { /* opcional */ }
    navegacion = M.validarNavegacion(guardado, arbol);
    render();
  }
  $('editorForm').addEventListener('submit', guardar);
  $('cancel').addEventListener('click', () => { if (!ocupado) $('editor').close(); });
  $('editor').addEventListener('cancel', e => { if (ocupado) e.preventDefault(); });
  $('editor').addEventListener('close', () => { edicion = null; $('itemName').value = ''; });
  $('nav').addEventListener('click', e => {
    const b = e.target.closest('[data-page]');
    if (b) navegar(b.dataset.page);
  });
  $('mobileToggle').addEventListener('click', () => {
    const abierto = $('nav').classList.toggle('open');
    $('mobileToggle').setAttribute('aria-expanded', String(abierto));
  });
  app.Interfaz = Object.freeze({ iniciar, limpiar });
})(globalThis.Financer = globalThis.Financer || {});
