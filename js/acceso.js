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
async function comprobarAcceso() {
  const pantalla = document.getElementById('loginScreen');
  const aplicacion = document.querySelector('.app');

  aplicacion.hidden = true;

  const { data, error } = await supabaseClient.auth.getUser();

  if (!error && data.user) {
    pantalla.hidden = true;
    aplicacion.hidden = false;
  } else {
    pantalla.hidden = false;
  }
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const mensaje = document.getElementById('loginError');
  mensaje.textContent = '';

  try {
    await iniciarSesion(
      document.getElementById('loginEmail').value,
      document.getElementById('loginPassword').value
    );

    await comprobarAcceso();
  } catch (error) {
    mensaje.textContent = 'No se ha podido iniciar sesión. Comprueba tus datos.';
  }
});

comprobarAcceso();
