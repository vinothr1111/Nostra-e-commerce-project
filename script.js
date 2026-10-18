const PRODUCTS = [
  {
    n: "Men's Denim Jacket",
    p: 49,
    o: "Summer",
    c: "Red",
    a: "New",
    image: "images/mens-top-rated-denim-jacket.jpg",
  },
  {
    n: "Men's Beachwear",
    p: 39,
    o: "Beach",
    c: "Blue",
    a: "New",
    image: "images/mens-beachwear.jpg",
  },
  {
    n: "Men's Evening Suit",
    p: 89,
    o: "Party",
    c: "Green",
    a: "New",
    image: "images/mens-evening-suit.jpg",
  },
  {
    n: "Men's Cotton Tee",
    p: 25,
    o: "Summer",
    c: "White",
    a: "Old",
    image: "images/mens-cotton-tee.jpg",
  },
  {
    n: "Men's Party Suit",
    p: 79,
    o: "Party",
    c: "Red",
    a: "Old",
    image: "images/mens-party-suit.jpg",
  },
  {
    n: "Men's Resort Streetwear",
    p: 35,
    o: "Beach",
    c: "White",
    a: "New",
    image: "images/mens-resort-streetwear.jpg",
  },
  {
    n: "Men's Knitwear",
    p: 45,
    o: "Summer",
    c: "Green",
    a: "Old",
    image: "images/mens-knitwear.jpg",
  },
  {
    n: "Men's White Tee",
    p: 69,
    o: "Party",
    c: "Blue",
    a: "Old",
    image: "images/mens-white-tee.jpg",
  },
  {
    n: "Men's Tailored Suit",
    p: 95,
    o: "Party",
    c: "Blue",
    a: "New",
    rating: 4.9,
    image: "images/mens-top-rated-suit.jpg",
  },
  {
    n: "Men's Denim Jacket",
    p: 59,
    o: "Summer",
    c: "Blue",
    a: "New",
    rating: 4.8,
    image: "images/mens-top-rated-denim-jacket.jpg",
  },
  {
    n: "Men's Urban Streetwear",
    p: 55,
    o: "Beach",
    c: "Black",
    a: "New",
    rating: 4.7,
    image: "images/mens-top-rated-streetwear.jpg",
  },
  {
    n: "Men's Classic Black Tee",
    p: 29,
    o: "Summer",
    c: "Black",
    a: "New",
    rating: 4.6,
    image: "images/mens-top-rated-black-tee.jpg",
  },
];
const $ = (s, r = document) => r.querySelector(s),
  $$ = (s, r = document) => [...r.querySelectorAll(s)];
const CART_STORAGE_KEY = "nostra-cart";
const cart = new Map();
const cartDialog = $("#cart-dialog");
const cartList = $(".cart-items", cartDialog);
const cartStatus = $(".cart-status", cartDialog);
let cartCloseTimer;
const money = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    value,
  );
const productId = (product) => `${product.n}|${product.p}|${product.image}`;
const findProduct = (id) =>
  PRODUCTS.find((product) => productId(product) === id);
