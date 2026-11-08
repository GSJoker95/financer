'use strict';

async function iniciarSesion(email, password) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data.user;
}

async function cerrarSesion() {
  const { error } = await supabaseClient.auth.signOut();
  if (error) throw error;
}
