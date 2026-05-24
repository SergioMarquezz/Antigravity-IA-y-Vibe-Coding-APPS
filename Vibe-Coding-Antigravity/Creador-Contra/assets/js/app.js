/**
 * Generador de Contraseñas Seguras
 * ─────────────────────────────────
 * Tecnología : JavaScript Nativo (ES6+)
 * Sin frameworks · Sin librerías externas
 * Feedback visual mediante textContent / appendChild
 */

'use strict';

/* ═══════════════════════════════════════════════════════════
   CONSTANTES DE CARACTERES
   ═══════════════════════════════════════════════════════════ */
const CHARS = {
  mayusculas: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  minusculas: 'abcdefghijklmnopqrstuvwxyz',
  numeros:    '0123456789',
  especiales: '!@#$%^&*()-_=+[]{}<>?/|~'
};

/* ═══════════════════════════════════════════════════════════
   REFERENCIAS AL DOM
   ═══════════════════════════════════════════════════════════ */
const elems = {
  // Campo de contraseña
  campoContrasena:   document.getElementById('campoContrasena'),
  passwordText:      document.getElementById('passwordText'),

  // Controles de longitud
  sliderLongitud:    document.getElementById('sliderLongitud'),
  displayLongitud:   document.getElementById('displayLongitud'),

  // Checkboxes
  chkMayusculas:     document.getElementById('chkMayusculas'),
  chkMinusculas:     document.getElementById('chkMinusculas'),
  chkNumeros:        document.getElementById('chkNumeros'),
  chkEspeciales:     document.getElementById('chkEspeciales'),

  // Acciones sobre la contraseña
  btnVerOcultar:     document.getElementById('btnVerOcultar'),
  btnCopiar:         document.getElementById('btnCopiar'),
  btnDescargar:      document.getElementById('btnDescargar'),

  // Botón generar
  btnGenerar:        document.getElementById('btnGenerar'),
  btnGenerarText:    document.getElementById('btnGenerarText'),
  btnGenerarSpinner: document.getElementById('btnGenerarSpinner'),

  // Fortaleza
  strengthValue:     document.getElementById('strengthValue'),
  strengthSegments:  document.querySelectorAll('.strength-segment'),

  // Toast
  toastEl:           document.getElementById('toastNotificacion'),
  toastMensaje:      document.getElementById('toastMensaje'),

  // Alerta de error
  alertaError:       document.getElementById('alertaError'),
  alertaMensaje:     document.getElementById('alertaMensaje'),
};

/* ═══════════════════════════════════════════════════════════
   ESTADO INTERNO
   ═══════════════════════════════════════════════════════════ */
let estado = {
  contrasena:  '',
  visible:     false,
};

/* ═══════════════════════════════════════════════════════════
   BOOTSTRAP TOAST
   ═══════════════════════════════════════════════════════════ */
const bsToast = new bootstrap.Toast(elems.toastEl, { delay: 3000 });

function mostrarToast(mensaje, icono = '✅') {
  // Limpiar y construir el mensaje con textContent
  elems.toastMensaje.textContent = '';
  const span = document.createElement('span');
  span.textContent = icono + ' ' + mensaje;
  elems.toastMensaje.appendChild(span);
  bsToast.show();
}

/* ═══════════════════════════════════════════════════════════
   ALERTA DE ERROR
   ═══════════════════════════════════════════════════════════ */
function mostrarError(mensaje) {
  elems.alertaMensaje.textContent = mensaje;
  elems.alertaError.classList.remove('d-none');
}

function ocultarError() {
  elems.alertaError.classList.add('d-none');
  elems.alertaMensaje.textContent = '';
}

/* ═══════════════════════════════════════════════════════════
   SLIDER DE LONGITUD
   ═══════════════════════════════════════════════════════════ */
function actualizarDisplayLongitud(valor) {
  elems.displayLongitud.textContent = valor;

  // Actualizar el relleno visual del track con gradiente CSS
  const min = Number(elems.sliderLongitud.min);
  const max = Number(elems.sliderLongitud.max);
  const pct = ((valor - min) / (max - min)) * 100;
  elems.sliderLongitud.style.background =
    `linear-gradient(to right, var(--color-primary) ${pct}%, rgba(255,255,255,0.08) ${pct}%)`;
}

elems.sliderLongitud.addEventListener('input', () => {
  actualizarDisplayLongitud(elems.sliderLongitud.value);
});

// Inicializar
actualizarDisplayLongitud(elems.sliderLongitud.value);

/* ═══════════════════════════════════════════════════════════
   GENERACIÓN DE CONTRASEÑA SEGURA
   ═══════════════════════════════════════════════════════════ */

/**
 * Genera un número entero aleatorio criptográficamente seguro
 * en el rango [0, max)
 */
function randomSeguro(max) {
  const array = new Uint32Array(1);
  let resultado;
  do {
    crypto.getRandomValues(array);
    resultado = array[0];
  } while (resultado >= Math.floor(0xFFFFFFFF / max) * max);
  return resultado % max;
}

