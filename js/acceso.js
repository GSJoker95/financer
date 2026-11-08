(function (app) {
  'use strict';
  const $ = id => document.getElementById(id);
  const cliente = app.cliente;
  let turno = 0;
  let usuarioActual = null;
  let entrando = false;

  function mostrarAcceso(mensaje = '') {
    app.Interfaz.limpiar(true);
    usuarioActual = null;
    document.querySelector('.app').hidden = true;
    $('loginScreen').hidden = false;
    $('loginError').textContent = mensaje;
    $('loginPassword').value = '';
    $('loadingScreen').hidden = true;
  }
  async function comprobarAcceso() {
    const solicitud = ++turno;
    $('loadingScreen').hidden = false;
    $('loginScreen').hidden = true;
    document.querySelector('.app').hidden = true;
    try {
      const { data, error } = await cliente.auth.getUser();
      if (solicitud !== turno) return;
      if (error || !data?.user) {
        const sinSesion = !error || error.name === 'AuthSessionMissingError' || [400, 401, 403].includes(error.status);
        mostrarAcceso(sinSesion ? '' : 'No se ha podido comprobar la sesión. Revisa tu conexión y vuelve a intentarlo.');
        return;
      }
      usuarioActual = data.user.id;
      app.Interfaz.limpiar();
      const repo = app.Datos.crearRepositorio(cliente, usuarioActual);
      try {
        const datos = await repo.cargar();
        if (solicitud !== turno) return;
        app.Interfaz.iniciar(datos, repo, usuarioActual);
      } catch (errorCarga) {
        if (solicitud !== turno) return;
        app.Interfaz.limpiar();
        $('heading').textContent = 'No se han podido cargar los datos';
        $('subtitle').textContent = '';
        $('dataStatus').textContent = app.Datos.mensajeError(errorCarga,
          'Revisa tu conexión y pulsa «Actualizar datos». También puedes cerrar la sesión.');
      }
      $('loginScreen').hidden = true;
      document.querySelector('.app').hidden = false;
    } catch {
      if (solicitud === turno) mostrarAcceso('No se ha podido comprobar la sesión. Revisa tu conexión y vuelve a intentarlo.');
    } finally {
      if (solicitud === turno) $('loadingScreen').hidden = true;
    }
  }
  $('loginForm').addEventListener('submit', async evento => {
    evento.preventDefault();
    if (entrando || !cliente) return;
    entrando = true;
    const boton = $('loginSubmit');
    boton.disabled = true;
    $('loginError').textContent = '';
    try {
      const { error } = await cliente.auth.signInWithPassword({
        email: $('loginEmail').value.trim(), password: $('loginPassword').value
      });
      if (error) throw error;
      $('loginPassword').value = '';
      await comprobarAcceso();
    } catch {
      $('loginError').textContent = 'No se ha podido iniciar sesión. Comprueba tus datos y tu conexión.';
    } finally {
      entrando = false;
      boton.disabled = false;
    }
  });
  $('logoutButton').addEventListener('click', async () => {
    const boton = $('logoutButton');
    boton.disabled = true;
    try {
      const { error } = await cliente.auth.signOut();
      if (error) throw error;
      turno++;
      mostrarAcceso();
    } catch {
      $('dataStatus').textContent = 'No se ha podido cerrar la sesión. Comprueba tu conexión e inténtalo de nuevo.';
    } finally { boton.disabled = false; }
  });
  $('refreshButton').addEventListener('click', comprobarAcceso);
  $('retryAccess').addEventListener('click', () => {
    if (cliente) comprobarAcceso();
    else window.location.reload();
  });
  if (!cliente) {
    mostrarAcceso('No se ha podido cargar la conexión. Comprueba tu conexión a Internet y pulsa «Reintentar».');
    $('loginSubmit').disabled = true;
    return;
  }
  cliente.auth.onAuthStateChange((evento, sesion) => {
    // Callback síncrono: no esperar consultas Supabase dentro del bloqueo de Auth.
    if (evento === 'SIGNED_OUT') {
      turno++;
      mostrarAcceso();
    } else if (evento === 'SIGNED_IN' && sesion?.user?.id !== usuarioActual) {
      turno++;
      app.Interfaz.limpiar();
      document.querySelector('.app').hidden = true;
      $('loadingScreen').hidden = false;
      setTimeout(() => { if (!entrando) comprobarAcceso(); }, 0);
    }
  });
  comprobarAcceso();
})(globalThis.Financer = globalThis.Financer || {});
