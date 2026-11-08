
'use strict';

let page = 'patrimonio';
let selectedType = null;
let selectedPlatform = null;
let editTarget = null;
let editorCollection = null;

function guardarNavegacion() {
  sessionStorage.setItem('financer_navegacion', JSON.stringify({
    page,
    selectedType,
    selectedPlatform
  }));
}

function recuperarNavegacion() {
  try {
    const guardado = JSON.parse(sessionStorage.getItem('financer_navegacion'));
    if (!guardado) return;

    const paginas = [
      'patrimonio', 'liquidez', 'inversiones',
      'resultados', 'gastos', 'objetivos'
    ];

    if (!paginas.includes(guardado.page)) return;

    page = guardado.page;
    selectedType = guardado.selectedType ?? null;
    selectedPlatform = guardado.selectedPlatform ?? null;
  } catch (error) {
    sessionStorage.removeItem('financer_navegacion');
  }
}

function el(tag, cls, text) {
  const x = document.createElement(tag);
  if (cls) x.className = cls;
  if (text !== undefined) x.textContent = text;
  return x;
}

function button(label, cls, action) {
  const b = el('button', cls, label);
  b.type = 'button';
  b.addEventListener('click', action);
  return b;
}

function typeById() {
  return investmentTypes.find(x => x.id === selectedType);
}

function platformById() {
  return typeById()?.children.find(x => x.id === selectedPlatform);
}

function navigate(next, typeId = null, platformId = null) {
  page = next;
  selectedType = typeId;
  selectedPlatform = platformId;
  guardarNavegacion();
  render();
  $('nav').classList.remove('open');
  $('mobileToggle').setAttribute('aria-expanded', 'false');
}

function tile(parent, name, description, action) {
  const b = button(name, 'tile', action);
  b.append(el('span', '', description));
  parent.append(b);
}

function note(parent, message) {
  parent.append(el('div', 'notice', message));
}

function render() {
  const area = $('content');
  area.replaceChildren();
  $('breadcrumb').replaceChildren();
  $('addButton').hidden = true;

  const titles = {
    patrimonio: 'Patrimonio total',
    liquidez: 'Liquidez',
    inversiones: 'Inversiones',
    resultados: 'Resultados',
    gastos: 'Gastos',
    objetivos: 'Objetivos'
  };

  $('heading').textContent = titles[page] || 'Financer';
  $('subtitle').textContent = 'Estructura de Financer · V1.8.8';

  document.querySelectorAll('#nav [data-page]').forEach(b => {
    b.classList.toggle('active', b.dataset.page === page);
  });

  const nav = $('investmentNav');
  nav.replaceChildren();

  investmentTypes.forEach(t => {
    const b = button(
      '• ' + t.name,
      selectedType === t.id ? 'active' : '',
      () => navigate('inversiones', t.id)
    );
    nav.append(b);
  });

  if (page === 'patrimonio') {
    note(
      area,
      'Patrimonio total = liquidez + inversiones. Los importes reales y los cálculos se incorporarán en versiones posteriores.'
    );

    const grid = el('div', 'tiles');
    area.append(grid);

    tile(
      grid, 'Liquidez', 'Bloques de saldos disponibles',
      () => navigate('liquidez')
    );

    tile(
      grid, 'Inversiones', 'Tipos, plataformas y productos',
      () => navigate('inversiones')
    );

    tile(
      grid, 'Resultados', 'Dashboard pendiente',
      () => navigate('resultados')
    );

  } else if (page === 'liquidez') {
    area.append(el('h3', 'section-heading', 'Bloques de liquidez'));

    note(
      area,
      'Los bloques de liquidez todavía no tienen formularios de saldo. Puedes organizar sus nombres.'
    );

    $('addButton').hidden = false;
    $('addButton').textContent = '+ Añadir bloque';
    $('addButton').onclick = () =>
      openEditor(liquidityTypes, 'bloque de liquidez');

    rows(
      area, liquidityTypes, null,
      liquidityTypes, 'bloque de liquidez'
    );

  } else if (page === 'inversiones') {
    if (!selectedType) {
      area.append(el('h3', 'section-heading', 'Tipos de inversión'));

      $('addButton').hidden = false;
      $('addButton').textContent = '+ Nuevo tipo';
      $('addButton').onclick = () =>
        openEditor(investmentTypes, 'tipo de inversión');

      rows(
        area, investmentTypes,
        t => navigate('inversiones', t.id),
        investmentTypes, 'tipo de inversión'
      );

    } else {
      const type = typeById();

      if (!type) {
        navigate('inversiones');
        return;
      }

      $('breadcrumb').append(
        button('Inversiones', '', () => navigate('inversiones')),
        ' / '
      );

      if (!selectedPlatform) {
        $('heading').textContent = type.name;
        $('breadcrumb').append(el('span', '', type.name));

        $('addButton').hidden = false;
        $('addButton').textContent = '+ Nueva plataforma';
        $('addButton').onclick = () =>
          openEditor(type.children, 'plataforma');

        rows(
          area, type.children,
          p => navigate('inversiones', type.id, p.id),
          type.children, 'plataforma'
        );

      } else {
        const platform = platformById();

        if (!platform) {
          navigate('inversiones', type.id);
          return;
        }

        $('heading').textContent = platform.name;

        $('breadcrumb').append(
          button(
            type.name, '',
            () => navigate('inversiones', type.id)
          ),
          ' / ' + platform.name
        );

        note(
          area,
          'Los formularios específicos de ' + type.name +
          ' se diseñarán de forma independiente en las siguientes versiones.'
        );

        $('addButton').hidden = false;
        $('addButton').textContent = '+ Nuevo producto';
        $('addButton').onclick = () =>
          openEditor(platform.children, 'producto');

        rows(
          area, platform.children, null,
          platform.children, 'producto'
        );
      }
    }

  } else if (page === 'resultados') {
    note(
      area,
      'Dashboard en construcción. Aquí aparecerán los KPI, las gráficas y los filtros globales e individuales. No hay cifras reales todavía.'
    );

  } else if (page === 'gastos' || page === 'objetivos') {
    note(
      area,
      'Bajo construcción. Este módulo se desarrollará después del seguimiento de inversiones y el dashboard.'
    );
  }
}

