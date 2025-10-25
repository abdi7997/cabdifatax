// ELECTROSHOP - plain JS (no frameworks)
// Products catalog (you can replace images with real product images)
const products = [
  { id:1, name:"Laptop Pro 15\"", category:"laptop", price:1299.00, img:"https://picsum.photos/seed/lap1/800/600", desc:"15-inch, 16GB RAM, 512GB SSD, i7 processor." },
  { id:2, name:"Notebook Air 13\"", category:"laptop", price:999.00, img:"https://picsum.photos/seed/lap2/800/600", desc:"13-inch lightweight, 8GB RAM, 256GB SSD." },
  { id:3, name:"Smartphone X", category:"phone", price:799.00, img:"https://picsum.photos/seed/phone1/800/600", desc:"6.5\" display, 128GB, triple camera." },
  { id:4, name:"Smartphone Mini", category:"phone", price:499.00, img:"https://picsum.photos/seed/phone2/800/600", desc:"Compact, 64GB storage, long battery life." },
  { id:5, name:"Wireless Headphones", category:"accessory", price:149.00, img:"https://picsum.photos/seed/acc1/800/600", desc:"Noise cancelling, 30h battery." },
  { id:6, name:"USB-C Charger 65W", category:"accessory", price:39.00, img:"https://picsum.photos/seed/acc2/800/600", desc:"Fast charging for laptops and phones." }
];

// DOM refs
const productsEl = document.getElementById('products');
const categoryEl = document.getElementById('category');
const searchEl = document.getElementById('search');
const cartToggle = document.getElementById('cart-toggle');
const cartPanel = document.getElementById('cart-panel');
const cartCountEl = document.getElementById('cart-count');
const cartListEl = document.getElementById('cart-list');
const totalEl = document.getElementById('total');
const clearCartBtn = document.getElementById('clear-cart');
const checkoutBtn = document.getElementById('checkout');

// Modal refs
const modal = document.getElementById('product-modal');
const modalClose = document.getElementById('modal-close');
const modalImg = document.getElementById('modal-img');
const modalName = document.getElementById('modal-name');
const modalDesc = document.getElementById('modal-desc');
const modalPrice = document.getElementById('modal-price');
const modalQty = document.getElementById('modal-qty');
const modalAdd = document.getElementById('modal-add');

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// CART state
let cart = [];

// Load saved cart
function loadCart() {
  try {
    const s = localStorage.getItem('electroCart');
    if (s) cart = JSON.parse(s);
  } catch(e) { cart = []; }
  updateCartUI();
}

// Save cart
function saveCart() {
  localStorage.setItem('electroCart', JSON.stringify(cart));
}