$$(".promo-close").forEach((button) =>
  button.addEventListener("click", () => {
    const promo = button.closest(".promo");
    if (!promo) return;
    promo.classList.add("is-dismissing");
    window.setTimeout(() => promo.remove(), 240);
  }),
);
function closeCart() {
  if (!cartDialog.open || cartDialog.classList.contains("is-closing")) return;
  cartDialog.classList.add("is-closing");
  cartCloseTimer = window.setTimeout(() => {
    cartDialog.close();
    cartDialog.classList.remove("is-closing");
  }, 200);
}
function cardHTML(p, showRating = false) {
  const rating = showRating
    ? `<span class="rating" aria-label="Rated ${p.rating} out of 5"><span aria-hidden="true">★★★★★</span> ${p.rating.toFixed(1)} / 5</span>`
    : "";
  return `<article class="card"><img class="thumb" src="${p.image}" alt="${p.n}" loading="lazy"><div class="info"><strong>${p.n}</strong><span>${p.o} · ${p.c}</span><span class="price">${money(p.p)}</span>${rating}<button type="button" data-add-to-cart="${productId(p)}">Add to cart</button></div></article>`;
}
function render(el, list, showRating = false) {
  el.innerHTML = list.length
    ? list.map((p) => cardHTML(p, showRating)).join("")
    : '<p class="empty">No products match these filters. Clear a filter to see more.</p>';
}
function updateCart() {
  const itemCount = [...cart.values()].reduce(
    (count, quantity) => count + quantity,
    0,
  );
  $$(".cart").forEach((button) => (button.textContent = `Cart (${itemCount})`));
  $$(".cart").forEach((button) =>
    button.setAttribute(
      "aria-label",
      `Open cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`,
    ),
  );
  const total = [...cart.entries()].reduce(
    (sum, [id, quantity]) => sum + (findProduct(id)?.p || 0) * quantity,
    0,
  );
  $(".cart-total", cartDialog).textContent = money(total);
  cartList.replaceChildren();
  if (!itemCount) {
    const empty = document.createElement("li");
    empty.className = "cart-empty";
    empty.textContent = "Your cart is empty.";
    cartList.append(empty);
    return;
  }
  cart.forEach((quantity, id) => {
    const product = findProduct(id);
    if (!product) return;
    const item = document.createElement("li");
    item.className = "cart-item cart-item-entering";
    const image = document.createElement("img");
    image.src = product.image;
    image.alt = "";
    image.loading = "lazy";
    const info = document.createElement("div");
    info.className = "cart-item-info";
    const name = document.createElement("strong");
    name.textContent = product.n;
    const unitPrice = document.createElement("span");
    unitPrice.textContent = `${money(product.p)} each`;
    const lineTotal = document.createElement("span");
    lineTotal.textContent = `Item total: ${money(product.p * quantity)}`;
    info.append(name, unitPrice, lineTotal);
    const actions = document.createElement("div");
    actions.className = "cart-item-actions";
    const quantityControls = document.createElement("div");
    quantityControls.className = "cart-quantity";
    const decrease = document.createElement("button");
    decrease.type = "button";
    decrease.dataset.cartAction = "decrease";
    decrease.dataset.productId = id;
    decrease.setAttribute("aria-label", `Decrease ${product.n} quantity`);
    decrease.textContent = "−";
    const count = document.createElement("span");
    count.textContent = String(quantity);
    const increase = document.createElement("button");
    increase.type = "button";
    increase.dataset.cartAction = "increase";
    increase.dataset.productId = id;
    increase.setAttribute("aria-label", `Increase ${product.n} quantity`);
    increase.textContent = "+";
    quantityControls.append(decrease, count, increase);
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "cart-remove";
    remove.dataset.cartAction = "remove";
    remove.dataset.productId = id;
    remove.textContent = "Remove";
    actions.append(quantityControls, remove);
    item.append(image, info, actions);
    cartList.append(item);
  });
}
function saveCart() {
  try {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify(
        [...cart.entries()].map(([id, quantity]) => ({ id, quantity })),
      ),
    );
    cartStatus.textContent = "";
    return true;
  } catch (error) {
    if (!(error instanceof DOMException)) throw error;
    console.error("Could not save the cart to browser storage.", error);
    cartStatus.textContent =
      "Your cart is available for this page, but could not be saved for later.";
    return false;
  }
}
function loadCart() {
  let stored;
  try {
    stored = localStorage.getItem(CART_STORAGE_KEY);
  } catch (error) {
    if (!(error instanceof DOMException)) throw error;
    console.error("Could not read the cart from browser storage.", error);
    cartStatus.textContent =
      "Saved cart items are unavailable in this browser.";
    updateCart();
    return;
  }
  if (!stored) {
    updateCart();
    return;
  }
  let entries;
  try {
    entries = JSON.parse(stored);
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
    console.error("Saved cart data is not valid JSON.", error);
    cartStatus.textContent = "Saved cart data could not be read.";
    updateCart();
    return;
  }
  if (!Array.isArray(entries)) {
    console.error("Saved cart data must be a list.");
    cartStatus.textContent = "Saved cart data could not be read.";
    updateCart();
    return;
  }
  entries.forEach((entry) => {
    if (
      entry &&
      typeof entry.id === "string" &&
      Number.isInteger(entry.quantity) &&
      entry.quantity > 0 &&
      findProduct(entry.id)
    ) {
      cart.set(entry.id, entry.quantity);
    }
  });
  updateCart();
}
$$(".cart").forEach((button) =>
  button.addEventListener("click", () => {
    window.clearTimeout(cartCloseTimer);
    cartDialog.classList.remove("is-closing");
    if (!cartDialog.open) cartDialog.showModal();
    button.setAttribute("aria-expanded", "true");
  }),
);
$(".cart-close", cartDialog).addEventListener("click", closeCart);
cartDialog.addEventListener("close", () => {
  window.clearTimeout(cartCloseTimer);
  cartDialog.classList.remove("is-closing");
  $$(".cart").forEach((button) =>
    button.setAttribute("aria-expanded", "false"),
  );
});
cartDialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeCart();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && cartDialog.open) {
    event.preventDefault();
    closeCart();
  }
});
cartDialog.addEventListener("click", (event) => {
  if (event.target === cartDialog) closeCart();
});
document.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;
  const addButton = event.target.closest("[data-add-to-cart]");
  if (addButton) {
    const id = addButton.dataset.addToCart;
    cart.set(id, (cart.get(id) || 0) + 1);
    const saved = saveCart();
    updateCart();
    if (saved) cartStatus.textContent = "Item added to your cart.";
    addButton.textContent = "Added ✓";
    window.setTimeout(() => {
      addButton.textContent = "Add to cart";
    }, 1200);
    return;
  }
  const action = event.target.closest("[data-cart-action]");
  if (!action) return;
  const id = action.dataset.productId,
    quantity = cart.get(id) || 0;
  if (action.dataset.cartAction === "increase") cart.set(id, quantity + 1);
  if (action.dataset.cartAction === "decrease") {
    if (quantity <= 1) cart.delete(id);
    else cart.set(id, quantity - 1);
  }
  if (action.dataset.cartAction === "remove") cart.delete(id);
  saveCart();
  updateCart();
});
window.addEventListener("storage", (event) => {
  if (event.key === CART_STORAGE_KEY) {
    cart.clear();
    loadCart();
  }
});
const btn = $(".menu-btn"),
  nav = $("nav");
