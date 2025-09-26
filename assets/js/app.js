/* =========================================================
   CARRITO DE COMPRAS (localStorage)
========================================================= */
const CART_KEY = "sf_cart";

function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
}
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart || []));
}
function clearCart() {
  localStorage.removeItem(CART_KEY);
}
function getCount() {
  return getCart().reduce((s, i) => s + i.qty, 0);
}
function getTotal() {
  return getCart().reduce((s, i) => s + i.price * i.qty, 0);
}

function addItem(item) {
  const cart = getCart();
  const found = cart.find(i => i.id === item.id);
  if (found) found.qty += 1;
  else cart.push({ ...item, qty: 1 });
  saveCart(cart);
  updateCartCount();
}
function removeItem(id) {
  saveCart(getCart().filter(i => i.id !== id));
  updateCartCount();
}
function setQty(id, qty) {
  let cart = getCart();
  cart = cart
    .map(i => (i.id === id ? { ...i, qty: Number(qty) } : i))
    .filter(i => i.qty > 0);
  saveCart(cart);
  updateCartCount();
}
function updateCartCount() {
  const badge = document.getElementById("cart-count");
  if (badge) badge.textContent = getCount();
}

/* =========================================================
   TOASTS (mensajes flotantes)
========================================================= */
function getToastContainer() {
  let c = document.querySelector(".toast-container");
  if (!c) {
    c = document.createElement("div");
    c.className = "toast-container";
    c.setAttribute("role", "status");
    c.setAttribute("aria-live", "polite");
    document.body.appendChild(c);
  }
  return c;
}
function showToast(message = "Acción realizada") {
  const c = getToastContainer();
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = message;
  c.appendChild(t);
  setTimeout(() => t.remove(), 2600);
}

/* =========================================================
   CATÁLOGO BASE + VARIANTES
========================================================= */
const PRODUCTOS = {
  magnesio: {
    id: "magnesio",
    nombre: "Magnesio Deportivo",
    precio: 2500,
    img: "https://biogymstore.cl/cdn/shop/products/MAGNESIODEPORTIVOCROSSFTICALISTENIAPORMAYORBIOGYMSTORECHILE_2048x.jpg?v=1679183264",
    bullets: [
      "Agarre superior en barras y kettlebells.",
      "Fórmula de alta pureza, baja humedad.",
      "Envase resellable para mayor durabilidad.",
    ],
    material: "Carbonato de magnesio de grado deportivo.",
    optionKey: "none",
  },
  straps: {
    id: "straps",
    nombre: "Straps de Entrenamiento",
    precio: 3500,
    img: "https://olimposports.cl/wp-content/uploads/2023/10/Copia-de-NUEVO-FORMATO-2025-01-16T110258.906.jpg",
    bullets: [
      "Soporte extra para tirones pesados.",
      "Costuras reforzadas anti-desgarro.",
      "Interior con grip antideslizante.",
    ],
    material: "Algodón grueso con refuerzo de neopreno.",
    optionKey: "colors",
  },
  cinturon: {
    id: "cinturon",
    nombre: "Cinturón Powerlifter",
    precio: 14990,
    img: "https://greatlhete.cl/wp-content/uploads/2022/10/powerliftingpalancaback.webp",
    bullets: [
      "Estabilidad lumbar en sentadillas y press.",
      "Hebilla de palanca de acero.",
      "Grosor uniforme para presión intraabdominal.",
    ],
    material: "Cuero sintético de alta densidad + acero.",
    optionKey: "colors",
  },
  rodilleras: {
    id: "rodilleras",
    nombre: "Rodilleras 7mm",
    precio: 5000,
    img: "https://http2.mlstatic.com/D_NQ_NP_610417-MLC90985245494_082025-O-par-de-rodilleras-7mm-compresion-crossfit-power-lifting.webp",
    bullets: [
      "Compresión y calor articular.",
      "Costuras planas anti-rozaduras.",
      "Apta para WODs y powerlifting.",
    ],
    material: "Neopreno 7mm de alta elasticidad.",
    optionKey: "colors",
  },
  coderas: {
    id: "coderas",
    nombre: "Coderas de Compresión",
    precio: 5000,
    img: "https://cdnx.jumpseller.com/sbd-chile/image/63911980/thumb/719/719?1748535528",
    bullets: [
      "Estabilidad en press y extensiones.",
      "Tejido transpirable.",
      "Ajuste anatómico.",
    ],
    material: "Mezcla elástica poliéster-spandex.",
    optionKey: "colors",
  },
  mancuernas: {
    id: "mancuernas",
    nombre: "Mancuernas (par)",
    precio: 19990,
    img: "https://xrs.cl/wp-content/uploads/2021/09/15.jpg",
    bullets: [
      "Revestimiento que protege el piso.",
      "Marcado de peso visible.",
      "Agarre cómodo con textura.",
    ],
    material: "Núcleo de hierro con recubrimiento vinílico.",
    optionKey: "mancuernas",
  },
  discos: {
    id: "discos",
    nombre: "Discos de Peso",
    precio: 29990,
    img: "https://dnkkaawggv0bs.cloudfront.net/7518-large_default/pack-150kg-discos-powerlifting-chromed-steel-xmaster.jpg",
    bullets: [
      "Diámetro estándar para barra olímpica.",
      "Alta durabilidad.",
      "Tolerancia de peso ±2%.",
    ],
    material: "Acero cromado / goma densa (según modelo).",
    optionKey: "discos",
  },
  barra: {
    id: "barra",
    nombre: "Barra Olímpica",
    precio: 34990,
    img: "https://www.inaturalfitness.com/gallery/barra-powerlifting-competencia.jpeg",
    bullets: [
      "Buena elasticidad y whip controlado.",
      "Moleteado con marcas olímpicas.",
      "Cojinetes para giro fluido.",
    ],
    material: "Acero aleado con recubrimiento resistente.",
    optionKey: "none",
    fixedTag: "20KG",
  },
};

