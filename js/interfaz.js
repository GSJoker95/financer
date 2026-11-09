// Encapsula la interfaz para que su estado no colisione con otros scripts.
(function (app) {
  // Activa reglas estrictas para detectar asignaciones accidentales.
  'use strict';
  // Reutiliza las validaciones del modelo en vez de duplicarlas en pantalla.
  const M = app.Modelo;
  // Centraliza la búsqueda de controles por su identificador HTML.
  const $ = id => document.getElementById(id);
  // Reserva la copia de datos de la cuenta que se mostrará en pantalla.
  let datos = null;
  // Reserva el árbol de categorías para resolver hijos y rutas por ID.
  let arbol = null;
  // Reserva el acceso a datos autenticado, separado de la presentación.
  let repositorio = null;
  // Reserva el usuario para aislar su preferencia de navegación.
  let usuarioId = null;
  // Empieza en Patrimonio total sin una categoría seleccionada.
  let navegacion = { page: 'patrimonio', bloqueId: null };
  // No hay operación de edición hasta que se abra el formulario.
  let edicion = null;
  // Permite acciones inicialmente; durante una escritura se bloquearán.
  let ocupado = false;
  // Numera las sesiones de interfaz para descartar respuestas antiguas.
  let generacion = 0;

  // Agrupa la creación de nodos para compartir estilos y texto seguro.
  function elemento(tag, clase, texto) {
    // Crea la etiqueta solicitada sin interpretar contenido introducido como HTML.
    const nodo = document.createElement(tag);
    // Aplica la clase opcional para reutilizar las reglas de estilo.
    if (clase) nodo.className = clase;
    // Escribe texto literal para impedir que un nombre ejecute etiquetas o scripts.
    if (texto !== undefined) nodo.textContent = texto;
    // Devuelve el nodo preparado para insertarlo donde corresponda.
    return nodo;
  // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
  }
  // Construye botones con una acción explícita y un estilo reutilizable.
  function boton(texto, clase, accion) {
    // Utiliza el creador común para que la etiqueta se trate como texto.
    const nodo = elemento('button', clase, texto);
    // Evita que un botón de navegación envíe un formulario por defecto.
    nodo.type = 'button';
    // Vincula el clic a su acción sin introducir código en atributos HTML.
    nodo.addEventListener('click', accion);
    // Entrega el botón listo al componente que lo necesita.
    return nodo;
  // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
  }
  // Presenta avisos con el mismo estilo para mantener mensajes coherentes.
  function aviso(texto) { return elemento('p', 'notice', texto); }
  // Separa la navegación guardada por usuario para no mezclar cuentas.
  function claveNavegacion() { return 'financer_navegacion:' + usuarioId; }
  // Conserva la ruta de esta pestaña para recuperarla después de recargar.
  function guardarNavegacion() {
    // Serializa la ruta; si el navegador bloquea el almacenamiento, permite seguir navegando.
    try { sessionStorage.setItem(claveNavegacion(), JSON.stringify(navegacion)); } catch { /* opcional */ }
  // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
  }
  // Centraliza los cambios de pantalla para validar y guardar siempre la ruta.
  function navegar(page, bloqueId = null) {
    // Evita navegar durante una escritura o antes de tener categorías cargadas.
    if (ocupado || !arbol) return;
    // Corrige rutas inexistentes con el modelo antes de utilizarlas.
    navegacion = M.validarNavegacion({ page, bloqueId }, arbol);
    // Guarda la nueva ubicación para que la recarga vuelva al mismo apartado.
    guardarNavegacion();
    // Retira el mensaje anterior porque puede pertenecer a otra pantalla.
    $('dataStatus').textContent = '';
    // Reconstruye el contenido que corresponde a la ubicación validada.
    render();
    // Pliega el menú móvil después de elegir un destino.
    $('nav').classList.remove('open');
    // Comunica también a lectores de pantalla que el menú quedó cerrado.
    $('mobileToggle').setAttribute('aria-expanded', 'false');
    // Lleva el foco al título para orientar al usuario tras cambiar de vista.
    $('heading').focus();
  // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
  }
  // Abre una categoría sin asumir que todas las ramas tienen igual profundidad.
  function abrirBloque(id) {
    // Encuentra su raíz para seleccionar la sección principal correcta.
    const raiz = M.ruta(arbol, id)[0];
    // Asocia las categorías descendientes de Liquidez con su menú principal.
    const page = raiz.id === M.principal(arbol, 'Liquidez').id ? 'liquidez'
      // Distingue Inversiones y otras raíces sin convertir plataformas en categorías.
      : raiz.id === M.principal(arbol, 'Inversiones').id ? 'inversiones' : 'bloques';
    // Navega conservando el ID real de la categoría seleccionada.
    navegar(page, id);
  // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
  }
  // Sincroniza el bloqueo visual y lógico de las operaciones en curso.
  function cambiarOcupado(valor) {
    // Actualiza el indicador que consultan las acciones antes de ejecutarse.
    ocupado = valor;
    // Desactiva botones y campos para impedir envíos repetidos o cambios simultáneos.
    document.querySelectorAll('.app button, #editor button, #editor input').forEach(b => { b.disabled = valor; });
    // Informa a las ayudas de accesibilidad de que el formulario está ocupado.
    $('editorForm').setAttribute('aria-busy', String(valor));
  // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
  }
  // Recalcula las relaciones después de recibir datos o confirmar una escritura.
  function reconstruir() {
    // Construye todos los niveles y detecta referencias inválidas con el modelo.
    arbol = M.crearArbol(datos.bloques);
    // Comprueba que Liquidez es una raíz única antes de presentar su menú.
    M.principal(arbol, 'Liquidez');
    // Comprueba la raíz de Inversiones para evitar rutas ambiguas.
    M.principal(arbol, 'Inversiones');
    // Ajusta la ruta si la categoría seleccionada ya no existe.
    navegacion = M.validarNavegacion(navegacion, arbol);
  // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
  }
  // Dibuja una colección de categorías o plataformas con acciones comunes.
  function lista(area, entradas, tipo, abrir) {
    // Distingue una lista vacía de un fallo de carga.
    if (!entradas.length) {
      // Explica que no hay registros en lugar de mostrar una pantalla vacía.
      area.append(elemento('p', 'muted', 'Todavía no hay elementos en este apartado.'));
      // Termina esta lista porque no hay elementos que recorrer.
      return;
    // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
    }
    // Ordena una copia alfabéticamente en español sin alterar los datos cargados.
    for (const entrada of [...entradas].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))) {
      // Agrupa el nombre y sus acciones en una fila visual.
      const fila = elemento('div', 'item');
      // Permite abrir categorías cuando la colección tiene navegación asociada.
      if (abrir) fila.append(boton(entrada.nombre + ' ›', 'item-name', () => abrir(entrada.id)));
      // Muestra plataformas como texto porque su ficha de posiciones aún no existe.
      else fila.append(elemento('span', 'item-label', entrada.nombre));
      // Agrupa las acciones para distribuirlas también en pantallas pequeñas.
      const acciones = elemento('div', 'actions');
      // Abre la edición con el tipo y registro concretos de esta fila.
      const editar = boton('Editar', 'secondary', () => abrirEditor(tipo, entrada));
      // Incluye el nombre en la etiqueta accesible para distinguir botones iguales.
      editar.setAttribute('aria-label', 'Editar ' + entrada.nombre);
      // Conecta Eliminar con el borrado real, que pedirá confirmación.
      const eliminar = boton('Eliminar', 'danger', () => borrar(tipo, entrada));
      // Identifica para accesibilidad qué elemento eliminaría este botón.
      eliminar.setAttribute('aria-label', 'Eliminar ' + entrada.nombre);
      // Añade ambos botones al grupo de acciones de esta fila.
      acciones.append(editar, eliminar);
      // Une las acciones al nombre del elemento sin duplicar la colección.
      fila.append(acciones);
      // Inserta la fila completa en el apartado correspondiente.
      area.append(fila);
    // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
    }
  // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
  }
  // Reconstruye la pantalla a partir del estado actual, sin escribir en Supabase.
  function render() {
    // Localiza la zona donde debe aparecer el contenido de la sección.
    const area = $('content');
    // Retira los nodos anteriores para no duplicar registros al redibujar.
    area.replaceChildren();
    // Limpia la ruta superior antes de construir la nueva.
    $('breadcrumb').replaceChildren();
    // Oculta Añadir hasta confirmar que la pantalla admite creación.
    $('addButton').hidden = true;
    // Relaciona páginas principales con sus títulos visibles.
    const titulos = { patrimonio: 'Patrimonio total', liquidez: 'Liquidez', inversiones: 'Inversiones',
      // Completa los títulos de categorías, plataformas y apartados pendientes.
      bloques: 'Categorías', plataformas: 'Plataformas', resultados: 'Resultados', gastos: 'Gastos', objetivos: 'Objetivos' };
    // Muestra el título de la página seleccionada usando texto literal.
    $('heading').textContent = titulos[navegacion.page];
    // Describe el alcance actual sin anunciar formularios financieros no implementados.
    $('subtitle').textContent = 'Organiza tus categorías y plataformas';
    // Revisa los botones principales para actualizar la sección resaltada.
    document.querySelectorAll('#nav [data-page]').forEach(b => {
      // Determina si este botón corresponde a la página actual.
      const activo = b.dataset.page === navegacion.page;
      // Activa o retira el estilo seleccionado sin acumular clases antiguas.
      b.classList.toggle('active', activo);
      // Señala la página actual a los lectores de pantalla.
      if (activo) b.setAttribute('aria-current', 'page');
      // Retira la marca accesible de botones que ya no están seleccionados.
      else b.removeAttribute('aria-current');
    // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
    });
    // Localiza el submenú de tipos de inversión.
    const nav = $('investmentNav');
    // Retira sus entradas antiguas para reflejar nombres y categorías actuales.
    nav.replaceChildren();
    // Obtiene la raíz real de Inversiones, sin fabricar registros.
    const inversiones = M.principal(arbol, 'Inversiones');
    // Genera accesos a sus hijos inmediatos; los demás niveles se recorren dentro.
    for (const categoria of inversiones.children) {
      // Abre cada tipo por ID para conservar su relación aunque cambie el nombre.
      const b = boton('• ' + categoria.nombre, '', () => abrirBloque(categoria.id));
      // Comprueba toda la ruta para resaltar también un tipo con descendientes abiertos.
      const activo = M.ruta(arbol, navegacion.bloqueId).some(n => n.id === categoria.id);
      // Refleja visualmente si esta categoría forma parte de la ruta actual.
      b.classList.toggle('active', activo);
      // Indica la ubicación dentro de la rama mediante una marca accesible.
      if (activo) b.setAttribute('aria-current', 'location');
      // Incorpora el acceso al submenú sin modificar las categorías.
      nav.append(b);
    // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
    }
    // Selecciona la vista de entrada cuando se consulta Patrimonio total.
    if (navegacion.page === 'patrimonio') {
      // Aclara que los saldos y resultados aún están pendientes para evitar cifras ficticias.
      area.append(aviso('Organiza aquí tu patrimonio. Los saldos, valoraciones y resultados se incorporarán en los siguientes pasos.'));
      // Prepara una cuadrícula adaptable para las categorías raíz existentes.
      const grid = elemento('div', 'tiles');
      // Recorre las raíces disponibles sin fijar su número en la interfaz.
      for (const raiz of arbol.raices) {
        // Crea un acceso que abre la raíz por su identificador.
        const b = boton(raiz.nombre, 'tile', () => abrirBloque(raiz.id));
        // Explica la finalidad del acceso para orientar al usuario.
        b.append(elemento('span', '', 'Consultar y organizar categorías'));
        // Añade la tarjeta al grupo de accesos de patrimonio.
        grid.append(b);
      // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
      }
      // Muestra la cuadrícula completa en la vista de entrada.
      area.append(grid);
    // Selecciona la vista de categoría cuando la ruta contiene un ID de bloque.
    } else if (navegacion.bloqueId) {
      // Recupera el nodo validado para mostrar sus hijos reales.
      const nodo = arbol.nodos.get(navegacion.bloqueId);
      // Sustituye el título genérico por el nombre de la categoría abierta.
      $('heading').textContent = nodo.nombre;
      // Recorre todos los antecesores para construir una ruta de cualquier profundidad.
      for (const [indice, parte] of M.ruta(arbol, nodo.id).entries()) {
        // Separa visualmente niveles solo a partir del segundo.
        if (indice) $('breadcrumb').append(' / ');
        // Muestra el destino actual como texto porque ya está abierto.
        if (parte.id === nodo.id) $('breadcrumb').append(elemento('span', '', parte.nombre));
        // Permite volver a cualquier antecesor sin reconstruir manualmente su dirección.
        else $('breadcrumb').append(boton(parte.nombre, '', () => abrirBloque(parte.id)));
      // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
      }
      // Identifica la lista que contiene las subcategorías directas.
      area.append(elemento('h3', 'section-heading', 'Subcategorías'));
      // Habilita la creación porque existe una categoría padre válida.
      $('addButton').hidden = false;
      // Explica que Añadir creará un hijo, no una plataforma o producto.
      $('addButton').textContent = '+ Añadir subcategoría';
      // Prepara el editor para guardar en la tabla de categorías.
      $('addButton').onclick = () => abrirEditor('bloques');
      // Presenta los hijos directos con navegación hacia niveles posteriores.
      lista(area, nodo.children, 'bloques', abrirBloque);
      // Obtiene la ruta para reconocer estrategias Crypto sin imponerla a otras ramas.
      const camino = M.ruta(arbol, nodo.id);
      // Busca el antecesor Crypto con comparación normalizada del nombre.
      const indiceCrypto = camino.findIndex(n => M.normalizar(n.nombre) === 'crypto');
      // Limita los avisos de estrategias a las categorías dentro de Crypto.
      if (indiceCrypto >= 0) {
        // Busca la estrategia inmediata bajo Crypto, si corresponde a un recorrido acordado.
        const estrategia = app.Estrategias.find(e => M.normalizar(e.nombre) === M.normalizar(camino[indiceCrypto + 1]?.nombre || ''));
        // Muestra el recorrido específico solo cuando la estrategia está descrita.
        if (estrategia) {
          // Traduce los identificadores técnicos de niveles a etiquetas comprensibles.
          const etiquetas = { plataforma: 'Plataforma', red: 'Red', par: 'Par', crypto: 'Crypto', trade: 'Trade' };
          // Compone el recorrido variable para explicar la estructura prevista.
          area.append(aviso('Recorrido previsto: ' + estrategia.niveles.map(n => etiquetas[n]).join(' → ') +
            // Aclara que ese recorrido todavía no equivale a formularios de posiciones.
            '. Los formularios de posiciones se incorporarán en el siguiente paso.'));
        // Distingue la raíz Crypto de una estrategia ya seleccionada.
        } else if (indiceCrypto === camino.length - 1) {
          // Recuerda las estrategias previstas y la gestión compartida de plataformas.
          area.append(aviso('Puedes organizar aquí Pools de Liquidez, Hold, Farmeo DEX, Shorts y futuras estrategias. Las plataformas se registran una sola vez en «Plataformas».'));
        // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
        }
      // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
      }
    // Selecciona la pantalla común del catálogo de plataformas.
    } else if (navegacion.page === 'plataformas') {
      // Explica su reutilización entre categorías sin prometer asociaciones ya implementadas.
      area.append(aviso('Registra cada plataforma una sola vez. Podrá utilizarse en distintas categorías y estrategias cuando incorporemos sus posiciones.'));
      // Permite añadir entradas al catálogo global del usuario.
      $('addButton').hidden = false;
      // Identifica claramente que la creación será de una plataforma.
      $('addButton').textContent = '+ Añadir plataforma';
      // Configura el editor para utilizar el repositorio de plataformas.
      $('addButton').onclick = () => abrirEditor('plataformas');
      // Muestra las plataformas sin confundirlas con ramas navegables.
      lista(area, datos.plataformas, 'plataformas');
    // Reserva las demás páginas para módulos cuyo desarrollo está pendiente.
    } else {
      // Informa del alcance pendiente para no aparentar funcionalidades terminadas.
      area.append(aviso('Este apartado está pendiente de desarrollo. Primero prepararemos el registro de tus posiciones activas.'));
    // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
    }
  // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
  }
  // Prepara la creación o edición en un único formulario reutilizable.
  function abrirEditor(tipo, entrada = null) {
    // Impide abrir otra edición mientras se confirma una operación anterior.
    if (ocupado) return;
    // Copia tipo, ID y padre para saber qué registro debe guardarse.
    edicion = { tipo, id: entrada?.id || null, padreId: navegacion.bloqueId };
    // Diferencia crear y editar y nombra el tipo de elemento afectado.
    $('dialogTitle').textContent = (entrada ? 'Editar ' : 'Añadir ') + (tipo === 'bloques' ? 'subcategoría' : 'plataforma');
    // Carga el nombre actual, o un campo vacío si es una creación.
    $('itemName').value = entrada?.nombre || '';
    // Retira errores anteriores para no atribuirlos a una edición nueva.
    $('editorError').textContent = '';
    // Abre un diálogo modal para concentrar la interacción en el formulario.
    $('editor').showModal();
    // Coloca el cursor en el nombre para facilitar teclado y móvil.
    $('itemName').focus();
  // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
  }
  // Procesa el envío del editor esperando la confirmación del servidor.
  async function guardar(evento) {
    // Evita que el navegador recargue la página al enviar el formulario.
    evento.preventDefault();
    // Rechaza envíos repetidos o sin una operación de edición definida.
    if (ocupado || !edicion) return;
    // Fija una copia de la operación para no depender de cambios posteriores del editor.
    const operacion = { ...edicion };
    // Recuerda la generación actual para ignorar respuestas de otra sesión.
    const turno = generacion;
    // Fija el repositorio de esta operación, asociado al usuario actual.
    const repo = repositorio;
    // Limpia el error antes de validar el nuevo intento.
    $('editorError').textContent = '';
    // Agrupa validación y escritura para mostrar errores recuperables.
    try {
      // Normaliza y valida el nombre antes de enviarlo a Supabase.
      const nombre = M.validarNombre($('itemName').value);
      // Elige la colección donde debe comprobarse si el nombre está repetido.
      const elementos = operacion.tipo === 'bloques'
        // Limita duplicados al mismo padre o al catálogo común de plataformas.
        ? arbol.nodos.get(operacion.padreId).children : datos.plataformas;
      // Permite conservar el nombre del registro editado sin marcarlo como duplicado propio.
      M.comprobarDuplicado(elementos, nombre, operacion.id);
      // Bloquea interacciones repetidas mientras el guardado está en curso.
      cambiarOcupado(true);
      // Selecciona el método de guardado según el tipo de elemento.
      const guardado = operacion.tipo === 'bloques'
        // Guarda la categoría conservando su ID y su padre.
        ? await repo.guardarBloque(nombre, operacion.id, operacion.padreId)
        // Guarda una plataforma independiente del árbol de categorías.
        : await repo.guardarPlataforma(nombre, operacion.id);
      // Descarta la respuesta si la cuenta o generación cambió mientras esperaba.
      if (turno !== generacion) return;
      // El servidor devuelve la fila guardada: no hay una segunda petición cuya
      // caída pudiera hacer creer que un guardado confirmado había fallado.
      // Sustituye o añade la fila confirmada, sin otra petición que pueda falsear el éxito.
      datos[operacion.tipo] = datos[operacion.tipo].filter(e => e.id !== guardado.id).concat(guardado);
      // Actualiza el árbol y valida que las relaciones continúan siendo coherentes.
      reconstruir();
      // Cierra el formulario solo después de confirmar el guardado.
      $('editor').close();
      // Retira la referencia de edición para evitar reutilizarla accidentalmente.
      edicion = null;
      // Redibuja nombres y listas con los datos confirmados.
      render();
      // Anuncia el éxito después de completar la actualización local.
      $('dataStatus').textContent = 'Guardado correctamente.';
    // Captura validaciones o fallos del servidor sin cerrar el editor.
    } catch (error) {
      // Presenta errores únicamente si todavía pertenece a la misma sesión.
      if (turno === generacion) $('editorError').textContent = app.Datos.mensajeError(error,
        // Pide comprobar los datos antes de repetir una escritura de resultado incierto.
        'No se ha podido confirmar el guardado. Comprueba tu conexión y actualiza los datos antes de repetirlo.');
    // Garantiza la liberación de controles tanto si hubo éxito como error.
    } finally {
      // No desbloquea controles pertenecientes a una generación de interfaz posterior.
      if (turno === generacion) cambiarOcupado(false);
    // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
    }
  // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
  }
  // Elimina un elemento únicamente tras comprobar dependencias y pedir confirmación.
  async function borrar(tipo, entrada) {
    // Evita iniciar otro borrado mientras una escritura ya está pendiente.
    if (ocupado) return;
    // Detecta categorías con hijos para impedir un borrado que perdería su estructura.
    if (tipo === 'bloques' && arbol.nodos.get(entrada.id).children.length) {
      // Explica por qué no se ha eliminado el padre con subcategorías.
      $('dataStatus').textContent = 'Esta categoría contiene subcategorías. No se ha eliminado.';
      // Abandona el borrado sin enviar ninguna petición al servidor.
      return;
    // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
    }
    // Pide confirmación explícita antes de realizar una acción irreversible.
    if (!window.confirm('¿Eliminar «' + entrada.nombre + '»? Esta acción no se puede deshacer.')) return;
    // Asocia la respuesta futura a la generación de interfaz que inició el borrado.
    const turno = generacion;
    // Controla errores de permiso, relación o conexión de forma recuperable.
    try {
      // Desactiva acciones simultáneas durante el borrado.
      cambiarOcupado(true);
      // Pide eliminar una categoría; las relaciones del servidor siguen protegiéndola.
      if (tipo === 'bloques') await repositorio.eliminarBloque(entrada.id);
      // Utiliza el método de plataformas cuando no se trata de una categoría.
      else await repositorio.eliminarPlataforma(entrada.id);
      // Ignora el resultado visual si la sesión ya cambió.
      if (turno !== generacion) return;
      // Retira de la copia local únicamente el elemento cuyo borrado se confirmó.
      datos[tipo] = datos[tipo].filter(e => e.id !== entrada.id);
      // Reconstruye las relaciones para no mantener referencias de navegación obsoletas.
      reconstruir();
      // Actualiza la lista visible después de la confirmación.
      render();
      // Informa de la eliminación ya confirmada.
      $('dataStatus').textContent = 'Eliminado correctamente.';
    // Conserva los datos visibles cuando no se confirma el borrado.
    } catch (error) {
      // Traduce el fallo en un mensaje de permiso o dependencia comprensible.
      if (turno === generacion) $('dataStatus').textContent = app.Datos.mensajeError(error,
        // Indica que se actualice antes de repetir un borrado incierto.
        'No se ha podido confirmar la eliminación. Actualiza los datos antes de repetirla.');
    // Libera el bloqueo aunque el servidor rechace la operación.
    } finally {
      // Aplica el desbloqueo solo a la interfaz que inició esta petición.
      if (turno === generacion) cambiarOcupado(false);
    // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
    }
  // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
  }
  // Vacía referencias y contenido para no mostrar datos de otra sesión.
  function limpiar(borrarNavegacion = false) {
    // Invalida todas las respuestas asíncronas iniciadas antes de esta limpieza.
    generacion++;
    // Borra la preferencia de ruta solo cuando se pidió una salida completa.
    if (borrarNavegacion && usuarioId) {
      // Intenta borrar la ruta de esa cuenta sin depender de que el almacenamiento funcione.
      try { sessionStorage.removeItem(claveNavegacion()); } catch { /* opcional */ }
    // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
    }
    // Libera la copia de registros privados que ya no debe mostrarse.
    datos = null;
    // Retira el árbol anterior para evitar reutilizar rutas de otra cuenta.
    arbol = null;
    // Desvincula las escrituras del repositorio de la sesión anterior.
    repositorio = null;
    // Retira el identificador usado para guardar navegación de esa cuenta.
    usuarioId = null;
    // Devuelve la navegación al inicio neutro de Patrimonio total.
    navegacion = { page: 'patrimonio', bloqueId: null };
    // Descarta cualquier operación de edición anterior.
    edicion = null;
    // Cierra un diálogo abierto para no dejar visibles nombres de otra sesión.
    if ($('editor').open) $('editor').close();
    // Limpia también el campo del editor, que está fuera del contenedor principal.
    $('itemName').value = '';
    // Retira los mensajes de validación del formulario anterior.
    $('editorError').textContent = '';
    // Elimina los registros que estaban dibujados en la zona de contenido.
    $('content').replaceChildren();
    // Retira los tipos de inversión que podrían pertenecer a otra cuenta.
    $('investmentNav').replaceChildren();
    // Vacía el camino de categorías de la sesión anterior.
    $('breadcrumb').replaceChildren();
    // Elimina avisos de operaciones que ya no corresponden a la sesión actual.
    $('dataStatus').textContent = '';
    // Oculta Añadir hasta disponer de una nueva colección válida.
    $('addButton').hidden = true;
    // Devuelve los controles a su estado normal tras vaciar el contenido.
    cambiarOcupado(false);
  // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
  }
  // Inicializa una interfaz verificada con los datos de una cuenta concreta.
  function iniciar(nuevosDatos, repo, id) {
    // Parte de una interfaz limpia para no mezclar información entre cargas.
    limpiar();
    // Asigna la instantánea recibida del repositorio autenticado.
    datos = nuevosDatos;
    // Conserva el repositorio que confirmará las siguientes escrituras.
    repositorio = repo;
    // Fija el propietario de la ruta de navegación de esta interfaz.
    usuarioId = id;
    // Valida y construye el árbol antes de pintar sus controles.
    reconstruir();
    // Parte de navegación vacía si no puede recuperarse ninguna preferencia.
    let guardado = null;
    // Lee la ruta guardada por usuario; JSON inválido o almacenamiento bloqueado son opcionales.
    try { guardado = JSON.parse(sessionStorage.getItem(claveNavegacion())); } catch { /* opcional */ }
    // Comprueba que la ruta recuperada siga existiendo y pertenezca a la rama correcta.
    navegacion = M.validarNavegacion(guardado, arbol);
    // Dibuja la primera pantalla con la ruta ya validada.
    render();
  // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
  }
  // Conecta Guardar y la tecla de envío del formulario con la misma operación.
  $('editorForm').addEventListener('submit', guardar);
  // Permite cancelar una edición solo cuando no hay escritura pendiente.
  $('cancel').addEventListener('click', () => { if (!ocupado) $('editor').close(); });
  // Evita que Escape cierre el diálogo durante una escritura sin confirmar.
  $('editor').addEventListener('cancel', e => { if (ocupado) e.preventDefault(); });
  // Borra los campos al cerrar el diálogo para no conservar edición privada residual.
  $('editor').addEventListener('close', () => { edicion = null; $('itemName').value = ''; });
  // Centraliza clics del menú principal mediante delegación de eventos.
  $('nav').addEventListener('click', e => {
    // Reconoce el botón aunque el clic ocurra sobre su etiqueta interior.
    const b = e.target.closest('[data-page]');
    // Solo navega si se pulsó un control con destino de página.
    if (b) navegar(b.dataset.page);
  // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
  });
  // Conecta el botón móvil que abre o pliega la navegación.
  $('mobileToggle').addEventListener('click', () => {
    // Alterna la clase que controla la visibilidad del menú en pantallas pequeñas.
    const abierto = $('nav').classList.toggle('open');
    // Sincroniza el estado accesible con la visibilidad real del menú.
    $('mobileToggle').setAttribute('aria-expanded', String(abierto));
  // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
  });
  // Publica solo iniciar y limpiar para impedir que otros scripts dependan del estado privado.
  app.Interfaz = Object.freeze({ iniciar, limpiar });
// Ejecuta el módulo sobre el espacio común de Financer, creándolo si falta.
})(globalThis.Financer = globalThis.Financer || {});
