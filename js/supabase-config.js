// Aísla URL y clave pública para no duplicar configuración entre scripts.
(function (app) {
  // Activa las reglas estrictas de JavaScript para este módulo.
  'use strict';
  // Señala el proyecto existente que utiliza la aplicación, sin crear otro servicio.
  const url = 'https://ogjirfsvczulgnqjbubc.supabase.co';
  // Clave pública. La autorización efectiva se aplica en las políticas RLS.
  // Define la clave pública del cliente; RLS determina qué registros autoriza el servidor.
  const clavePublica = 'sb_publishable_dCushuQGwyjjeo1_-QP-zw_ulcNmVhj';
  // Parte de un cliente ausente para que acceso.js pueda reconocer una carga fallida.
  app.cliente = null;
  // Comprueba que el CDN cargó la librería antes de utilizar sus métodos.
  if (globalThis.supabase?.createClient) {
    // Controla una inicialización fallida para mostrar después una recuperación comprensible.
    try {
      // Crea una única conexión cliente con el SDK y la configuración del proyecto.
      app.cliente = globalThis.supabase.createClient(url, clavePublica);
    // Captura un fallo de inicialización sin imprimir credenciales o datos privados.
    } catch {
      // acceso.js muestra un error recuperable sin volcar credenciales a consola.
    // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
    }
  // Cierra el bloque anterior para delimitar su ámbito y su flujo de ejecución.
  }
// Publica el cliente dentro de Financer, manteniendo privada su configuración local.
})(globalThis.Financer = globalThis.Financer || {});
