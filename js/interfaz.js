
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
      'patrimonio',
      'liquidez',
      'inversiones',
      'resultados',
      'gastos',
      'objetivos'
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
  $('subtitle').textContent = 'Estructura de Financer · V1.8.7';

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
      grid,
      'Liquidez',
      'Bloques de saldos disponibles',
      () => navigate('liquidez')
    );

    tile(
      grid,
      'Inversiones',
      'Tipos, plataformas y productos',
      () => navigate('inversiones')
    );

    tile(
      grid,
      'Resultados',
      'Dashboard pendiente',
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
    $('addButton').onclick = () => openEditor(
      liquidityTypes,
      'bloque de liquidez'
    );

    rows(
      area,
      liquidityTypes,
      null,
      liquidityTypes,
      'bloque de liquidez'
    );

  } else if (page === 'inversiones') {
    if (!selectedType) {
      area.append(el('h3', 'section-heading', 'Tipos de inversión'));

      $('addButton').hidden = false;
      $('addButton').textContent = '+ Nuevo tipo';
      $('addButton').onclick = () => openEditor(
        investmentTypes,
        'tipo de inversión'
      );

      rows(
        area,
        investmentTypes,
        t => navigate('inversiones', t.id),
        investmentTypes,
        'tipo de inversión'
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
        $('addButton').onclick = () => openEditor(
          type.children,
          'plataforma'
        );

        rows(
          area,
          type.children,
          p => navigate('inversiones', type.id, p.id),
          type.children,
          'plataforma'
        );

      } else {
        const platform = platformById();

        if (!platform) {
          navigate('inversiones', type.id);
          return;
        }

        $('heading').textContent = platform.name;

        $('breadcrumb').append(
          button(type.name, '', () => navigate('inversiones', type.id)),
          ' / ' + platform.name
        );

        note(
          area,
          'Los formularios específicos de ' +
          type.name +
          ' se diseñarán de forma independiente en las siguientes versiones.'
        );

        $('addButton').hidden = false;
        $('addButton').textContent = '+ Nuevo producto';
        $('addButton').onclick = () => openEditor(
          platform.children,
          'producto'
        );

        rows(
          area,
          platform.children,
          null,
          platform.children,
          'producto'
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
        'p',
        'muted',
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
      button('Editar', 'secondary', () => openEditor(collection, label, entry)),
      button('Eliminar', 'danger', () => removeItem(collection, entry))
    );

    row.append(name, actions);
    area.append(row);
  }
}

function openEditor(collection, label, entry = null) {
  alert('La edición se habilitará cuando conectemos el guardado con Supabase.');
  return;
}

function removeItem(collection, entry) {
  alert('La edición se habilitará cuando conectemos el guardado con Supabase.');
  return;
}

$('editorForm').addEventListener('submit', e => {
  e.preventDefault();

  const name = $('itemName').value.trim();
  if (!name || !editorCollection) return;

  if (editTarget) {
    editTarget.name = name;
  } else {
    editorCollection.push(makeItem(name));
  }

  $('editor').close();
  render();
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
render();