const OPTION_SETS = {
  colors: { label: "Color", values: ["Rojo", "Negro", "Azul", "Rosado"] },
  mancuernas: { label: "Peso (par)", values: ["2.5KG", "5KG", "8KG", "10KG", "15KG", "20KG"] },
  discos: { label: "Peso", values: ["5KG", "10KG", "15KG", "20KG"] },
};

/* =========================================================
   ADMIN PRODUCTS (catálogo extendido)
========================================================= */
const ADMIN_PRODUCTS_KEY = "admin_products";

function getAdminProducts() {
  return JSON.parse(localStorage.getItem(ADMIN_PRODUCTS_KEY) || "[]");
}
function saveAdminProducts(list) {
  localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(list || []));
}
function getFullCatalog() {
  const admin = getAdminProducts();
  const extra = {};
  admin.forEach(p => (extra[p.id] = p));
  return { ...PRODUCTOS, ...extra };
}
function getProductById(id) {
  return getFullCatalog()[id] || null;
}

/* =========================================================
   VARIANTES (helpers)
========================================================= */
function getDefaultVariantFor(product) {
  if (!product || !product.optionKey || product.optionKey === "none") return null;
  const set = OPTION_SETS[product.optionKey];
  return set?.values?.[0] || null;
}
function getVariantParts(item) {
  const m = String(item.name || "").match(/^(.*?)(?:\s*\((.+)\))$/);
  if (m) return { baseName: m[1].trim(), variant: m[2].trim() };
  const id = String(item.id || "");
  if (id.includes("-")) {
    const parts = id.split("-");
    return { baseName: String(item.name || parts[0]), variant: parts.slice(1).join("-") };
  }
  return { baseName: String(item.name || "Producto"), variant: null };
}

