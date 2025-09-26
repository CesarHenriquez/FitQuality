/* =========================================================
   UTILIDADES GENERALES
   (errores accesibles, email, RUN/RUT módulo 11, longitudes)
========================================================= */

/** Muestra un mensaje de error accesible en el input */
function setError(input, message) {
  input.setCustomValidity(message || "");
  input.reportValidity(); // despliega el mensaje altiro
}

/** Limpia el mensaje de error de un input */
function clearError(input) {
  input.setCustomValidity("");
}

/** Valida correo SOLO @gmail.com (lo que pidió el profe) */
function emailGmailValido(value) {
  const re = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  return re.test(String(value).trim());
}

/** Normaliza RUN: mayúsculas, sin espacios/puntos/guion */
function normalizarRun(run) {
  return String(run || "")
    .toUpperCase()
    .replace(/[.\s]/g, "")
    .replace(/-/g, "");
}

/** Calcula Dígito Verificador (módulo 11 Chile) */
function calcularDV(cuerpo) {
  let suma = 0, mult = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * mult;
    mult = mult === 7 ? 2 : mult + 1;
  }
  const resto = suma % 11;
  const dvCalc = 11 - resto;
  if (dvCalc === 11) return "0";
  if (dvCalc === 10) return "K";
  return String(dvCalc);
}

/** Valida formato y DV del RUN (acepta K) */
function runValido(run) {
  const r = normalizarRun(run);
  if (!/^[0-9]{6,8}[0-9K]$/.test(r)) return false;
  const cuerpo = r.slice(0, -1);
  const dv = r.slice(-1);
  return calcularDV(cuerpo) === dv;
}

/** Helper de longitud mínima/máxima */
function betweenLen(value, min, max) {
  const v = String(value || "");
  return v.length >= min && v.length <= max;
}

/* =========================================================
   REGIONES / COMUNAS (CASCADA SIMPLE)
========================================================= */
const regionesComunas = [
  { region: "Metropolitana de Santiago", comunas: ["Santiago","Providencia","Las Condes","Maipú","Puente Alto"] },
  { region: "Valparaíso", comunas: ["Valparaíso","Viña del Mar","Quilpué","Villa Alemana"] },
  { region: "Biobío", comunas: ["Concepción","Talcahuano","Chiguayante","San Pedro de la Paz"] },
];

function cargarRegiones(selectRegion) {
  selectRegion.innerHTML = `<option value="">Selecciona región</option>`;
  regionesComunas.forEach(({ region }) => {
    const opt = document.createElement("option");
    opt.value = region;
    opt.textContent = region;
    selectRegion.appendChild(opt);
  });
}

function cargarComunas(selectRegion, selectComuna) {
  const sel = regionesComunas.find((r) => r.region === selectRegion.value);
  selectComuna.innerHTML = `<option value="">Selecciona comuna</option>`;
  if (!sel) return;
  sel.comunas.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    selectComuna.appendChild(opt);
  });
}

