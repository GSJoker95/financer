// Activa modo estricto para detectar errores también dentro de las pruebas de navegador.
'use strict';
// Prueba el SDK Supabase real, interceptando TODA la red. Nunca usa una cuenta
// real ni envía escrituras al proyecto configurado en la aplicación.
// Usa Chromium mediante Playwright para ejecutar la interfaz como un navegador real.
const { chromium } = require('playwright');
// Convierte resultados inesperados en fallos que pueda detectar GitHub Actions.
const assert = require('node:assert/strict');
// Lee recursos locales y guarda capturas de registros exclusivamente ficticios.
const fs = require('node:fs');
// Resuelve rutas del proyecto para que las pruebas no dependan de la carpeta de ejecución.
const path = require('node:path');
// Genera IDs ficticios únicos para simular nuevas filas sin reutilizar IDs reales.
const { randomUUID } = require('node:crypto');
// Calcula la raíz del repositorio para servir los archivos que se están comprobando.
const raiz = path.join(__dirname, '..');
// Utiliza un dominio reservado de pruebas; todas sus solicitudes se interceptarán.
const ORIGEN = 'https://financer.test/financer/';
// Define la cuenta ficticia A para comprobar separación entre propietarios.
const A = '00000000-0000-0000-0000-000000000001';
// Define una cuenta ficticia B distinta sin crear usuarios en Supabase.
const B = '00000000-0000-0000-0000-000000000002';
// Fabrica un token de prueba con la forma que necesita el SDK; no firma acceso real.
function jwt(id) {
  // Codifica objetos en JSON y base64url para simular las partes de un token.
  const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url');
  // Crea un JWT ficticio de una hora y firma inválida, válido solo para la API interceptada.
  return b64({ alg: 'HS256', typ: 'JWT' }) + '.' + b64({ sub: id, role: 'authenticated', exp: Math.floor(Date.now() / 1000) + 3600 }) + '.test-signature';
// Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
}
// Produce datos ficticios de cuenta con correo .invalid para no usar identidades reales.
function usuario(id) { return { id, email: (id === A ? 'a' : 'b') + '@example.invalid', aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {} }; }
// Construye un estado nuevo e independiente para cada escenario de navegador.
function escenario() {
  // Devuelve el almacén en memoria y controles para provocar fallos de forma reproducible.
  return {
    // Agrupa las tablas simuladas y comienza el árbol del usuario A.
    tablas: { bloques: [
      // Da a A una raíz Liquidez sin asociarla a ninguna cuenta real.
      { id: 'l', nombre: 'Liquidez', bloque_padre_id: null, usuario_id: A },
      // Da a A una raíz Inversiones para probar sus menús.
      { id: 'i', nombre: 'Inversiones', bloque_padre_id: null, usuario_id: A },
      // Coloca Crypto bajo la raíz de inversiones de A.
      { id: 'c', nombre: 'Crypto', bloque_padre_id: 'i', usuario_id: A },
      // Coloca Efectivo bajo Liquidez para probar la otra rama principal.
      { id: 'cash', nombre: 'Efectivo', bloque_padre_id: 'l', usuario_id: A },
      // Da a B su propia raíz Liquidez con un ID diferente.
      { id: 'bl', nombre: 'Liquidez', bloque_padre_id: null, usuario_id: B },
      // Da a B su propia raíz Inversiones para evitar reutilizar las de A.
      { id: 'bi', nombre: 'Inversiones', bloque_padre_id: null, usuario_id: B },
      // Incluye un nombre exclusivo de B para demostrar aislamiento visual entre cuentas.
      { id: 'bc', nombre: 'Solo usuario B', bloque_padre_id: 'bi', usuario_id: B }
    // Empieza con plataformas vacías para comprobar creación desde cero.
    ], plataformas: [] },
    // Prepara interruptores de errores de lectura, escritura y respuestas sin filas.
    falloLectura: false, falloEscritura: false, ceroFilas: false,
    // Registra dependencias, red inesperada, escrituras y demora para pruebas de recuperación.
    protegidos: new Set(), externas: [], escrituras: 0, demora: 0
  // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
  };
// Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
}
// Intercepta toda la red del contexto para impedir acceder al servicio o a cuentas reales.
async function interceptar(contexto, api, sinCDN = false) {
  // Atiende cada solicitud antes de que pueda salir al exterior.
  await contexto.route('**/*', async ruta => {
    // Obtiene método, cabeceras y contenido que enviaría el navegador.
    const peticion = ruta.request();
    // Descompone la dirección para reconocer recursos y endpoints simulados.
    const u = new URL(peticion.url());
    // Comparte respuestas JSON con el mismo formato y estado HTTP que espera el SDK.
    const json = (data, status = 200) => ruta.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) });
    // Reconoce peticiones a los archivos de la aplicación dentro del dominio ficticio.
    if (peticion.url().startsWith(ORIGEN)) {
      // Resuelve la portada y los recursos relativos también cuando se sirven bajo una subruta.
      const relativo = u.pathname.replace('/financer/', '') || 'index.html';
      // Convierte la ruta relativa en una ruta local comprobable.
      const archivo = path.resolve(raiz, relativo);
      // Bloquea recorridos fuera del proyecto y archivos inexistentes para no servir otros datos.
      if (!archivo.startsWith(raiz + path.sep) || !fs.existsSync(archivo)) return ruta.fulfill({ status: 404, body: '' });
      // Entrega los archivos locales con su tipo correcto sin cambiar el código que se prueba.
      return ruta.fulfill({ body: fs.readFileSync(archivo), contentType: relativo.endsWith('.js') ? 'text/javascript' : relativo.endsWith('.css') ? 'text/css' : 'text/html' });
    // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
    }
    // Reconoce la carga del SDK que en producción proviene del CDN.
    if (u.hostname === 'cdn.jsdelivr.net') {
      // Permite simular un CDN caído sin depender de un fallo de Internet real.
      if (sinCDN) return ruta.abort();
      // Sirve la versión real fijada del SDK desde node_modules, manteniendo la prueba aislada.
      return ruta.fulfill({ body: fs.readFileSync(path.join(raiz, 'node_modules/@supabase/supabase-js/dist/umd/supabase.js')), contentType: 'text/javascript' });
    // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
    }
    // Distingue el proyecto configurado de cualquier destino inesperado.
    if (u.hostname !== 'ogjirfsvczulgnqjbubc.supabase.co') {
      // Registra y bloquea las solicitudes imprevistas para detectar escapes de la simulación.
      api.externas.push(peticion.url()); return ruta.abort();
    // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
    }
    // Lee la cabecera de autorización de prueba para reconocer el usuario ficticio.
    const auth = peticion.headers().authorization || '';
    // Parte de una identidad ausente si el token no permite obtener un sujeto.
    let id;
    // Decodifica solo el sujeto ficticio; esto es una simulación, no una validación de seguridad real.
    try { id = JSON.parse(Buffer.from(auth.replace('Bearer ', '').split('.')[1], 'base64url')).sub; } catch { /* sin sesión */ }
    // Reconoce la petición de autenticación por contraseña del SDK.
    if (u.pathname === '/auth/v1/token') {
      // Lee el cuerpo de credenciales ficticias para reproducir éxito o rechazo.
      const credenciales = peticion.postDataJSON();
      // Devuelve un rechazo controlado si la contraseña no es la elegida por la prueba.
      if (credenciales.password !== 'solo-prueba') return json({ msg: 'Invalid credentials', error_code: 'invalid_credentials' }, 400);
      // Selecciona la cuenta ficticia a partir del correo de prueba.
      id = credenciales.email.startsWith('b@') ? B : A;
      // Devuelve sesión, tokens de prueba y usuario con el formato que espera Supabase Auth.
      return json({ access_token: jwt(id), refresh_token: 'refresh-' + id, token_type: 'bearer', expires_in: 3600, user: usuario(id) });
    // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
    }
    // Simula getUser y rechaza peticiones que no incluyen una identidad de prueba.
    if (u.pathname === '/auth/v1/user') return id ? json(usuario(id)) : json({ msg: 'Unauthorized' }, 401);
    // Confirma la salida con respuesta sin contenido, como el servicio Auth.
    if (u.pathname === '/auth/v1/logout') return ruta.fulfill({ status: 204, body: '' });
    // Falla si aparece una API no contemplada, en lugar de permitir tráfico real accidental.
    if (!u.pathname.startsWith('/rest/v1/')) throw new Error('Endpoint inesperado: ' + u.pathname);
    // Identifica la tabla consultada a partir del endpoint REST.
    const tabla = u.pathname.split('/').pop();
    // Impide consultar tablas distintas de las simuladas en este escenario.
    assert.ok(api.tablas[tabla], 'No se deben consultar tablas no previstas');
    // Distingue lectura, alta, edición y borrado por su método HTTP.
    const metodo = peticion.method();
    // Rechaza peticiones sin sujeto de prueba para cubrir ausencia de sesión.
    if (!id) return json({ code: '42501', message: 'Sin sesión' }, 403);
    // Simula un error de lectura para verificar la recuperación de la interfaz.
    if (metodo === 'GET' && api.falloLectura) return json({ code: 'TEST', message: 'Fallo de lectura ficticio' }, 500);
    // Aplica los controles de fallo a métodos que modificarían registros.
    if (metodo !== 'GET') {
      // Cuenta las escrituras ficticias para detectar envíos repetidos o cancelaciones incorrectas.
      api.escrituras++;
      // Introduce una demora controlada para comprobar respuestas después de cerrar sesión.
      if (api.demora) await new Promise(r => setTimeout(r, api.demora));
      // Simula un fallo de guardado cuyo detalle interno no debe mostrarse al usuario.
      if (api.falloEscritura) return json({ code: 'TEST', message: 'Fallo ficticio privado' }, 500);
      // Simula el rechazo de single() cuando no hay una fila afectada visible.
      if (api.ceroFilas) return json({ code: 'PGRST116', message: 'Zero rows' }, 406);
    // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
    }
    // Exige un filtro explícito de propietario en lecturas y modificaciones existentes.
    if (metodo !== 'POST') assert.equal(u.searchParams.get('usuario_id'), 'eq.' + id, 'Cada lectura o modificación filtra por usuario');
    // Aísla filas por sujeto e ID como harían los filtros y RLS del servicio real.
    const filtradas = api.tablas[tabla].filter(f => f.usuario_id === id && (!u.searchParams.has('id') || 'eq.' + f.id === u.searchParams.get('id')));
    // Reserva la respuesta que dependerá del tipo de operación solicitada.
    let respuesta;
    // Selecciona la simulación de una lectura REST.
    if (metodo === 'GET') {
      // Interpreta el desplazamiento para cubrir el contrato de paginación del SDK.
      const offset = Number(u.searchParams.get('offset') || 0);
      // Interpreta el límite o usa el tamaño de página acordado por el repositorio.
      const limite = Number(u.searchParams.get('limit') || 500);
      // Entrega solo la página de filas visibles solicitada por esta cuenta.
      respuesta = filtradas.slice(offset, offset + limite);
    // Selecciona la simulación de una creación nueva.
    } else if (metodo === 'POST') {
      // Lee los campos enviados para comprobar propiedad y contenido del alta.
      const campos = peticion.postDataJSON();
      // Exige que el alta pertenezca al sujeto de la sesión ficticia.
      assert.equal(campos.usuario_id, id);
      // Asigna un ID generado como haría la base de datos al crear una fila.
      respuesta = { ...campos, id: randomUUID() };
      // Conserva el alta en memoria para verificar que sobrevive a una recarga del navegador.
      api.tablas[tabla].push(respuesta);
    // Selecciona la simulación de edición de un registro existente.
    } else if (metodo === 'PATCH') {
      // Exige una única fila visible para no aparentar ediciones ambiguas.
      assert.equal(filtradas.length, 1);
      // Aplica a esa fila los campos que realmente envió la aplicación.
      Object.assign(filtradas[0], peticion.postDataJSON());
      // Devuelve el registro actualizado que utilizará la interfaz sin volver a cargarlo.
      respuesta = filtradas[0];
    // Selecciona la simulación de borrado de una fila existente.
    } else if (metodo === 'DELETE') {
      // Exige identificar una única fila del propietario antes de simular su eliminación.
      assert.equal(filtradas.length, 1);
      // Reproduce una restricción de dependencia para comprobar que se conserva el registro.
      if (api.protegidos.has(filtradas[0].id)) return json({ code: '23503', details: 'privado' }, 409);
      // Prepara la confirmación de borrado por el mismo identificador solicitado.
      respuesta = { id: filtradas[0].id };
      // Retira solo esa fila del almacén ficticio, nunca de Supabase real.
      api.tablas[tabla] = api.tablas[tabla].filter(f => f.id !== respuesta.id);
    // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
    }
    // Usa 201 en altas y 200 en otras respuestas para reproducir la API.
    return json(respuesta, metodo === 'POST' ? 201 : 200);
  // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
  });
// Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
}
// Agrupa el acceso por formulario con credenciales exclusivamente de pruebas.
async function login(page, email = 'a@example.invalid', password = 'solo-prueba') {
  // Rellena el correo mediante el mismo campo que utiliza el propietario.
  await page.locator('#loginEmail').fill(email);
  // Rellena la contraseña ficticia sin almacenarla como secreto del proyecto.
  await page.locator('#loginPassword').fill(password);
  // Envía mediante el botón real para comprobar sus eventos y validaciones.
  await page.locator('#loginSubmit').click();
// Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
}
// Abre páginas del menú usando tanto el diseño de ordenador como el móvil.
async function menu(page, key) {
  // Despliega el menú solo cuando está oculto por el diseño responsive.
  if (!await page.locator('#nav').isVisible()) await page.locator('#mobileToggle').click();
  // Pulsa el destino real en lugar de modificar el estado interno del módulo.
  await page.locator('#nav [data-page="' + key + '"]').click();
// Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
}
// Comparte el rellenado y envío del editor sin simular directamente el guardado.
async function guardar(page, nombre) {
  // Introduce el nombre por el campo visible para pasar sus validaciones reales.
  await page.locator('#itemName').fill(nombre);
  // Pulsa Guardar para comprobar también su bloqueo y confirmación visual.
  await page.locator('#editorForm [type=submit]').click();
// Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
}
// Espera la confirmación de la interfaz en lugar de una pausa arbitraria.
async function esperarGuardado(page) {
  // Comprueba que el diálogo solo se cierra cuando la aplicación considera confirmado el guardado.
  await page.locator('#editor').waitFor({ state: 'hidden' });
  // Exige el mensaje de éxito para no confundir un cierre o cancelación con una escritura.
  await page.getByText('Guardado correctamente.', { exact: true }).waitFor();
// Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
}
// Ejecuta el recorrido funcional completo para un ancho concreto de pantalla.
async function pruebasNavegacion(browser, ancho) {
  // Crea datos ficticios limpios para que una resolución no dependa de pruebas anteriores.
  const api = escenario();
  // Aísla cookies y almacenamiento e impone el ancho de ordenador o móvil a comprobar.
  const context = await browser.newContext({ viewport: { width: ancho, height: 844 } });
  // Instala la simulación de toda la red antes de abrir cualquier página.
  await interceptar(context, api);
  // Abre una pestaña nueva dentro del contexto aislado.
  const page = await context.newPage();
  // Acumula errores JavaScript para exigir que no se produzcan durante el recorrido.
  const errores = [];
  // Registra excepciones de página sin ignorarlas aunque la pantalla parezca funcionar.
  page.on('pageerror', error => errores.push(error.message));
  // Abre los archivos locales a través del origen ficticio interceptado.
  await page.goto(ORIGEN);
  // Espera el acceso para comprobar el caso inicial sin sesión.
  await page.locator('#loginScreen').waitFor({ state: 'visible' });
  // Comprueba que el usuario identifica nombre y versión antes de facilitar credenciales.
  assert.equal(await page.locator('#appIdentity').isVisible(), true);
  // Verifica que la pestaña identifica la entrega actual, no un título histórico V1.7.
  assert.equal(await page.title(), 'Financer · V2');
  // Comprueba que se publica el nombre acordado, sin variaciones como Financier.
  assert.equal(await page.locator('#appBrand').innerText(), 'Financer');
  // Distingue la entrega V2 de la rama editable V0 que se utiliza para desarrollarla.
  assert.equal(await page.locator('#appVersion').innerText(), 'V2');
  // Identifica esta revisión concreta de V2 para detectar una página antigua al comprobarla.
  assert.equal(await page.locator('#appRevision').innerText(), 'Revisión 2026-11-10.1');
  // No atribuye la rama V0 al dominio ficticio del test: muestra el sitio realmente abierto.
  assert.equal(await page.locator('#appEnvironment').innerText(), 'Sitio: financer.test');
  // Verifica que no se muestra contenido privado sin autenticar.
  assert.equal(await page.locator('.app').isVisible(), false);
  // Intenta entrar con contraseña errónea para cubrir el flujo de rechazo.
  await login(page, 'a@example.invalid', 'incorrecta');
  // Exige un mensaje recuperable tras el rechazo de credenciales.
  await page.getByText('No se ha podido iniciar sesión.', { exact: false }).waitFor();
  // Repite el acceso con los datos de prueba válidos.
  await login(page);
  // Espera la aplicación visible como confirmación de carga después de verificar usuario.
  await page.locator('.app').waitFor({ state: 'visible' });
  // Mantiene visible la identificación después de cambiar del acceso a las pantallas privadas.
  assert.equal(await page.locator('#appIdentity').isVisible(), true);
  // Recorre las secciones principales para detectar regresiones de navegación.
  for (const [key, title] of [['liquidez', 'Liquidez'], ['inversiones', 'Inversiones'], ['resultados', 'Resultados'], ['gastos', 'Gastos'], ['objetivos', 'Objetivos'], ['patrimonio', 'Patrimonio total']]) {
    // Pulsa cada sección y comprueba que su título coincide con el destino.
    await menu(page, key); assert.equal(await page.locator('#heading').innerText(), title);
  // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
  }
  // Abre Inversiones para iniciar la prueba de profundidad de categorías.
  await menu(page, 'inversiones');
  // Selecciona Crypto desde un botón generado a partir de sus registros.
  await page.locator('#content .item-name').filter({ hasText: 'Crypto' }).click();
  // Define cinco subniveles para demostrar que no se corta el árbol a un solo nivel.
  for (const nombre of ['Pools de Liquidez', 'Subcategoría', 'Nivel 3', 'Nivel 4', 'Nivel 5']) {
    // Crea cada nivel por formulario y espera confirmación antes de avanzar.
    await page.locator('#addButton').click(); await guardar(page, nombre); await esperarGuardado(page);
    // Abre la categoría recién creada para añadir el siguiente nivel dentro de ella.
    await page.locator('#content .item-name').filter({ hasText: nombre }).click();
  // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
  }
  // Recarga el navegador para comprobar restauración de sesión y ruta guardada.
  await page.reload();
  // Espera la carga autenticada para no comprobar un título provisional.
  await page.locator('.app').waitFor({ state: 'visible' });
  // Exige que se recupere el destino más profundo, no solo la página principal.
  assert.equal(await page.locator('#heading').innerText(), 'Nivel 5');
  // Comprueba que el camino conserva también los antecesores de la estrategia.
  assert.match(await page.locator('#breadcrumb').innerText(), /Pools de Liquidez/);
  // Borra una hoja; cancelar no debe escribir.
  // Vuelve al padre de la hoja para comprobar sus acciones de borrado.
  await page.locator('#breadcrumb button').filter({ hasText: 'Nivel 4' }).click();
  // Guarda el contador previo para demostrar que cancelar no envía escrituras.
  const anterior = api.escrituras;
  // Cancela la próxima confirmación nativa de borrado.
  page.once('dialog', d => d.dismiss());
  // Activa Eliminar por su botón real, sin invocar directamente funciones privadas.
  await page.locator('#content .danger').click();
  // Confirma que la cancelación dejó intacto el contador de escrituras.
  assert.equal(api.escrituras, anterior);
  // Acepta la siguiente confirmación para probar un borrado autorizado por el usuario ficticio.
  page.once('dialog', d => d.accept());
  // Pulsa de nuevo el botón para comprobar la operación completa.
  await page.locator('#content .danger').click();
  // Espera el mensaje de eliminación confirmada antes de comprobar persistencia.
  await page.getByText('Eliminado correctamente.', { exact: true }).waitFor();
  // Recarga y espera para verificar que la hoja no reaparece después de la lectura.
  await page.reload(); await page.locator('.app').waitFor({ state: 'visible' });
  // Exige una lista vacía porque se eliminó su único descendiente.
  assert.equal(await page.locator('#content .item').count(), 0);
  // No permite borrar un padre con hijos.
  // Regresa a Inversiones para intentar borrar un padre que todavía tiene hijos.
  await page.locator('#breadcrumb button').filter({ hasText: 'Inversiones' }).click();
  // Pulsa Eliminar en la categoría que contiene la estructura de prueba.
  await page.locator('#content .danger').click();
  // Exige un rechazo comprensible antes de borrar una rama con subcategorías.
  await page.getByText('Esta categoría contiene subcategorías.', { exact: false }).waitFor();
  // Editar se muestra como texto: nunca se ejecuta HTML introducido.
  // Abre el editor de una categoría para comprobar nombres con caracteres HTML.
  await page.locator('#content .secondary').click();
  // Define un nombre malicioso ficticio que nunca debe interpretarse como una imagen.
  const nombreXSS = '<img src=x onerror="window.testXSS=1">';
  // Guarda el nombre mediante la UI y exige confirmación normal de la operación.
  await guardar(page, nombreXSS); await esperarGuardado(page);
  // Comprueba que el nombre no creó etiquetas img dentro del contenido.
  assert.equal(await page.locator('#content img').count(), 0);
  // Comprueba que el atributo malicioso no ejecutó código en la ventana.
  assert.equal(await page.evaluate(() => window.testXSS), undefined);
  // Plataformas globales, duplicados y operaciones sin confirmar.
  // Abre el catálogo común para comprobar plataformas independientes del árbol.
  await menu(page, 'plataformas');
  // Crea una plataforma ficticia y espera su confirmación.
  await page.locator('#addButton').click(); await guardar(page, 'Compartida'); await esperarGuardado(page);
  // Intenta repetirla con diferencias de espacios y mayúsculas para probar normalización.
  await page.locator('#addButton').click(); await guardar(page, ' compartida ');
  // Exige que el duplicado se detecte en el formulario.
  await page.getByText('Ya existe un elemento', { exact: false }).waitFor();
  // Cancela esa edición sin guardar un segundo registro.
  await page.locator('#cancel').click();
  // Activa la respuesta de cero filas para probar falsos éxitos de actualización.
  api.ceroFilas = true;
  // Intenta editar una plataforma cuando el servidor simulado no confirmará ninguna fila.
  await page.locator('#content .secondary').click(); await guardar(page, 'Otro nombre');
  // Exige un mensaje de falta de confirmación, no de éxito.
  await page.getByText('No se ha confirmado el cambio.', { exact: false }).waitFor();
  // Devuelve el servidor ficticio a su comportamiento normal para continuar.
  api.ceroFilas = false;
  // Cierra el intento fallido conservando la plataforma anterior.
  await page.locator('#cancel').click();
  // Activa un fallo genérico de escritura para probar recuperación del formulario.
  api.falloEscritura = true;
  // Intenta editar y provoca el error controlado de guardado.
  await page.locator('#content .secondary').click(); await guardar(page, 'Otro nombre');
  // Exige que el mensaje no exponga el detalle interno del fallo ficticio.
  await page.getByText('No se ha podido confirmar el guardado.', { exact: false }).waitFor();
  // Retira el fallo para comprobar un reintento desde el mismo formulario.
  api.falloEscritura = false;
  // Guarda el nombre corregido y espera el éxito sin cerrar ni rehacer el editor a mano.
  await guardar(page, 'Compartida actualizada'); await esperarGuardado(page);
  // Marca la plataforma como dependiente de otros registros para simular una clave foránea.
  api.protegidos.add(api.tablas.plataformas[0].id);
  // Acepta el diálogo de confirmación: aun así el servidor deberá rechazar el borrado.
  page.once('dialog', d => d.accept());
  // Solicita eliminar por el botón para cubrir la traducción del error de relación.
  await page.locator('#content .danger').click();
  // Exige un aviso de dependencias en vez de ocultar el rechazo.
  await page.getByText('Este elemento tiene categorías', { exact: false }).waitFor();
  // Comprueba que la fila continúa visible después del borrado fallido.
  assert.equal(await page.locator('#content .item').count(), 1);
  // Retira la restricción ficticia para que no contamine los escenarios posteriores.
  api.protegidos.clear();
  // Recarga el catálogo y espera la sesión para comprobar el nombre realmente persistido en la simulación.
  await page.reload(); await page.locator('.app').waitFor({ state: 'visible' });
  // Confirma que la edición se conserva tras reconstruir los datos de pantalla.
  assert.equal(await page.locator('#content .item-label').innerText(), 'Compartida actualizada');
  // El fallo de carga deja visibles reintento y cierre de sesión.
  // Provoca un error de lectura para comprobar que actualizar no deja contenido parcial.
  api.falloLectura = true;
  // Solicita recarga por el control visible del usuario.
  await page.locator('#refreshButton').click();
  // Espera que se identifique un problema de carga distinto de una contraseña incorrecta.
  await page.getByRole('heading', { name: 'No se han podido cargar los datos' }).waitFor();
  // Exige que no queden filas antiguas que aparenten una carga correcta.
  assert.equal(await page.locator('#content .item').count(), 0);
  // Restablece la lectura para permitir recuperación sin salir de la sesión.
  api.falloLectura = false;
  // Repite Actualizar datos en vez de volver a enviar credenciales.
  await page.locator('#refreshButton').click();
  // Espera que vuelva la plataforma después de recuperar la conexión simulada.
  await page.locator('#content .item-label').waitFor();
  // Detecta desbordamiento horizontal que dificultaría el uso en móvil.
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  // Crea una carpeta ignorada por Git para capturas de datos ficticios.
  fs.mkdirSync(path.join(raiz, 'test-results'), { recursive: true });
  // Guarda una captura por ancho para poder revisar el resultado visual.
  await page.screenshot({ path: path.join(raiz, 'test-results', 'plataformas-' + ancho + '.png'), fullPage: true });
  // Cambio de cuenta en la misma pestaña: no conserva datos ni ruta de A.
  // Simula un cambio de cuenta usando Auth real del SDK y un usuario ficticio distinto.
  await page.evaluate(() => Financer.cliente.auth.signInWithPassword({ email: 'b@example.invalid', password: 'solo-prueba' }));
  // Espera el inicio de la nueva interfaz para no leer la pantalla de la cuenta anterior.
  await page.locator('#heading').filter({ hasText: 'Patrimonio total' }).waitFor();
  // Comprueba que el contenido de A no continúa visible al entrar como B.
  assert.equal(await page.locator('#content').innerText().then(t => t.includes('Compartida actualizada')), false);
  // Abre la rama de inversiones de la nueva cuenta.
  await menu(page, 'inversiones');
  // Exige el registro exclusivo de B como prueba del cambio de propietario.
  await page.getByRole('button', { name: 'Solo usuario B ›', exact: true }).waitFor();
  // Comprueba que no se mezcló el nombre modificado por A con los datos de B.
  assert.equal(await page.locator('#content').innerText().then(t => t.includes(nombreXSS)), false);
  // Una salida en otra pestaña limpia la primera.
  // Abre otra pestaña que comparte la sesión para probar sincronización de salida.
  const otra = await context.newPage(); await otra.goto(ORIGEN);
  // Espera que la segunda pestaña haya comprobado y mostrado la cuenta actual.
  await otra.locator('.app').waitFor({ state: 'visible' });
  // Solicita salir desde esa otra pestaña, como haría el propietario.
  await otra.locator('#logoutButton').click();
  // Exige que la primera pestaña reciba la salida y vuelva al acceso.
  await page.locator('#loginScreen').waitFor({ state: 'visible' });
  // Comprueba que la zona de registros se vacía después de la salida entre pestañas.
  assert.equal(await page.locator('#content').innerText(), '');
  // Comprueba que tampoco persiste el submenú privado de inversiones.
  assert.equal(await page.locator('#investmentNav').innerText(), '');
  // Comprueba que el editor fuera de la aplicación no retiene nombres anteriores.
  assert.equal(await page.locator('#itemName').inputValue(), '');
  // Exige que el recorrido completo no haya generado excepciones JavaScript.
  assert.deepEqual(errores, []);
  // Exige que no escapase ninguna solicitud a destinos ajenos a la API interceptada.
  assert.deepEqual(api.externas, []);
  // Cierra páginas y almacenamiento para que la siguiente resolución empiece limpia.
  await context.close();
  // Deja un resultado legible de la resolución que ha superado el recorrido completo.
  console.log('PASS navegador: ' + ancho + ' px, SDK real y API simulada');
// Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
}
// Arranca las pruebas asíncronas manteniendo su cierre y captura de errores centralizados.
(async () => {
  // Ejecuta Chromium sin ventana para poder comprobarlo también en GitHub Actions.
  const options = { headless: true };
  // Permite reutilizar Chromium instalado en el entorno en lugar de descargar otro.
  if (process.env.CHROMIUM_PATH) options.executablePath = process.env.CHROMIUM_PATH;
  // Inicia el navegador con las opciones elegidas y una sola instancia compartida.
  const browser = await chromium.launch(options);
  // Garantiza que la instancia se cerrará incluso si falla alguna comprobación.
  try {
    // Repite el recorrido en ordenador y móvil, sin dar una resolución por equivalente a otra.
    for (const ancho of [1280, 390]) await pruebasNavegacion(browser, ancho);
    // Crea un escenario independiente para la caída del CDN.
    const api = escenario();
    // Aísla un contexto cuya interceptación bloqueará expresamente la librería del CDN.
    const context = await browser.newContext(); await interceptar(context, api, true);
    // Abre la aplicación para comprobar su arranque sin SDK disponible.
    const page = await context.newPage(); await page.goto(ORIGEN);
    // Exige un mensaje claro de conexión fallida en lugar de una pantalla en blanco.
    await page.getByText('No se ha podido cargar la conexión.', { exact: false }).waitFor();
    // Conserva versión y nombre aunque el CDN de Supabase falle, para identificar la web abierta.
    assert.equal(await page.locator('#appVersion').innerText(), 'V2');
    // La identificación pública no depende de que pueda verificarse una cuenta.
    assert.equal(await page.locator('#appIdentity').isVisible(), true);
    // No permite enviar credenciales cuando falta el cliente inicializado.
    assert.equal(await page.locator('#loginSubmit').isDisabled(), true);
    // Comprueba que el usuario conserva un camino de reintento visible.
    assert.equal(await page.locator('#retryAccess').isVisible(), true);
    // Libera el contexto de CDN caído antes del siguiente escenario.
    await context.close();
    // Registra que el caso de arranque sin librería se recupera de forma comprensible.
    console.log('PASS navegador: CDN no disponible muestra reintento');
    // Prepara otra cuenta aislada con red simulada para probar almacenamiento restringido.
    const restringido = await browser.newContext(); await interceptar(restringido, escenario());
    // Bloquea solo sessionStorage para demostrar que la navegación no debe depender de él.
    await restringido.addInitScript(() => Object.defineProperty(window, 'sessionStorage', { get() { throw new Error('Almacenamiento de navegación bloqueado'); } }));
    // Abre la aplicación con esa restricción activa desde antes de cargar los scripts.
    const sinAlmacen = await restringido.newPage(); await sinAlmacen.goto(ORIGEN);
    // Entra por formulario para comprobar que la restricción no bloquea el acceso.
    await sinAlmacen.locator('#loginScreen').waitFor({ state: 'visible' }); await login(sinAlmacen);
    // Abre Liquidez desde el menú pese a no poder guardar la preferencia de ruta.
    await sinAlmacen.locator('.app').waitFor({ state: 'visible' }); await menu(sinAlmacen, 'liquidez');
    // Comprueba que la navegación llegó al destino solicitado.
    assert.equal(await sinAlmacen.locator('#heading').innerText(), 'Liquidez');
    // Libera el contexto de almacenamiento restringido.
    await restringido.close();
    // Registra que el almacenamiento opcional de navegación no es un requisito de uso.
    console.log('PASS navegador: navegación sin sessionStorage');
    // Aísla la última prueba para provocar una escritura que termina después de salir.
    const lento = await browser.newContext();
    // Instala una API nueva cuyo retraso se controla desde la prueba.
    const apiLenta = escenario(); await interceptar(lento, apiLenta);
    // Abre una pestaña nueva antes de iniciar el caso de respuesta tardía.
    const p = await lento.newPage(); await p.goto(ORIGEN);
    // Completa el acceso ficticio para poder enviar una escritura autenticada simulada.
    await p.locator('#loginScreen').waitFor({ state: 'visible' }); await login(p);
    // Abre Plataformas, donde se creará el registro de respuesta tardía.
    await p.locator('.app').waitFor({ state: 'visible' }); await menu(p, 'plataformas');
    // Abre el editor real para iniciar la escritura mediante la interfaz.
    await p.locator('#addButton').click();
    // Retrasa medio segundo la confirmación, sin esperar durante una operación real.
    apiLenta.demora = 500;
    // Prepara la espera de la respuesta POST para comprobar el estado después de que llegue.
    const respuestaPendiente = p.waitForResponse(r => r.url().includes('/rest/v1/plataformas') && r.request().method() === 'POST');
    // Envía el registro mientras todavía está activa la primera sesión.
    await guardar(p, 'Guardado de la sesión anterior');
    // Verifica que Guardar queda bloqueado y no puede duplicar el envío.
    assert.equal(await p.locator('#editorForm [type=submit]').isDisabled(), true);
    // Simula la salida de Auth durante una petición ya enviada.
    // Solicita salida a Auth durante la petición ya enviada, como un evento de otra pestaña.
    await p.evaluate(() => Financer.cliente.auth.signOut());
    // Espera la respuesta antigua para comprobar que no vuelve a pintar datos privados.
    await respuestaPendiente;
    // Comprueba que la pantalla vigente sigue siendo la de acceso.
    await p.locator('#loginScreen').waitFor({ state: 'visible' });
    // Exige que la respuesta tardía no haya restaurado filas en la pantalla.
    assert.equal(await p.locator('#content').innerText(), '');
    // Exige que la limpieza del editor siga vigente después de recibir la respuesta.
    assert.equal(await p.locator('#itemName').inputValue(), '');
    // Comprueba que tampoco se ha reabierto el diálogo de la sesión anterior.
    assert.equal(await p.locator('#editor').isVisible(), false);
    // Libera el contexto de demora para no dejar sesiones ficticias abiertas.
    await lento.close();
    // Registra el resultado del caso de respuesta obsoleta.
    console.log('PASS navegador: una respuesta antigua no restaura datos tras salir');
  // Cierra siempre el navegador, incluso si se interrumpe alguna prueba previa.
  } finally { await browser.close(); }
// Informa del fallo y devuelve estado no exitoso para que GitHub Actions no lo ignore.
})().catch(error => { console.error(error); process.exitCode = 1; });