/* =========================================================
   CARRITO (render + eventos)
========================================================= */
function renderCart(containerSelector = "#cart") {
  const el = document.querySelector(containerSelector);
  if (!el) return;

  const cart = getCart();
  if (cart.length === 0) {
    el.innerHTML = `<p style="padding:16px">Tu carrito está vacío.</p>`;
    updateCartCount();
    return;
  }

  const rows = cart.map(i => {
    const { baseName, variant } = getVariantParts(i);
    const badge = variant ? `<span class="pay-badge" style="margin-left:6px">${variant}</span>` : "";
    return `
      <tr>
        <td>${baseName} ${badge}</td>
        <td>$${i.price.toFixed(0)}</td>
        <td><input type="number" min="1" value="${i.qty}" data-qty id="qty-${i.id}" /></td>
        <td>$${(i.price * i.qty).toFixed(0)}</td>
        <td><button data-remove="${i.id}" class="btn btn--outline">Quitar</button></td>
      </tr>
    `;
  }).join("");

  el.innerHTML = `
    <table class="cart-table">
      <thead>
        <tr><th>Producto</th><th>Precio</th><th>Cantidad</th><th>Subtotal</th><th></th></tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr>
          <td colspan="3" style="text-align:right"><strong>Total</strong></td>
          <td colspan="2"><strong>$${getTotal().toFixed(0)}</strong></td>
        </tr>
      </tfoot>
    </table>
    <div style="display:flex; gap:8px; justify-content:flex-end; margin-top:12px; padding:0 6px 10px;">
      <button id="btn-clear" class="btn btn--outline">Vaciar carrito</button>
      <a id="btn-checkout" class="btn" href="payment.html">Pagar</a>
    </div>
  `;

  el.querySelectorAll("[data-qty]").forEach(input => {
    input.addEventListener("change", e => {
      const id = e.target.id.replace("qty-", "");
      setQty(id, e.target.value);
      renderCart(containerSelector);
    });
  });
  el.querySelectorAll("[data-remove]").forEach(btn => {
    btn.addEventListener("click", () => {
      removeItem(btn.dataset.remove);
      renderCart(containerSelector);
      showToast?.("Producto eliminado");
    });
  });
  el.querySelector("#btn-clear")?.addEventListener("click", () => {
    clearCart();
    renderCart(containerSelector);
    showToast?.("Carrito vaciado");
  });

  updateCartCount();
}

/* =========================================================
   AÑADIR (delegación click en botones [data-add])
========================================================= */
document.addEventListener("click", e => {
  const btn = e.target.closest("[data-add]");
  if (!btn) return;

  e.preventDefault();
  e.stopPropagation();

  let id = btn.dataset.id || "";
  let name = btn.dataset.name || "";
  let price = Number(btn.dataset.price || 0);

  const card = btn.closest(".card");
  if (!id && card) {
    const title = card.querySelector("h2,h3")?.textContent?.trim() || "Producto";
    name = name || title.replace(/\s*\$\d[\d.]*$/g, "").trim();
    id = name.toLowerCase().replace(/\s+/g, "-");
  }

  const p = getProductById(id);
  if (p) {
    name = p.nombre;
    if (!price || isNaN(price)) price = p.precio;
  }

  let variant = null;
  if (p) variant = p.fixedTag ? p.fixedTag : getDefaultVariantFor(p);

  const itemId = variant ? `${p?.id || id}-${variant}` : (p?.id || id);
  const itemName = variant ? `${name} (${variant})` : name;

  addItem({ id: itemId, name: itemName, price });
  showToast(`${itemName} añadido al carrito`);
  if (btn.tagName === "BUTTON") {
    const prev = btn.textContent;
    btn.textContent = "Añadido ✓";
    btn.disabled = true;
    setTimeout(() => { btn.textContent = prev; btn.disabled = false; }, 900);
  }
});

/* =========================================================
   DETALLE (detalle.html?id=XYZ)
========================================================= */
function renderProductDetail() {
  const cont = document.getElementById("product-detail");
  if (!cont) return;

  const params = new URLSearchParams(location.search);
  const rawId = (params.get("id") || "").trim().toLowerCase();
  if (!rawId) {
    cont.innerHTML = `<p class="muted">Falta el parámetro <code>?id=</code>. Redirigiendo…</p>`;
    setTimeout(() => (location.href = "productos.html"), 900);
    return;
  }

  const p = getProductById(rawId);
  if (!p) {
    cont.innerHTML = `<p class="muted">Producto no encontrado. Redirigiendo…</p>`;
    setTimeout(() => (location.href = "productos.html"), 900);
    return;
  }

  const precio = `$${Number(p.precio || 0).toFixed(0)}`;
  const optionSet = p.optionKey && p.optionKey !== "none" ? OPTION_SETS[p.optionKey] : null;

  const pickerHtml = optionSet ? `
    <div class="size-picker" role="group" aria-label="${optionSet.label}">
      ${optionSet.values.map((v,i)=>`
        <button class="chip ${i===0?"is-active":""}" data-opt="${v}" type="button">${v}</button>
      `).join("")}
    </div>` : "";

  const fixedBadge = p.fixedTag ? `<p class="muted" style="margin-top:6px">Peso: <strong>${p.fixedTag}</strong></p>` : "";

  cont.innerHTML = `
    <div class="prod-detail">
      <div class="prod-info">
        <h1 class="page-title">${p.nombre.toUpperCase()}</h1>
        <p class="muted">Calidad de material: <strong>${p.material || "—"}</strong></p>
        ${fixedBadge}
        <ul class="bullets">${(p.bullets || []).map(b=>`<li>${b}</li>`).join("")}</ul>
        ${pickerHtml}
        <p class="price">PRECIO: <strong>${precio}</strong></p>
        <button id="btn-add-detail" class="btn" style="width:100%">Añadir al carrito</button>
        <div class="detail-actions">
          <a class="btn btn--outline" href="productos.html">← Volver a productos</a>
          <a class="btn" href="cart.html">🛒 Ir al carrito</a>
        </div>
      </div>
      <div class="prod-image"><img src="${p.img}" alt="${p.nombre}" /></div>
    </div>
  `;

  let currentOpt = optionSet ? cont.querySelector(".chip.is-active")?.dataset.opt : null;
  if (optionSet) {
    cont.querySelectorAll(".chip").forEach(ch => {
      ch.addEventListener("click", () => {
        cont.querySelectorAll(".chip").forEach(c => c.classList.remove("is-active"));
        ch.classList.add("is-active");
        currentOpt = ch.dataset.opt;
      });
    });
  }

  cont.querySelector("#btn-add-detail").addEventListener("click", () => {
    const variantTag = currentOpt || p.fixedTag || null;
    const itemId = variantTag ? `${p.id}-${variantTag}` : p.id;
    const itemName = variantTag ? `${p.nombre} (${variantTag})` : p.nombre;
    addItem({ id: itemId, name: itemName, price: p.precio });
    showToast(`${itemName} añadido`);
  });
}