/* =========================================================
   REGISTRO — VALIDACIÓN + GUARDADO + DETECCIÓN ADMIN
========================================================= */
(function validarRegistro() {
  const form = document.getElementById("form-registro");
  if (!form) return;

  const run       = form.querySelector("#reg-run");
  const nombre    = form.querySelector("#reg-nombre");
  const apellidos = form.querySelector("#reg-apellidos");
  const correo    = form.querySelector("#reg-correo");
  const direccion = form.querySelector("#reg-direccion");
  const region    = form.querySelector("#reg-region");
  const comuna    = form.querySelector("#reg-comuna");
  const passInput = form.querySelector("#reg-pass"); // NUEVO (para admin simple)

  // Carga inicial regiones y cascada comunas
  if (region && comuna) {
    cargarRegiones(region);
    region.addEventListener("change", () => cargarComunas(region, comuna));
  }

  form.addEventListener("submit", (e) => {
    let ok = true;

    [run, nombre, apellidos, correo, direccion, region, comuna, passInput].forEach(clearError);

    // RUN
    if (!runValido(run.value)) {
      setError(run, "RUN/RUT inválido. Ej: 12.345.678-K");
      ok = false;
    }

    // Nombre/Apellidos
    if (!betweenLen(nombre.value.trim(), 1, 50)) {
      setError(nombre, "Nombre requerido (máx. 50).");
      ok = false;
    }
    if (!betweenLen(apellidos.value.trim(), 1, 100)) {
      setError(apellidos, "Apellidos requeridos (máx. 100).");
      ok = false;
    }

    // Correo @gmail.com
    if (!emailGmailValido(correo.value) || !betweenLen(correo.value, 1, 100)) {
      setError(correo, "Correo inválido. Solo @gmail.com");
      ok = false;
    }

    // Dirección
    if (!betweenLen(direccion.value.trim(), 1, 300)) {
      setError(direccion, "Dirección requerida (máx. 300).");
      ok = false;
    }

    // Región/Comuna
    if (!region.value) {
      setError(region, "Selecciona una región.");
      ok = false;
    }
    if (!comuna.value) {
      setError(comuna, "Selecciona una comuna.");
      ok = false;
    }

    // Contraseña (4 a 10) — si es "admin" se marca como administrador
    if (!betweenLen(passInput.value, 4, 10)) {
      setError(passInput, "Contraseña 4 a 10 caracteres.");
      ok = false;
    }

    if (!ok) { e.preventDefault(); return; }

    // ----- Almacenar usuario de forma DEMO en localStorage -----
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    const user = {
      run: normalizarRun(run.value),
      nombre: nombre.value.trim(),
      apellidos: apellidos.value.trim(),
      correo: correo.value.trim().toLowerCase(),
      region: region.value,
      comuna: comuna.value,
      direccion: direccion.value.trim(),
      role: passInput.value === "admin" ? "admin" : "cliente", // REGLA sencilla
    };

    // Si ya existe un usuario con el mismo correo, lo reemplazamos (demo simple)
    const idx = users.findIndex(u => u.correo === user.correo);
    if (idx >= 0) users[idx] = user; else users.push(user);

    localStorage.setItem("users", JSON.stringify(users));

    // Redirección según rol
    if (user.role === "admin") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "login.html";
    }

    // Evitar submit real (no hay backend)
    e.preventDefault();
  });
})();

/* =========================================================
   LOGIN — VALIDACIÓN + REDIRECCIÓN SEGÚN ROL
========================================================= */
(function validarLogin() {
  const form = document.getElementById("form-login");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    let ok = true;

    const correo = form.querySelector("#login-correo");
    const pass   = form.querySelector("#login-pass");

    clearError(correo);
    clearError(pass);

    // Validaciones mínimas
    if (!emailGmailValido(correo.value) || !betweenLen(correo.value, 1, 100)) {
      setError(correo, "Correo inválido. Solo @gmail.com");
      ok = false;
    }
    if (!betweenLen(pass.value, 4, 10)) {
      setError(pass, "La contraseña debe tener entre 4 y 10 caracteres.");
      ok = false;
    }

    if (!ok) { e.preventDefault(); return; }

    // ----- DEMO auth: revisa usuarios guardados -----
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const u = users.find(x => x.correo === correo.value.trim().toLowerCase());

    // Regla simple:
    // - Si el usuario guardado existe y su rol es admin → admin.html
    // - O si la contraseña ingresada es "admin" → admin.html (backdoor demo)
    // - Si no, index.html
    if ((u && u.role === "admin") || pass.value === "admin") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "index.html";
    }

    e.preventDefault();
  });
})();

/* =========================================================
   CONTACTO — VALIDACIÓN SIMPLE (si usas form-contacto)
========================================================= */
(function validarContacto() {
  const form = document.getElementById("form-contacto");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    let ok = true;

    const nombre = form.querySelector("#nombre");
    const correo = form.querySelector("#correo");
    const comentario = form.querySelector("#comentario");

    [nombre, correo, comentario].forEach(clearError);

    if (!betweenLen(nombre.value.trim(), 1, 100)) {
      setError(nombre, "Nombre requerido (máximo 100 caracteres).");
      ok = false;
    }
    if (!emailGmailValido(correo.value) || !betweenLen(correo.value, 1, 100)) {
      setError(correo, "Correo inválido. Solo @gmail.com");
      ok = false;
    }
    if (!betweenLen(comentario.value.trim(), 1, 500)) {
      setError(comentario, "Comentario requerido (máx. 500).");
      ok = false;
    }

    if (!ok) e.preventDefault();
  });
})();