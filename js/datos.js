'use strict';
// V1.7: datos de prueba únicamente en memoria. Se pierden al recargar.
// El modelo permite crear nuevos tipos de inversión y bloques de liquidez.
const investmentTypes=['Bolsa','Crypto','Préstamos','Cuentas remuneradas'].map(name=>makeItem(name));
const liquidityTypes=['Cuentas bancarias','Efectivo'].map(name=>makeItem(name));
function makeItem(name){return {id:crypto.randomUUID(),name,children:[]}}
const $=id=>document.getElementById(id);
async function cargarBloquesSupabase() {
  const { data, error } = await supabaseClient
    .from('bloques')
    .select('id, nombre, bloque_padre_id')
    .order('nombre');

  if (error) {
    throw error;
  }

  return data;
}