/* =========================================================
   PAYMENT (sin JS inline)
========================================================= */
(function initPaymentPage() {
  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-pago");
    if (!form) return;

    const btn = document.getElementById("btn-pay");
    const totalEl = document.getElementById("pay-total");
    const radios = document.querySelectorAll('input[name="mp"]');

    const cart = getCart();
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    totalEl.textContent = `$${total.toFixed(0)}`;

    if (cart.length === 0) {
      alert("Tu carrito está vacío. Agrega productos antes de pagar.");
      window.location.href = "productos.html";
      return;
    }

    const labels = {
      webpay: "Pagar con Webpay",
      transferencia: "Ir a Transferencia Bancaria",
      wallets: "Pagar con billetera",
    };

    function updateBtn() {
      const val = document.querySelector('input[name="mp"]:checked')?.value || "webpay";
      btn.textContent = labels[val] || "Pagar ahora";
    }
    radios.forEach(r => r.addEventListener("change", updateBtn));
    updateBtn();

    form.addEventListener("submit", e => {
      e.preventDefault();
      const mp = new FormData(form).get("mp") || "webpay";
      showToast?.(`Demo: redirigiendo a ${labels[mp]}...`);
      setTimeout(() => {
        clearCart();
        window.location.href = "index.html";
      }, 1200);
    });
  });
})();

