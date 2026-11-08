(function (app) {
  'use strict';
  const url = 'https://ogjirfsvczulgnqjbubc.supabase.co';
  // Clave pública. La autorización efectiva se aplica en las políticas RLS.
  const clavePublica = 'sb_publishable_dCushuQGwyjjeo1_-QP-zw_ulcNmVhj';
  app.cliente = null;
  if (globalThis.supabase?.createClient) {
    try {
      app.cliente = globalThis.supabase.createClient(url, clavePublica);
    } catch {
      // acceso.js muestra un error recuperable sin volcar credenciales a consola.
    }
  }
})(globalThis.Financer = globalThis.Financer || {});