/**
 * Mezcla un array de forma aleatoria criptográficamente segura
 * Algoritmo: Fisher-Yates
 */
function mezclarArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomSeguro(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Genera la contraseña con los parámetros actuales
 * @returns {string|null} La contraseña generada o null si hay error
 */
function generarContrasena() {
  const longitud     = Number(elems.sliderLongitud.value);
  const usaMayu      = elems.chkMayusculas.checked;
  const usaMini      = elems.chkMinusculas.checked;
  const usaNums      = elems.chkNumeros.checked;
  const usaEspec     = elems.chkEspeciales.checked;

  // Validar que al menos una opción esté activa
  if (!usaMayu && !usaMini && !usaNums && !usaEspec) {
    mostrarError('Debes seleccionar al menos un tipo de carácter para generar la contraseña.');
    return null;
  }

  ocultarError();

  // Construir el pool de caracteres
  let pool = '';
  const garantizados = [];  // Al menos un char de cada tipo activo

  if (usaMayu) {
    pool += CHARS.mayusculas;
    garantizados.push(CHARS.mayusculas[randomSeguro(CHARS.mayusculas.length)]);
  }
  if (usaMini) {
    pool += CHARS.minusculas;
    garantizados.push(CHARS.minusculas[randomSeguro(CHARS.minusculas.length)]);
  }
  if (usaNums) {
    pool += CHARS.numeros;
    garantizados.push(CHARS.numeros[randomSeguro(CHARS.numeros.length)]);
  }
  if (usaEspec) {
    pool += CHARS.especiales;
    garantizados.push(CHARS.especiales[randomSeguro(CHARS.especiales.length)]);
  }

  // Completar el resto de la longitud con chars aleatorios del pool
  const resto = [];
  const faltantes = longitud - garantizados.length;
  for (let i = 0; i < faltantes; i++) {
    resto.push(pool[randomSeguro(pool.length)]);
  }

  // Unir y mezclar para evitar que los garantizados queden siempre al inicio
  const todosChars = mezclarArray([...garantizados, ...resto]);
  return todosChars.join('');
}

/* ═══════════════════════════════════════════════════════════
   CÁLCULO DE FORTALEZA
   ═══════════════════════════════════════════════════════════ */

/**
 * Calcula la entropía aproximada en bits
 * H = L * log2(N)  donde N = tamaño del pool de caracteres
 */
function calcularFortaleza(contrasena) {
  if (!contrasena) return { nivel: 0, etiqueta: '—', clase: '' };

  // Detectar qué grupos usa la contraseña
  let N = 0;
  if (/[A-Z]/.test(contrasena)) N += 26;
  if (/[a-z]/.test(contrasena)) N += 26;
  if (/[0-9]/.test(contrasena)) N += 10;
  if (/[^A-Za-z0-9]/.test(contrasena)) N += 32;

  const L = contrasena.length;
  const entropia = L * Math.log2(N || 1);

  if (entropia < 28)  return { nivel: 1, etiqueta: 'Muy débil',   clase: 'strength-muy-debil',  segClass: 'filled-muy-debil'  };
  if (entropia < 36)  return { nivel: 2, etiqueta: 'Débil',       clase: 'strength-debil',      segClass: 'filled-debil'      };
  if (entropia < 60)  return { nivel: 3, etiqueta: 'Media',       clase: 'strength-media',      segClass: 'filled-media'      };
  if (entropia < 80)  return { nivel: 4, etiqueta: 'Fuerte',      clase: 'strength-fuerte',     segClass: 'filled-fuerte'     };
                      return { nivel: 5, etiqueta: 'Muy fuerte',  clase: 'strength-muy-fuerte', segClass: 'filled-muy-fuerte' };
}

/**
 * Actualiza la UI de fortaleza
 */
function actualizarFortaleza(contrasena) {
  const { nivel, etiqueta, clase, segClass } = calcularFortaleza(contrasena);

  // Etiqueta de texto
  elems.strengthValue.textContent = etiqueta;
  elems.strengthValue.className = 'strength-value fw-bold ' + (clase || '');

  // Segmentos de la barra
  elems.strengthSegments.forEach((seg, idx) => {
    seg.className = 'strength-segment';
    if (idx < nivel) {
      seg.classList.add(segClass);
    }
  });
}

/* ═══════════════════════════════════════════════════════════
   MOSTRAR / OCULTAR CONTRASEÑA EN EL CAMPO
   ═══════════════════════════════════════════════════════════ */
function renderizarContrasena() {
  const pwText = elems.passwordText;
  pwText.textContent = '';

  if (!estado.contrasena) {
    pwText.classList.add('placeholder-text');
    pwText.textContent = 'Tu contraseña aparecerá aquí...';
    return;
  }

  pwText.classList.remove('placeholder-text');

  if (estado.visible) {
    pwText.textContent = estado.contrasena;
  } else {
    // Mostrar caracteres enmascarados
    pwText.textContent = '•'.repeat(estado.contrasena.length);
  }
}

function toggleVisibilidad() {
  estado.visible = !estado.visible;

  // Actualizar icono del botón
  const icono = elems.btnVerOcultar.querySelector('i');
  icono.className = estado.visible ? 'bi bi-eye-slash' : 'bi bi-eye';

  // Tooltip dinámico
  elems.btnVerOcultar.title = estado.visible ? 'Ocultar contraseña' : 'Mostrar contraseña';

  renderizarContrasena();
}

elems.btnVerOcultar.addEventListener('click', () => {
  if (!estado.contrasena) {
    mostrarError('Primero genera una contraseña.');
    return;
  }
  toggleVisibilidad();
});

/* ═══════════════════════════════════════════════════════════
   COPIAR AL PORTAPAPELES
   ═══════════════════════════════════════════════════════════ */
elems.btnCopiar.addEventListener('click', async () => {
  if (!estado.contrasena) {
    mostrarError('No hay ninguna contraseña para copiar. Genera una primero.');
    return;
  }

  try {
    await navigator.clipboard.writeText(estado.contrasena);

    // Feedback visual momentáneo en el botón
    const icono = elems.btnCopiar.querySelector('i');
    const claseOriginal = icono.className;
    icono.className = 'bi bi-check-lg';
    elems.btnCopiar.classList.add('btn-icon-success');
    elems.btnCopiar.title = '¡Copiado!';

    mostrarToast('Contraseña copiada al portapapeles', '📋');

    setTimeout(() => {
      icono.className = claseOriginal;
      elems.btnCopiar.classList.remove('btn-icon-success');
      elems.btnCopiar.title = 'Copiar contraseña';
    }, 2000);

  } catch {
    mostrarError('No se pudo copiar la contraseña. Por favor, cópiala manualmente.');
  }
});

/* ═══════════════════════════════════════════════════════════
   DESCARGAR CONTRASEÑA
   ═══════════════════════════════════════════════════════════ */
elems.btnDescargar.addEventListener('click', () => {
  if (!estado.contrasena) {
    mostrarError('No hay ninguna contraseña para descargar. Genera una primero.');
    return;
  }

  // Construir el contenido del archivo
  const ahora       = new Date();
  const fechaStr    = ahora.toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'medium' });
  const longitud    = estado.contrasena.length;

  const lineas = [
    '===========================================',
    '  GENERADOR DE CONTRASEÑAS SEGURAS',
    '===========================================',
    '',
    'Contraseña: ' + estado.contrasena,
    '',
    'Longitud   : ' + longitud + ' caracteres',
    'Generada el: ' + fechaStr,
    '',
    'AVISO: Guarda este archivo en un lugar seguro.',
    '       Elimínalo después de haberlo usado.',
    '===========================================',
  ];

  const contenido = lineas.join('\n');
  const blob      = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
  const url       = URL.createObjectURL(blob);

  // Crear enlace invisible, clic programático y liberar objeto URL
  const enlace    = document.createElement('a');
  enlace.href     = url;
  enlace.download = 'contrasena_segura.txt';
  enlace.style.display = 'none';
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);

  mostrarToast('Archivo de contraseña descargado', '⬇️');
});