// Render products based on filters
function renderProducts() {
  const q = searchEl.value.trim().toLowerCase();
  const cat = categoryEl.value;
  productsEl.innerHTML = '';

  const filtered = products.filter(p => {
    const matchQ = p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q);
    const matchCat = (cat === 'all') ? true : p.category === cat;
    return matchQ && matchCat;
  });

  if (filtered.length === 0) {
    productsEl.innerHTML = `<p style="grid-column:1/-1;color:var(--muted)">Alaabo la waayey...</p>`;
    return;
  }

  filtered.forEach(p => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p class="desc">${p.desc}</p>
      <div class="meta">
        <strong>$${p.price.toFixed(2)}</strong>
        <div>
          <button class="btn small ghost" data-action="view" data-id="${p.id}">Faahfaahin</button>
          <button class="btn small primary" data-action="add" data-id="${p.id}">Gali Cart</button>
        </div>
      </div>
    `;
    productsEl.appendChild(card);
  });

  // attach handlers
  productsEl.querySelectorAll('button').forEach(btn=>{
    const id = Number(btn.dataset.id);
    const action = btn.dataset.action;
    if (action === 'add') btn.addEventListener('click', ()=> addToCart(id,1));
    if (action === 'view') btn.addEventListener('click', ()=> openModal(id));
  });
}

// Add product to cart
function addToCart(id, qty=1) {
  const prod = products.find(p=>p.id===id);
  if(!prod) return;
  const item = cart.find(c=>c.id===id);
  if(item) item.qty += qty;
  else cart.push({ id:prod.id, name:prod.name, price:prod.price, qty });
  updateCartUI();
  saveCart();
}

// Update cart UI
function updateCartUI() {
  cartCountEl.textContent = cart.reduce((s,i)=> s + i.qty, 0);
  cartListEl.innerHTML = '';
  if (cart.length === 0) {
    cartListEl.innerHTML = '<li style="color:var(--muted)">Gaadhigu waa madhan yahay.</li>';
    totalEl.textContent = '0.00';
    return;
  }

  cart.forEach(item=>{
    const li = document.createElement('li');
    li.innerHTML = `
      <div>
        <strong>${item.name}</strong>
        <div style="color:var(--muted);font-size:0.9rem">$${item.price.toFixed(2)} × ${item.qty}</div>
      </div>
      <div style="display:flex;gap:6px;align-items:center">
        <button class="btn small" data-action="dec" data-id="${item.id}">−</button>
        <button class="btn small" data-action="inc" data-id="${item.id}">+</button>
        <button class="btn small danger" data-action="remove" data-id="${item.id}">x</button>
      </div>
    `;
    cartListEl.appendChild(li);
  });

  // attach cart item handlers
  cartListEl.querySelectorAll('button').forEach(btn=>{
    const id = Number(btn.dataset.id);
    const action = btn.dataset.action;
    btn.addEventListener('click', ()=>{
      if(action === 'inc') changeQty(id, +1);
      if(action === 'dec') changeQty(id, -1);
      if(action === 'remove') removeItem(id);
    });
  });

  const total = cart.reduce((s,i)=> s + i.price * i.qty, 0);
  totalEl.textContent = total.toFixed(2);
  saveCart();
}

// Change quantity
function changeQty(id, delta) {
  const it = cart.find(c=>c.id===id);
  if(!it) return;
  it.qty += delta;
  if(it.qty < 1) removeItem(id);
  updateCartUI();
  saveCart();
}

// Remove item
function removeItem(id) {
  cart = cart.filter(c=>c.id !== id);
  updateCartUI();
  saveCart();
}

// Clear cart
clearCartBtn.addEventListener('click', ()=>{
  if(!confirm('Miyaad hubtaa inaad nadiifiso gaadhiga?')) return;
  cart = [];
  updateCartUI();
  saveCart();
});

// Checkout (simulate)
checkoutBtn.addEventListener('click', ()=>{
  if(cart.length === 0) { alert('Gaadhigu waa madhan yahay.'); return; }
  alert('Checkout simulated — Waad ku mahadsan tahay dalabka! (Cart ayaa nadiifin doona)');
  cart = [];
  updateCartUI();
  saveCart();
});

// Toggle cart panel
cartToggle.addEventListener('click', ()=>{
  const hidden = cartPanel.getAttribute('aria-hidden') === 'true';
  cartPanel.setAttribute('aria-hidden', (!hidden).toString());
});

// Filters
categoryEl.addEventListener('change', renderProducts);
searchEl.addEventListener('input', debounce(renderProducts, 220));

// Modal functions
function openModal(id) {
  const p = products.find(x=>x.id===id);
  if(!p) return;
  modalImg.src = p.img;
  modalName.textContent = p.name;
  modalDesc.textContent = p.desc;
  modalPrice.textContent = p.price.toFixed(2);
  modalQty.value = 1;
  modalAdd.dataset.id = p.id;
  modal.setAttribute('aria-hidden','false');
}
modalClose.addEventListener('click', ()=> modal.setAttribute('aria-hidden','true'));
modal.addEventListener('click', (e)=> {
  if(e.target === modal) modal.setAttribute('aria-hidden','true');
});

// Add from modal
modalAdd.addEventListener('click', ()=>{
  const id = Number(modalAdd.dataset.id);
  const qty = Math.max(1, Number(modalQty.value) || 1);
  addToCart(id, qty);
  modal.setAttribute('aria-hidden','true');
});

// Utility: debounce
function debounce(fn, wait){
  let t;
  return function(...args){
    clearTimeout(t);
    t = setTimeout(()=> fn.apply(this,args), wait);
  };
}

// Init
renderProducts();
loadCart();
