// Encapsula la sesión para que sus variables no queden globales.
(function (app) {
  // Usa comprobaciones estrictas para detectar errores de asignación.
  'use strict';
  // Comparte una búsqueda breve de controles de acceso por su ID.
  const $ = id => document.getElementById(id);
  // Reutiliza el cliente configurado en un solo lugar.
  const cliente = app.cliente;
  // Numera las comprobaciones para descartar resultados de solicitudes anteriores.
  let turno = 0;
  // No considera verificada ninguna cuenta hasta consultar Auth.
  let usuarioActual = null;
  // Permite bloquear intentos de entrada repetidos mientras se autentica.
  let entrando = false;

  // Devuelve al acceso limpiando antes todo el contenido privado.
  function mostrarAcceso(mensaje = '') {
    // Vacía los datos y solicita borrar la ruta de la cuenta saliente.
    app.Interfaz.limpiar(true);
    // Retira la identidad que ya no debe considerarse activa.
    usuarioActual = null;
    // Oculta las pantallas con datos para impedir que se vean sin sesión válida.
    document.querySelector('.app').hidden = true;
    // Presenta el formulario con el que puede recuperarse el acceso.
    $('loginScreen').hidden = false;
    // Muestra el aviso indicado como texto, sin interpretar HTML.
    $('loginError').textContent = mensaje;
    // Limpia la contraseña para no dejarla escrita después de salir.
    $('loginPassword').value = '';
    // Retira el indicador de espera porque ya se puede interactuar.
    $('loadingScreen').hidden = true;
  // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
  }
  // Valida la cuenta con Auth y después carga sus datos.
  async function comprobarAcceso() {
    // Asigna una generación nueva a esta comprobación de acceso.
    const solicitud = ++turno;
    // Muestra espera mientras se verifica la identidad y la carga.
    $('loadingScreen').hidden = false;
    // Oculta temporalmente el formulario para no iniciar accesos simultáneos.
    $('loginScreen').hidden = true;
    // Oculta los datos anteriores mientras se comprueba quién está conectado.
    document.querySelector('.app').hidden = true;
    // Captura errores de red para presentar una recuperación comprensible.
    try {
      // Consulta el usuario al servicio Auth; no confía solo en datos locales.
      const { data, error } = await cliente.auth.getUser();
      // Ignora la respuesta si hubo otra comprobación o salida mientras esperaba.
      if (solicitud !== turno) return;
      // Distingue la ausencia de usuario válido de la carga de sus datos.
      if (error || !data?.user) {
        // Identifica falta de sesión y errores habituales de autorización.
        const sinSesion = !error || error.name === 'AuthSessionMissingError' || [400, 401, 403].includes(error.status);
        // Pide acceso sin alarma cuando no hay sesión, o explica el problema de conexión.
        mostrarAcceso(sinSesion ? '' : 'No se ha podido comprobar la sesión. Revisa tu conexión y vuelve a intentarlo.');
        // Termina porque no se deben consultar datos sin una cuenta verificada.
        return;
      // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
      }
      // Conserva el ID verificado para limitar el repositorio a su propietario.
      usuarioActual = data.user.id;
      // Retira contenido anterior antes de cargar registros de la cuenta validada.
      app.Interfaz.limpiar();
      // Construye un repositorio ligado a ese usuario, sin usar una clave privilegiada.
      const repo = app.Datos.crearRepositorio(cliente, usuarioActual);
      // Separa errores de carga de datos de errores de contraseña.
      try {
        // Espera categorías y plataformas del propietario verificado.
        const datos = await repo.cargar();
        // Descarta datos si la sesión cambió durante su descarga.
        if (solicitud !== turno) return;
        // Entrega a la interfaz datos y repositorio coherentes con la misma cuenta.
        app.Interfaz.iniciar(datos, repo, usuarioActual);
      // Permite recuperar la carga sin obligar a volver a introducir credenciales.
      } catch (errorCarga) {
        // Evita mostrar errores de una solicitud que ya quedó obsoleta.
        if (solicitud !== turno) return;
        // Vacía cualquier contenido parcial para no presentar datos incompletos como válidos.
        app.Interfaz.limpiar();
        // Identifica que el problema está en cargar datos, no necesariamente en iniciar sesión.
        $('heading').textContent = 'No se han podido cargar los datos';
        // Retira el subtítulo anterior para no mezclar estados de pantalla.
        $('subtitle').textContent = '';
        // Traduce el error sin volcar detalles privados del servidor.
        $('dataStatus').textContent = app.Datos.mensajeError(errorCarga,
          // Ofrece actualizar o cerrar sesión como caminos de recuperación.
          'Revisa tu conexión y pulsa «Actualizar datos». También puedes cerrar la sesión.');
      // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
      }
      // Oculta el acceso porque la identidad sí fue validada.
      $('loginScreen').hidden = true;
      // Muestra la aplicación o su mensaje de recuperación de datos.
      document.querySelector('.app').hidden = false;
    // Captura rechazos de red que no llegaron como un objeto de error de Auth.
    } catch {
      // Presenta el fallo solo si esta sigue siendo la comprobación más reciente.
      if (solicitud === turno) mostrarAcceso('No se ha podido comprobar la sesión. Revisa tu conexión y vuelve a intentarlo.');
    // Garantiza retirar la espera al terminar el intento vigente.
    } finally {
      // No modifica el indicador de otra comprobación posterior.
      if (solicitud === turno) $('loadingScreen').hidden = true;
    // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
    }
  // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
  }
  // Atiende el envío del formulario usando el cliente de Auth.
  $('loginForm').addEventListener('submit', async evento => {
    // Impide que el envío HTML recargue la página y pierda el estado.
    evento.preventDefault();
    // Rechaza duplicados o intentos cuando la librería no está disponible.
    if (entrando || !cliente) return;
    // Marca que hay una entrada pendiente para coordinar eventos de Auth.
    entrando = true;
    // Localiza el botón que se desactivará hasta terminar.
    const boton = $('loginSubmit');
    // Evita repetir la solicitud al pulsar varias veces Entrar.
    boton.disabled = true;
    // Retira el error anterior antes de comprobar las nuevas credenciales.
    $('loginError').textContent = '';
    // Gestiona el rechazo de credenciales sin exponer detalles internos.
    try {
      // Pide a Supabase autenticar correo y contraseña introducidos por el propietario.
      const { error } = await cliente.auth.signInWithPassword({
        // Limpia espacios del correo, conservando la contraseña exactamente como se escribió.
        email: $('loginEmail').value.trim(), password: $('loginPassword').value
      // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
      });
      // Interrumpe el flujo de éxito si Auth devolvió un error.
      if (error) throw error;
      // Borra la contraseña del formulario tras autenticarla.
      $('loginPassword').value = '';
      // Comprueba el usuario y carga sus registros antes de mostrar contenido privado.
      await comprobarAcceso();
    // Mantiene disponible el formulario cuando el acceso falla.
    } catch {
      // Explica causas generales sin revelar información de la cuenta.
      $('loginError').textContent = 'No se ha podido iniciar sesión. Comprueba tus datos y tu conexión.';
    // Libera siempre el bloqueo de entrada, incluso si falló la conexión.
    } finally {
      // Permite un nuevo intento después de finalizar el anterior.
      entrando = false;
      // Reactiva Entrar para que el usuario pueda corregir sus datos.
      boton.disabled = false;
    // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
    }
  // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
  });
  // Conecta el cierre solicitado desde el botón visible de la aplicación.
  $('logoutButton').addEventListener('click', async () => {
    // Obtiene el botón de salida para bloquear clics repetidos.
    const boton = $('logoutButton');
    // Impide lanzar varias salidas simultáneas.
    boton.disabled = true;
    // Conserva la pantalla si el servidor no confirma la salida.
    try {
      // Solicita al SDK cerrar la sesión y gestionar sus credenciales locales.
      const { error } = await cliente.auth.signOut();
      // No anuncia la salida si Supabase la rechazó.
      if (error) throw error;
      // Invalida las comprobaciones de cuenta que aún estuvieran pendientes.
      turno++;
      // Retira los datos privados y muestra el acceso después de confirmar la salida.
      mostrarAcceso();
    // Mantiene un aviso recuperable si no se ha podido cerrar sesión.
    } catch {
      // Pide revisar la conexión antes de volver a intentarlo.
      $('dataStatus').textContent = 'No se ha podido cerrar la sesión. Comprueba tu conexión e inténtalo de nuevo.';
    // Reactiva el botón al terminar, tanto en éxito como en error.
    } finally { boton.disabled = false; }
  // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
  });
  // Permite volver a verificar la cuenta y recargar datos con un solo botón.
  $('refreshButton').addEventListener('click', comprobarAcceso);
  // Conecta el reintento de acceso o de carga de la librería.
  $('retryAccess').addEventListener('click', () => {
    // Reutiliza la comprobación si el cliente ya está disponible.
    if (cliente) comprobarAcceso();
    // Recarga la página cuando hace falta descargar de nuevo el SDK.
    else window.location.reload();
  // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
  });
  // Detecta el caso de CDN ausente antes de llamar a métodos inexistentes.
  if (!cliente) {
    // Muestra una explicación y un camino de reintento en lugar de una pantalla vacía.
    mostrarAcceso('No se ha podido cargar la conexión. Comprueba tu conexión a Internet y pulsa «Reintentar».');
    // No ofrece enviar credenciales si no existe conexión inicializada.
    $('loginSubmit').disabled = true;
    // Termina este módulo sin ejecutar consultas sobre un cliente inexistente.
    return;
  // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
  }
  // Escucha cambios de sesión, incluidos los procedentes de otra pestaña.
  cliente.auth.onAuthStateChange((evento, sesion) => {
    // Callback síncrono: no esperar consultas Supabase dentro del bloqueo de Auth.
    // Reconoce una salida para limpiar contenido privado de inmediato.
    if (evento === 'SIGNED_OUT') {
      // Invalida respuestas que pudieran llegar después de la salida.
      turno++;
      // Limpia la interfaz sin esperar nuevas consultas dentro del callback de Auth.
      mostrarAcceso();
    // Reconoce una cuenta diferente para no conservar los datos del usuario anterior.
    } else if (evento === 'SIGNED_IN' && sesion?.user?.id !== usuarioActual) {
      // Descarta solicitudes de la identidad anterior antes de cargar la nueva.
      turno++;
      // Retira inmediatamente registros que no pertenecen a la nueva sesión.
      app.Interfaz.limpiar();
      // Mantiene los datos ocultos hasta verificar la cuenta entrante.
      document.querySelector('.app').hidden = true;
      // Informa de que el cambio de sesión está siendo comprobado.
      $('loadingScreen').hidden = false;
      // Difiere consultas fuera del bloqueo de Auth y evita duplicarlas durante un login explícito.
      setTimeout(() => { if (!entrando) comprobarAcceso(); }, 0);
    // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
    }
  // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
  });
  // Comprueba la sesión al abrir la aplicación, sin exigir entrar otra vez por una recarga.
  comprobarAcceso();
// Ejecuta el módulo en el espacio común de Financer sin publicar variables de sesión.
})(globalThis.Financer = globalThis.Financer || {});