/* ═══════════════════════════════════════════════════════════
   BOTÓN GENERAR (con animación de carga)
   ═══════════════════════════════════════════════════════════ */
elems.btnGenerar.addEventListener('click', () => {
  // Pequeña animación de carga para feedback visual
  elems.btnGenerarText.textContent    = 'Generando...';
  elems.btnGenerarSpinner.classList.remove('d-none');
  elems.btnGenerar.disabled           = true;

  // Usar setTimeout para que el navegador repinte antes de la operación
  setTimeout(() => {
    const nueva = generarContrasena();

    if (nueva !== null) {
      estado.contrasena = nueva;
      estado.visible    = false;

      // Resetear icono de visibilidad
      const iconoOjo    = elems.btnVerOcultar.querySelector('i');
      iconoOjo.className = 'bi bi-eye';
      elems.btnVerOcultar.title = 'Mostrar contraseña';

      renderizarContrasena();
      actualizarFortaleza(nueva);
    }

    elems.btnGenerarText.textContent   = 'Generar contraseña';
    elems.btnGenerarSpinner.classList.add('d-none');
    elems.btnGenerar.disabled          = false;
  }, 200);
});

/* ═══════════════════════════════════════════════════════════
   OCULTAR ERROR AL CAMBIAR OPCIONES
   ═══════════════════════════════════════════════════════════ */
[
  elems.chkMayusculas,
  elems.chkMinusculas,
  elems.chkNumeros,
  elems.chkEspeciales,
  elems.sliderLongitud,
].forEach(el => {
  el.addEventListener('change', ocultarError);
});

/* ═══════════════════════════════════════════════════════════
   INICIALIZACIÓN
   ═══════════════════════════════════════════════════════════ */
(function init() {
  renderizarContrasena();
  actualizarFortaleza('');
})();