/* =========================================================
   PANEL ADMIN (Demo): agregar / listar / eliminar / editar / logout
========================================================= */
(function initAdmin() {
  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("admin-add-product");
    const boxProducts = document.getElementById("admin-products");
    const boxUsers = document.getElementById("admin-users");
    const btnLogout = document.getElementById("admin-logout");
    if (!form && !boxProducts && !boxUsers && !btnLogout) return;

    function renderAdminProducts() {
      if (!boxProducts) return;
      const list = getAdminProducts();
      if (list.length === 0) {
        boxProducts.innerHTML = `<p class="muted">Aún no has agregado productos.</p>`;
        return;
      }
      const rows = list.map(p => `
        <tr>
          <td><code>${p.id}</code></td>
          <td>${p.nombre}</td>
          <td>$${Number(p.precio || 0).toFixed(0)}</td>
          <td>
            <button class="btn btn--outline" data-edit-product="${p.id}">Editar</button>
            <button class="btn btn--outline" data-del-product="${p.id}">Eliminar</button>
            <a class="btn" href="detalle.html?id=${encodeURIComponent(p.id)}">Ver detalle</a>
          </td>
        </tr>
      `).join("");

      boxProducts.innerHTML = `
        <table class="cart-table">
          <thead><tr><th>ID</th><th>Nombre</th><th>Precio</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      `;

      // Eliminar
      boxProducts.querySelectorAll("[data-del-product]").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.delProduct;
          const cur = getAdminProducts().filter(x => x.id !== id);
          saveAdminProducts(cur);
          renderAdminProducts();
          showToast?.("Producto eliminado");
        });
      });

      // Editar (simple mediante prompt)
      boxProducts.querySelectorAll("[data-edit-product]").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.editProduct;
          const list = getAdminProducts();
          const idx = list.findIndex(x => x.id === id);
          if (idx === -1) return;

          const current = list[idx];
          const nuevoNombre = prompt("Nuevo nombre:", current.nombre) ?? current.nombre;
          const nuevoPrecio = Number(prompt("Nuevo precio:", current.precio) ?? current.precio);
          const nuevaImg = prompt("Nueva URL de imagen (opcional):", current.img || "") ?? current.img;

          list[idx] = {
            ...current,
            nombre: String(nuevoNombre || current.nombre).trim(),
            precio: isNaN(nuevoPrecio) ? current.precio : nuevoPrecio,
            img: (nuevaImg || "").trim() || current.img,
          };
          saveAdminProducts(list);
          renderAdminProducts();
          showToast?.("Producto actualizado");
        });
      });
    }

    function renderUsers() {
      if (!boxUsers) return;
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      if (users.length === 0) {
        boxUsers.innerHTML = `<p class="muted">Sin usuarios registrados.</p>`;
        return;
      }
      const rows = users.map((u, idx) => `
        <tr>
          <td>${u.nombre} ${u.apellidos}</td>
          <td>${u.correo}</td>
          <td>${u.role || "cliente"}</td>
          <td><button class="btn btn--outline" data-del-user="${idx}">Eliminar</button></td>
        </tr>
      `).join("");

      boxUsers.innerHTML = `
        <table class="cart-table">
          <thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      `;

      boxUsers.querySelectorAll("[data-del-user]").forEach(btn => {
        btn.addEventListener("click", () => {
          const idx = Number(btn.dataset.delUser);
          const users = JSON.parse(localStorage.getItem("users") || "[]");
          users.splice(idx, 1);
          localStorage.setItem("users", JSON.stringify(users));
          renderUsers();
          showToast?.("Usuario eliminado");
        });
      });
    }

    if (form) {
      form.addEventListener("submit", e => {
        e.preventDefault();
        const data = new FormData(form);
        const id = String(data.get("id") || "").trim().toLowerCase().replace(/\s+/g, "-");
        const nombre = String(data.get("nombre") || "").trim();
        const precio = Number(data.get("precio") || 0);
        const img = String(data.get("img") || "").trim();

        if (!id || !nombre || !precio) {
          showToast?.("Completa ID, nombre y precio");
          return;
        }
        const list = getAdminProducts();
        if (list.some(p => p.id === id)) {
          showToast?.("Ese ID ya existe");
          return;
        }
        const nuevo = {
          id,
          nombre,
          precio,
          img: img || "https://via.placeholder.com/600x400?text=Producto",
          bullets: ["Producto agregado por administrador."],
          material: "—",
          optionKey: "none",
        };
        list.push(nuevo);
        saveAdminProducts(list);
        form.reset();
        showToast?.("Producto agregado");
        renderAdminProducts();
      });
    }

    if (btnLogout) {
      btnLogout.addEventListener("click", () => {
        localStorage.removeItem("fq_session"); // clave de la sesión demo
        showToast("Sesión cerrada");
        setTimeout(() => (window.location.href = "index.html"), 600);
      });
    }

    renderAdminProducts();
    renderUsers();
  });
})();

/* =========================================================
   CATÁLOGO DINÁMICO (productos.html -> #catalog-dynamic)
========================================================= */
(function initDynamicCatalog() {
  document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById("catalog-dynamic");
    if (!grid) return;

    const items = Object.values(getFullCatalog());
    if (items.length === 0) {
      grid.innerHTML = `<p class="muted">No hay productos.</p>`;
      return;
    }
    grid.innerHTML = items.map(p => `
      <article class="card">
        <img src="${p.img}" alt="${p.nombre}" />
        <h3>${p.nombre} $${Number(p.precio || 0).toFixed(0)}</h3>
        <p class="muted">${(p.material || "").slice(0, 80)}</p>
        <div style="display:flex; gap:8px; flex-wrap:wrap">
          <button class="btn btn--outline"
            data-add data-id="${p.id}" data-name="${p.nombre}" data-price="${p.precio}">Añadir</button>
          <a class="btn" href="detalle.html?id=${encodeURIComponent(p.id)}">Ver detalle</a>
        </div>
      </article>
    `).join("");
  });
})();

/* =========================================================
   INIT GENERAL
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  if (document.querySelector("#cart")) renderCart("#cart");
  renderProductDetail();
});