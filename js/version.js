// Aísla la identificación para mostrarla sin depender de la sesión o de Supabase.
(function (app) {
  // Activa las comprobaciones estrictas para evitar cambios globales accidentales.
  'use strict';
  // Centraliza nombre y versión; V2 es la entrega y V0 la rama donde se desarrolla.
  const version = Object.freeze({ nombre: 'Financer', entrega: 'V2', revision: '2026-11-10.1', rama: 'financer_V0' });
  // Identifica el sitio realmente abierto para no presentar cualquier vista previa como la rama V0.
  const sitio = window.location.hostname.toLowerCase();
  // Reconoce la dirección estable de trabajo que el propietario debe utilizar en sus comprobaciones.
  const esRamaTrabajo = sitio === 'financer-v0.financer-pruebas.pages.dev';
  // Distingue un servidor local de una web publicada sin consultar ningún servicio externo.
  const esLocal = ['localhost', '127.0.0.1', '[::1]'].includes(sitio);
  // Indica la rama solo cuando la dirección la identifica; las demás vistas conservan su nombre de sitio.
  const entorno = esRamaTrabajo ? 'Pruebas · ' + version.rama : esLocal ? 'Entorno local' : 'Sitio: ' + sitio;
  // Actualiza la pestaña para poder reconocer Financer y su versión entre otras webs abiertas.
  document.title = version.nombre + ' · ' + version.entrega;
  // Mantiene el nombre correcto en la cabecera pública, incluso antes de iniciar sesión.
  document.getElementById('appBrand').textContent = version.nombre;
  // Presenta la versión de la entrega que contiene este archivo, sin confundirla con la rama editable.
  document.getElementById('appVersion').textContent = version.entrega;
  // Muestra dónde se está utilizando esta entrega para distinguir enlaces de pruebas diferentes.
  document.getElementById('appEnvironment').textContent = entorno;
  // Permite distinguir esta actualización de otras que hayan reutilizado el nombre V2 con autorización.
  document.getElementById('appRevision').textContent = 'Revisión ' + version.revision;
  // Expone los datos de versión para mantener una única referencia en futuras pantallas.
  app.Version = version;
// Comparte solo los datos de identificación y conserva privadas las variables auxiliares.
})(globalThis.Financer = globalThis.Financer || {});