function rows(area, data, open, collection, label) {
  if (!data.length) {
    area.append(
      el(
        'p', 'muted',
        'Todavía no hay elementos. Utiliza el botón de añadir para empezar.'
      )
    );
    return;
  }

  for (const entry of data) {
    const row = el('div', 'item');
    const actions = el('div', 'actions');

    const name = button(
      entry.name + (open ? '  ›' : ''),
      'item-name',
      () => {
        if (open) open(entry);
      }
    );

    if (!open) {
      name.disabled = true;
      name.style.color = '#17263c';
    }

    actions.append(
      button(
        'Editar', 'secondary',
        () => openEditor(collection, label, entry)
      ),
      button(
        'Eliminar', 'danger',
        () => (collection, entry)
      )
    );

    row.append(name, actions);
    area.append(row);
  }
}

function openEditor(collection, label, entry = null) {
  editorCollection = collection;
  editTarget = entry;

  $('dialogTitle').textContent =
    (entry ? 'Editar ' : 'Añadir ') + label;

  $('itemName').value = entry?.name || '';
  $('editor').showModal();
  $('itemName').focus();
}

async function removeItem(collection, entry) {
  if (collection !== liquidityTypes && collection !== investmentTypes) {
    alert('La eliminación de plataformas y productos todavía no está habilitada.');
    return;
  }

  const confirmado = confirm(
    '¿Eliminar definitivamente «' + entry.name + '»?\n' +
    'Esta acción no se puede deshacer.'
  );

  if (!confirmado) return;

  try {
    await eliminarBloque(entry.id);
    await actualizarBloques();
  } catch (error) {
    console.error('Error al eliminar el bloque:', error);
    alert(
      'No se ha podido eliminar el bloque. Puede tener elementos asociados.'
    );
  }
}

$('editorForm').addEventListener('submit', async e => {
  e.preventDefault();

  const nombre = $('itemName').value.trim();
  if (!nombre || !editorCollection) return;

  const padre = editorCollection === liquidityTypes
    ? 'Liquidez'
    : editorCollection === investmentTypes
      ? 'Inversiones'
      : null;

  if (!padre) {
    alert(
      'La gestión de plataformas y productos todavía no está habilitada.'
    );
    return;
  }

  const boton = $('editorForm').querySelector('[type="submit"]');
  if (boton) boton.disabled = true;

  try {
    if (editTarget) {
      await renombrarBloque(editTarget.id, nombre);
    } else {
      const bloques = await cargarBloquesSupabase();

      const principal = bloques.find(
        b => b.nombre === padre && b.bloque_padre_id === null
      );

      if (!principal) {
        throw new Error('No se encuentra el bloque principal.');
      }

      await crearBloque(nombre, principal.id);
    }

    $('editor').close();
    await actualizarBloques();

  } catch (error) {
    console.error('Error al guardar el bloque:', error);
    alert(
      'No se ha podido completar la operación. Comprueba los datos antes de volver a intentarlo.'
    );
  } finally {
    if (boton) boton.disabled = false;
  }
});

$('cancel').addEventListener('click', () => {
  $('editor').close();
});

$('nav').addEventListener('click', e => {
  const b = e.target.closest('[data-page]');
  if (b) navigate(b.dataset.page);
});

$('mobileToggle').addEventListener('click', () => {
  const open = $('nav').classList.toggle('open');
  $('mobileToggle').setAttribute('aria-expanded', String(open));
});

// La navegación se recupera al terminar de cargar Supabase.
render();