if (btn && nav) {
  const setMenuOpen = (open) => {
    nav.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    btn.textContent = open ? "×" : "☰";
  };
  btn.addEventListener("click", () =>
    setMenuOpen(!nav.classList.contains("open")),
  );
  $$("a", nav).forEach((link) =>
    link.addEventListener("click", () => setMenuOpen(false)),
  );
}
const heroSlider = $(".hero-slider");
if (heroSlider) {
  const track = $(".hero-track", heroSlider),
    slides = $$(".hero-slide", heroSlider),
    dots = $(".hero-dots", heroSlider);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeSlide = 0,
    autoplay;
  const showSlide = (index) => {
    activeSlide = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${activeSlide * 100}%)`;
    $$(".hero-dot", dots).forEach((dot, i) => {
      const active = i === activeSlide;
      dot.classList.toggle("active", active);
      dot.setAttribute("aria-pressed", String(active));
    });
  };
  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "hero-dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `Show featured image ${i + 1}`);
    dot.addEventListener("click", () => showSlide(i));
    dots.append(dot);
  });
  $$("[data-slide-step]", heroSlider).forEach((button) => {
    button.addEventListener("click", () =>
      showSlide(activeSlide + Number(button.dataset.slideStep)),
    );
  });
  const stopAutoplay = () => window.clearInterval(autoplay);
  const startAutoplay = () => {
    stopAutoplay();
    if (!reducedMotion.matches)
      autoplay = window.setInterval(() => showSlide(activeSlide + 1), 5000);
  };
  heroSlider.addEventListener("mouseenter", stopAutoplay);
  heroSlider.addEventListener("mouseleave", startAutoplay);
  heroSlider.addEventListener("focusin", stopAutoplay);
  heroSlider.addEventListener("focusout", (event) => {
    if (!heroSlider.contains(event.relatedTarget)) startAutoplay();
  });
  reducedMotion.addEventListener("change", startAutoplay);
  showSlide(0);
  startAutoplay();
}
$$("nav a").forEach((a) => {
  if (
    a.getAttribute("href") === location.pathname.split("/").pop() ||
    (!location.pathname.split("/").pop() &&
      a.getAttribute("href") === "index.html")
  )
    a.classList.add("active");
});
const na = $("#new-grid");
if (na) render(na, PRODUCTS.filter((p) => p.a === "New").slice(0, 4));
const mw = $("#wanted-grid");
if (mw) render(mw, PRODUCTS.slice(4, 8));
const tr = $("#top-rated-grid");
if (tr)
  render(
    tr,
    PRODUCTS.filter((p) => p.rating).sort((a, b) => b.rating - a.rating),
    true,
  );
const cg = $("#collection-grid");
if (cg) {
  const apply = () => {
    const sel = (g) => $$(`input[name=${g}]:checked`).map((i) => i.value);
    const f = { o: sel("occasion"), c: sel("color"), a: sel("arrival") };
    render(
      cg,
      PRODUCTS.filter(
        (p) =>
          (!f.o.length || f.o.includes(p.o)) &&
          (!f.c.length || f.c.includes(p.c)) &&
          (!f.a.length || f.a.includes(p.a)),
      ),
    );
  };
  $$("aside input").forEach((i) => i.addEventListener("change", apply));
  apply();
}
const ok = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const nl = $("#newsletter");
if (nl)
  nl.addEventListener("submit", (e) => {
    e.preventDefault();
    const i = $("input", nl);
    if (!ok(i.value)) {
      i.setCustomValidity("Enter a valid email address");
      i.reportValidity();
      i.setCustomValidity("");
      return;
    }
    nl.innerHTML = "<p>Thanks! Check your inbox for your 20% off code.</p>";
  });
const cf = $("#contact-form");
if (cf)
  cf.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = cf.elements;
    let bad = false;
    const chk = (el, test, m) => {
      const er = el.parentElement.querySelector(".err");
      er.textContent = test ? "" : m;
      if (!test) bad = true;
    };
    chk(f.name, f.name.value.trim().length > 1, "Enter your name.");
    chk(f.email, ok(f.email.value), "Enter a valid email address.");
    chk(
      f.message,
      f.message.value.trim().length > 9,
      "Message must be at least 10 characters.",
    );
    if (!bad) {
      cf.reset();
      $(".msg").style.display = "block";
    } else $(".msg").style.display = "none";
  });
loadCart();
