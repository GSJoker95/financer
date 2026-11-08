'use strict';
// V1.7: datos de prueba únicamente en memoria. Se pierden al recargar.
// El modelo permite crear nuevos tipos de inversión y bloques de liquidez.
let investmentTypes = [];
let liquidityTypes = [];

async function actualizarBloques() {
  const bloques = await cargarBloquesSupabase();
  const organizados = organizarBloques(bloques);

  investmentTypes = organizados.inversiones;
  liquidityTypes = organizados.liquidez;

  recuperarNavegacion();
  render();
}
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
function organizarBloques(bloques) {
  const liquidez = bloques.find(
    b => b.nombre === 'Liquidez' && b.bloque_padre_id === null
  );

  const inversiones = bloques.find(
    b => b.nombre === 'Inversiones' && b.bloque_padre_id === null
  );

  if (!liquidez || !inversiones) {
    throw new Error('Faltan los bloques principales.');
  }

  return {
    liquidez: bloques
      .filter(b => b.bloque_padre_id === liquidez.id)
      .map(b => ({ id: b.id, name: b.nombre, children: [] })),

    inversiones: bloques
      .filter(b => b.bloque_padre_id === inversiones.id)
      .map(b => ({ id: b.id, name: b.nombre, children: [] }))
  };
}
async function crearBloque(nombre, bloquePadreId) {
  const { error } = await supabaseClient
    .from('bloques')
    .insert({
      nombre,
      bloque_padre_id: bloquePadreId
    });

  if (error) throw error;
}

async function renombrarBloque(id, nombre) {
  const { error } = await supabaseClient
    .from('bloques')
    .update({ nombre })
    .eq('id', id);

  if (error) throw error;
}

async function eliminarBloque(id) {
  const { error } = await supabaseClient
    .from('bloques')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
