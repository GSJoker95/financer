'use strict';
// Prueba el SDK Supabase real, interceptando TODA la red. Nunca usa una cuenta
// real ni envía escrituras al proyecto configurado en la aplicación.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const raiz = path.join(__dirname, '..');
const ORIGEN = 'https://financer.test/financer/';
const A = '00000000-0000-0000-0000-000000000001';
const B = '00000000-0000-0000-0000-000000000002';
function jwt(id) {
  const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url');
  return b64({ alg: 'HS256', typ: 'JWT' }) + '.' + b64({ sub: id, role: 'authenticated', exp: Math.floor(Date.now() / 1000) + 3600 }) + '.test-signature';
}
function usuario(id) { return { id, email: (id === A ? 'a' : 'b') + '@example.invalid', aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {} }; }
function escenario() {
  return {
    tablas: { bloques: [
      { id: 'l', nombre: 'Liquidez', bloque_padre_id: null, usuario_id: A },
      { id: 'i', nombre: 'Inversiones', bloque_padre_id: null, usuario_id: A },
      { id: 'c', nombre: 'Crypto', bloque_padre_id: 'i', usuario_id: A },
      { id: 'cash', nombre: 'Efectivo', bloque_padre_id: 'l', usuario_id: A },
      { id: 'bl', nombre: 'Liquidez', bloque_padre_id: null, usuario_id: B },
      { id: 'bi', nombre: 'Inversiones', bloque_padre_id: null, usuario_id: B },
      { id: 'bc', nombre: 'Solo usuario B', bloque_padre_id: 'bi', usuario_id: B }
    ], plataformas: [] },
    falloLectura: false, falloEscritura: false, ceroFilas: false,
    protegidos: new Set(), externas: [], escrituras: 0, demora: 0
  };
}
async function interceptar(contexto, api, sinCDN = false) {
  await contexto.route('**/*', async ruta => {
    const peticion = ruta.request();
    const u = new URL(peticion.url());
    const json = (data, status = 200) => ruta.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) });
    if (peticion.url().startsWith(ORIGEN)) {
      const relativo = u.pathname.replace('/financer/', '') || 'index.html';
      const archivo = path.resolve(raiz, relativo);
      if (!archivo.startsWith(raiz + path.sep) || !fs.existsSync(archivo)) return ruta.fulfill({ status: 404, body: '' });
      return ruta.fulfill({ body: fs.readFileSync(archivo), contentType: relativo.endsWith('.js') ? 'text/javascript' : relativo.endsWith('.css') ? 'text/css' : 'text/html' });
    }
    if (u.hostname === 'cdn.jsdelivr.net') {
      if (sinCDN) return ruta.abort();
      return ruta.fulfill({ body: fs.readFileSync(path.join(raiz, 'node_modules/@supabase/supabase-js/dist/umd/supabase.js')), contentType: 'text/javascript' });
    }
    if (u.hostname !== 'ogjirfsvczulgnqjbubc.supabase.co') {
      api.externas.push(peticion.url()); return ruta.abort();
    }
    const auth = peticion.headers().authorization || '';
    let id;
    try { id = JSON.parse(Buffer.from(auth.replace('Bearer ', '').split('.')[1], 'base64url')).sub; } catch { /* sin sesión */ }
    if (u.pathname === '/auth/v1/token') {
      const credenciales = peticion.postDataJSON();
      if (credenciales.password !== 'solo-prueba') return json({ msg: 'Invalid credentials', error_code: 'invalid_credentials' }, 400);
      id = credenciales.email.startsWith('b@') ? B : A;
      return json({ access_token: jwt(id), refresh_token: 'refresh-' + id, token_type: 'bearer', expires_in: 3600, user: usuario(id) });
    }
    if (u.pathname === '/auth/v1/user') return id ? json(usuario(id)) : json({ msg: 'Unauthorized' }, 401);
    if (u.pathname === '/auth/v1/logout') return ruta.fulfill({ status: 204, body: '' });
    if (!u.pathname.startsWith('/rest/v1/')) throw new Error('Endpoint inesperado: ' + u.pathname);
    const tabla = u.pathname.split('/').pop();
    assert.ok(api.tablas[tabla], 'No se deben consultar tablas no previstas');
    const metodo = peticion.method();
    if (!id) return json({ code: '42501', message: 'Sin sesión' }, 403);
    if (metodo === 'GET' && api.falloLectura) return json({ code: 'TEST', message: 'Fallo de lectura ficticio' }, 500);
    if (metodo !== 'GET') {
      api.escrituras++;
      if (api.demora) await new Promise(r => setTimeout(r, api.demora));
      if (api.falloEscritura) return json({ code: 'TEST', message: 'Fallo ficticio privado' }, 500);
      if (api.ceroFilas) return json({ code: 'PGRST116', message: 'Zero rows' }, 406);
    }
    if (metodo !== 'POST') assert.equal(u.searchParams.get('usuario_id'), 'eq.' + id, 'Cada lectura o modificación filtra por usuario');
    const filtradas = api.tablas[tabla].filter(f => f.usuario_id === id && (!u.searchParams.has('id') || 'eq.' + f.id === u.searchParams.get('id')));
    let respuesta;
    if (metodo === 'GET') {
      const offset = Number(u.searchParams.get('offset') || 0);
      const limite = Number(u.searchParams.get('limit') || 500);
      respuesta = filtradas.slice(offset, offset + limite);
    } else if (metodo === 'POST') {
      const campos = peticion.postDataJSON();
      assert.equal(campos.usuario_id, id);
      respuesta = { ...campos, id: randomUUID() };
      api.tablas[tabla].push(respuesta);
    } else if (metodo === 'PATCH') {
      assert.equal(filtradas.length, 1);
      Object.assign(filtradas[0], peticion.postDataJSON());
      respuesta = filtradas[0];
    } else if (metodo === 'DELETE') {
      assert.equal(filtradas.length, 1);
      if (api.protegidos.has(filtradas[0].id)) return json({ code: '23503', details: 'privado' }, 409);
      respuesta = { id: filtradas[0].id };
      api.tablas[tabla] = api.tablas[tabla].filter(f => f.id !== respuesta.id);
    }
    return json(respuesta, metodo === 'POST' ? 201 : 200);
  });
}
async function login(page, email = 'a@example.invalid', password = 'solo-prueba') {
  await page.locator('#loginEmail').fill(email);
  await page.locator('#loginPassword').fill(password);
  await page.locator('#loginSubmit').click();
}
async function menu(page, key) {
  if (!await page.locator('#nav').isVisible()) await page.locator('#mobileToggle').click();
  await page.locator('#nav [data-page="' + key + '"]').click();
}
async function guardar(page, nombre) {
  await page.locator('#itemName').fill(nombre);
  await page.locator('#editorForm [type=submit]').click();
}
async function esperarGuardado(page) {
  await page.locator('#editor').waitFor({ state: 'hidden' });
  await page.getByText('Guardado correctamente.', { exact: true }).waitFor();
}
async function pruebasNavegacion(browser, ancho) {
  const api = escenario();
  const context = await browser.newContext({ viewport: { width: ancho, height: 844 } });
  await interceptar(context, api);
  const page = await context.newPage();
  const errores = [];
  page.on('pageerror', error => errores.push(error.message));
  await page.goto(ORIGEN);
  await page.locator('#loginScreen').waitFor({ state: 'visible' });
  assert.equal(await page.locator('.app').isVisible(), false);
  await login(page, 'a@example.invalid', 'incorrecta');
  await page.getByText('No se ha podido iniciar sesión.', { exact: false }).waitFor();
  await login(page);
  await page.locator('.app').waitFor({ state: 'visible' });
  for (const [key, title] of [['liquidez', 'Liquidez'], ['inversiones', 'Inversiones'], ['resultados', 'Resultados'], ['gastos', 'Gastos'], ['objetivos', 'Objetivos'], ['patrimonio', 'Patrimonio total']]) {
    await menu(page, key); assert.equal(await page.locator('#heading').innerText(), title);
  }
  await menu(page, 'inversiones');
  await page.locator('#content .item-name').filter({ hasText: 'Crypto' }).click();
  for (const nombre of ['Pools de Liquidez', 'Subcategoría', 'Nivel 3', 'Nivel 4', 'Nivel 5']) {
    await page.locator('#addButton').click(); await guardar(page, nombre); await esperarGuardado(page);
    await page.locator('#content .item-name').filter({ hasText: nombre }).click();
  }
  await page.reload();
  await page.locator('.app').waitFor({ state: 'visible' });
  assert.equal(await page.locator('#heading').innerText(), 'Nivel 5');
  assert.match(await page.locator('#breadcrumb').innerText(), /Pools de Liquidez/);
  // Borra una hoja; cancelar no debe escribir.
  await page.locator('#breadcrumb button').filter({ hasText: 'Nivel 4' }).click();
  const anterior = api.escrituras;
  page.once('dialog', d => d.dismiss());
  await page.locator('#content .danger').click();
  assert.equal(api.escrituras, anterior);
  page.once('dialog', d => d.accept());
  await page.locator('#content .danger').click();
  await page.getByText('Eliminado correctamente.', { exact: true }).waitFor();
  await page.reload(); await page.locator('.app').waitFor({ state: 'visible' });
  assert.equal(await page.locator('#content .item').count(), 0);
  // No permite borrar un padre con hijos.
  await page.locator('#breadcrumb button').filter({ hasText: 'Inversiones' }).click();
  await page.locator('#content .danger').click();
  await page.getByText('Esta categoría contiene subcategorías.', { exact: false }).waitFor();
  // Editar se muestra como texto: nunca se ejecuta HTML introducido.
  await page.locator('#content .secondary').click();
  const nombreXSS = '<img src=x onerror="window.testXSS=1">';
  await guardar(page, nombreXSS); await esperarGuardado(page);
  assert.equal(await page.locator('#content img').count(), 0);
  assert.equal(await page.evaluate(() => window.testXSS), undefined);
  // Plataformas globales, duplicados y operaciones sin confirmar.
  await menu(page, 'plataformas');
  await page.locator('#addButton').click(); await guardar(page, 'Compartida'); await esperarGuardado(page);
  await page.locator('#addButton').click(); await guardar(page, ' compartida ');
  await page.getByText('Ya existe un elemento', { exact: false }).waitFor();
  await page.locator('#cancel').click();
  api.ceroFilas = true;
  await page.locator('#content .secondary').click(); await guardar(page, 'Otro nombre');
  await page.getByText('No se ha confirmado el cambio.', { exact: false }).waitFor();
  api.ceroFilas = false;
  await page.locator('#cancel').click();
  api.falloEscritura = true;
  await page.locator('#content .secondary').click(); await guardar(page, 'Otro nombre');
  await page.getByText('No se ha podido confirmar el guardado.', { exact: false }).waitFor();
  api.falloEscritura = false;
  await guardar(page, 'Compartida actualizada'); await esperarGuardado(page);
  api.protegidos.add(api.tablas.plataformas[0].id);
  page.once('dialog', d => d.accept());
  await page.locator('#content .danger').click();
  await page.getByText('Este elemento tiene categorías', { exact: false }).waitFor();
  assert.equal(await page.locator('#content .item').count(), 1);
  api.protegidos.clear();
  await page.reload(); await page.locator('.app').waitFor({ state: 'visible' });
  assert.equal(await page.locator('#content .item-label').innerText(), 'Compartida actualizada');
  // El fallo de carga deja visibles reintento y cierre de sesión.
  api.falloLectura = true;
  await page.locator('#refreshButton').click();
  await page.getByRole('heading', { name: 'No se han podido cargar los datos' }).waitFor();
  assert.equal(await page.locator('#content .item').count(), 0);
  api.falloLectura = false;
  await page.locator('#refreshButton').click();
  await page.locator('#content .item-label').waitFor();
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  fs.mkdirSync(path.join(raiz, 'test-results'), { recursive: true });
  await page.screenshot({ path: path.join(raiz, 'test-results', 'plataformas-' + ancho + '.png'), fullPage: true });
  // Cambio de cuenta en la misma pestaña: no conserva datos ni ruta de A.
  await page.evaluate(() => Financer.cliente.auth.signInWithPassword({ email: 'b@example.invalid', password: 'solo-prueba' }));
  await page.locator('#heading').filter({ hasText: 'Patrimonio total' }).waitFor();
  assert.equal(await page.locator('#content').innerText().then(t => t.includes('Compartida actualizada')), false);
  await menu(page, 'inversiones');
  await page.getByRole('button', { name: 'Solo usuario B ›', exact: true }).waitFor();
  assert.equal(await page.locator('#content').innerText().then(t => t.includes(nombreXSS)), false);
  // Una salida en otra pestaña limpia la primera.
  const otra = await context.newPage(); await otra.goto(ORIGEN);
  await otra.locator('.app').waitFor({ state: 'visible' });
  await otra.locator('#logoutButton').click();
  await page.locator('#loginScreen').waitFor({ state: 'visible' });
  assert.equal(await page.locator('#content').innerText(), '');
  assert.equal(await page.locator('#investmentNav').innerText(), '');
  assert.equal(await page.locator('#itemName').inputValue(), '');
  assert.deepEqual(errores, []);
  assert.deepEqual(api.externas, []);
  await context.close();
  console.log('PASS navegador: ' + ancho + ' px, SDK real y API simulada');
}
(async () => {
  const options = { headless: true };
  if (process.env.CHROMIUM_PATH) options.executablePath = process.env.CHROMIUM_PATH;
  const browser = await chromium.launch(options);
  try {
    for (const ancho of [1280, 390]) await pruebasNavegacion(browser, ancho);
    const api = escenario();
    const context = await browser.newContext(); await interceptar(context, api, true);
    const page = await context.newPage(); await page.goto(ORIGEN);
    await page.getByText('No se ha podido cargar la conexión.', { exact: false }).waitFor();
    assert.equal(await page.locator('#loginSubmit').isDisabled(), true);
    assert.equal(await page.locator('#retryAccess').isVisible(), true);
    await context.close();
    console.log('PASS navegador: CDN no disponible muestra reintento');
    const restringido = await browser.newContext(); await interceptar(restringido, escenario());
    await restringido.addInitScript(() => Object.defineProperty(window, 'sessionStorage', { get() { throw new Error('Almacenamiento de navegación bloqueado'); } }));
    const sinAlmacen = await restringido.newPage(); await sinAlmacen.goto(ORIGEN);
    await sinAlmacen.locator('#loginScreen').waitFor({ state: 'visible' }); await login(sinAlmacen);
    await sinAlmacen.locator('.app').waitFor({ state: 'visible' }); await menu(sinAlmacen, 'liquidez');
    assert.equal(await sinAlmacen.locator('#heading').innerText(), 'Liquidez');
    await restringido.close();
    console.log('PASS navegador: navegación sin sessionStorage');
    const lento = await browser.newContext();
    const apiLenta = escenario(); await interceptar(lento, apiLenta);
    const p = await lento.newPage(); await p.goto(ORIGEN);
    await p.locator('#loginScreen').waitFor({ state: 'visible' }); await login(p);
    await p.locator('.app').waitFor({ state: 'visible' }); await menu(p, 'plataformas');
    await p.locator('#addButton').click();
    apiLenta.demora = 500;
    const respuestaPendiente = p.waitForResponse(r => r.url().includes('/rest/v1/plataformas') && r.request().method() === 'POST');
    await guardar(p, 'Guardado de la sesión anterior');
    assert.equal(await p.locator('#editorForm [type=submit]').isDisabled(), true);
    // Simula la salida de Auth durante una petición ya enviada.
    await p.evaluate(() => Financer.cliente.auth.signOut());
    await respuestaPendiente;
    await p.locator('#loginScreen').waitFor({ state: 'visible' });
    assert.equal(await p.locator('#content').innerText(), '');
    assert.equal(await p.locator('#itemName').inputValue(), '');
    assert.equal(await p.locator('#editor').isVisible(), false);
    await lento.close();
    console.log('PASS navegador: una respuesta antigua no restaura datos tras salir');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
