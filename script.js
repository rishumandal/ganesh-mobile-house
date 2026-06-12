// ── Hamburger menu ──────────────────────────────────────────────
document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('navLinks').classList.toggle('open');
});

// ── Product data & rendering ─────────────────────────────────────
const products = [
  { name: "Chargers",      desc: "Fast charging adapters and cables for all phone models.",          emoji: "🔌", tag: "Accessory"  },
  { name: "Displays",      desc: "LCD and AMOLED replacement screens for all brands.",               emoji: "📺", tag: "Spare Part" },
  { name: "Earbuds",       desc: "Wired and wireless earbuds for music and calls.",                  emoji: "🎧", tag: "Accessory"  },
  { name: "Flex Cables",   desc: "Ribbon flex cables for buttons, cameras, and connectors.",         emoji: "🔗", tag: "Spare Part" },
  { name: "Volume Buttons",desc: "Replacement side buttons and power keys for phones.",              emoji: "🔊", tag: "Spare Part" },
  { name: "Back Panels",   desc: "Rear covers and battery doors for all major phone models.",        emoji: "📱", tag: "Spare Part" },
  { name: "Batteries",     desc: "Original capacity replacement batteries, all brands.",             emoji: "🔋", tag: "Spare Part" },
  { name: "Camera glass",  desc: "Front and rear camera modules, main and wide lenses.",             emoji: "📷", tag: "Spare Part" },
];

function buildProducts() {
  const grid = document.getElementById('productsGrid');
  grid.innerHTML = '';
  products.forEach((p, i) => {
    const saved = localStorage.getItem('product_img_' + i);
    const imgHtml = saved
      ? `<img src="${saved}" alt="${p.name}"/>`
      : `<div class="product-img-placeholder"><span class="emoji">${p.emoji}</span><span>Upload product photo</span></div>`;
    grid.innerHTML += `
      <div class="product-card">
        <div class="product-img-wrap">
          ${imgHtml}
          <label class="product-upload-btn">📷 Add Photo
            <input type="file" accept="image/*" onchange="uploadProductPhoto(this,${i})"/>
          </label>
        </div>
        <div class="product-info">
          <div class="product-name">${p.name}</div>
          <div class="product-desc">${p.desc}</div>
          <span class="product-tag">${p.tag}</span>
        </div>
      </div>`;
  });
}
buildProducts();

function uploadProductPhoto(input, idx) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    localStorage.setItem('product_img_' + idx, e.target.result);
    buildProducts();
    showToast('Product photo updated! ✓');
  };
  reader.readAsDataURL(file);
}

// ── Owner photo ──────────────────────────────────────────────────
const savedOwner = localStorage.getItem('owner_photo');
if (savedOwner) setOwnerPhoto(savedOwner);

function uploadOwnerPhoto(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    localStorage.setItem('owner_photo', e.target.result);
    setOwnerPhoto(e.target.result);
    showToast('Owner photo updated! ✓');
  };
  reader.readAsDataURL(file);
}

function setOwnerPhoto(src) {
  const img = document.getElementById('ownerPhotoImg');
  const ph  = document.getElementById('ownerPlaceholder');
  img.src = src;
  img.style.display = 'block';
  ph.style.display  = 'none';
}

// ── Phone number ─────────────────────────────────────────────────
const savedPhone = localStorage.getItem('shop_phone');
if (savedPhone) document.getElementById('phone-display').textContent = savedPhone;

function togglePhoneEdit() {
  const f = document.getElementById('phone-edit-form');
  f.style.display = f.style.display === 'none' ? 'block' : 'none';
}

function savePhone() {
  const val = document.getElementById('phoneInput').value.trim();
  if (!val) return;
  localStorage.setItem('shop_phone', val);
  document.getElementById('phone-display').textContent = val;
  document.getElementById('phone-edit-form').style.display = 'none';
  showToast('Phone number saved! ✓');
}

// ── Star rating selector ─────────────────────────────────────────
let selectedStars = 0;
document.getElementById('starSelector').addEventListener('click', e => {
  if (!e.target.dataset.val) return;
  selectedStars = parseInt(e.target.dataset.val);
  document.querySelectorAll('#starSelector span').forEach((s, i) => {
    s.classList.toggle('active', i < selectedStars);
  });
});

// ── Reviews ──────────────────────────────────────────────────────
function loadReviews()      { return JSON.parse(localStorage.getItem('reviews') || '[]'); }
function saveReviews(r)     { localStorage.setItem('reviews', JSON.stringify(r)); }

function renderReviews() {
  const list    = document.getElementById('reviewsList');
  const reviews = loadReviews();
  if (!reviews.length) {
    list.innerHTML = '<div class="no-reviews"><div class="big">🌟</div><p style="margin-top:10px;">Be the first to leave a review!<br/>Your feedback means the world to us.</p></div>';
    return;
  }
  list.innerHTML = reviews.map(r => `
    <div class="review-card">
      <div class="review-header">
        <span class="reviewer-name">👤 ${r.name}${r.product ? ' — <em style="color:var(--text-light);font-style:normal;font-size:.85rem;">' + r.product + '</em>' : ''}</span>
        <span class="review-stars">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</span>
      </div>
      <div class="review-text">${r.text}</div>
      <div class="review-date">${r.date}</div>
    </div>`).join('');
}
renderReviews();

function submitReview() {
  const name    = document.getElementById('rName').value.trim();
  const text    = document.getElementById('rText').value.trim();
  const product = document.getElementById('rProduct').value.trim();
  if (!name || !text || !selectedStars) { showToast('Please fill your name, rating & review ✏️'); return; }

  const reviews = loadReviews();
  reviews.unshift({
    name, text, product, stars: selectedStars,
    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  });
  saveReviews(reviews);

  document.getElementById('rName').value    = '';
  document.getElementById('rText').value    = '';
  document.getElementById('rProduct').value = '';
  selectedStars = 0;
  document.querySelectorAll('#starSelector span').forEach(s => s.classList.remove('active'));

  renderReviews();
  showToast('Review submitted! Thank you 🌟');
  document.getElementById('reviewsList').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ── Toast notification ───────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}
