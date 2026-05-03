/* =====================================================
   TAKESTREET — app.js (API-integrated)
   Conecta o frontend à API REST Node.js/Express
===================================================== */

/* ============================================================
   MODULE: api.js — cliente HTTP centralizado
   ============================================================ */

const API_BASE = '/api';

/**
 * Wrapper de fetch com tratamento de erros e token JWT automático.
 * @param {string} endpoint  - Ex: '/products'
 * @param {object} options   - fetch options (method, body, etc.)
 * @returns {Promise<any>}   - JSON da resposta
 */
async function apiFetch(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Erro ${res.status}`);
  }

  return data;
}

/* ── Token helpers ───────────────────────────── */

function getToken()          { return localStorage.getItem('ts_token'); }
function setToken(t)         { localStorage.setItem('ts_token', t); }
function removeToken()       { localStorage.removeItem('ts_token'); }
function getSessionCache()   {
  try { return JSON.parse(localStorage.getItem('ts_session_cache')); } catch { return null; }
}
function setSessionCache(u)  { localStorage.setItem('ts_session_cache', JSON.stringify(u)); }
function clearSessionCache() { localStorage.removeItem('ts_session_cache'); }


/* ============================================================
   MODULE: security.js — sanitização client-side
   ============================================================ */

function sanitize(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isValidUrl(url) {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch { return false; }
}


/* ============================================================
   MODULE: data.js — ícones SVG fallback
   ============================================================ */

const ICONS = {
  default: `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" fill="#181818"/>
    <path d="M8 12h16M8 16h10M8 20h12" stroke="#333" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,
  shirt: `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" fill="#181818"/>
    <path d="M12 8l-5 4 3 1v10h12V13l3-1-5-4c0 0-1 3-4 3s-4-3-4-3z" stroke="#444" stroke-width="1.2" fill="none"/>
  </svg>`,
  shoe: `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" fill="#181818"/>
    <path d="M5 22c0 0 2-6 6-7l5-1 6 2 4 2v2H5z" stroke="#444" stroke-width="1.2" fill="none"/>
  </svg>`,
  hat: `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" fill="#181818"/>
    <ellipse cx="16" cy="20" rx="10" ry="3" stroke="#444" stroke-width="1.2" fill="none"/>
    <path d="M10 20v-6a6 6 0 0112 0v6" stroke="#444" stroke-width="1.2" fill="none"/>
  </svg>`
};


/* ============================================================
   MODULE: products.js — estado de filtros + render
   ============================================================ */

let currentGender   = '';
let currentCat      = 'todos';
let currentSort     = 'rel';
let activePlatforms = [];
let searchQuery     = '';

// Cache de produtos carregados
let PRODUCTS = [];

/* ── Fetch da API ────────────────────────────── */

async function fetchProducts() {
  const params = new URLSearchParams();

  if (currentGender)         params.set('gender',   currentGender);
  if (currentCat !== 'todos') params.set('category', currentCat);
  if (currentSort !== 'rel')  params.set('sort',     currentSort);
  if (activePlatforms.length === 1) params.set('platform', activePlatforms[0]);
  if (searchQuery)           params.set('q', searchQuery);

  try {
    const data = await apiFetch(`/products?${params}`);
    PRODUCTS = data.products || [];
    return PRODUCTS;
  } catch (err) {
    console.error('[fetchProducts]', err);
    PRODUCTS = [];
    return [];
  }
}

/* ── Seleção de gênero ───────────────────────── */

function setGender(gender) {
  currentGender   = gender;
  currentCat      = 'todos';
  activePlatforms = [];
  showPage('shop');
  updateCatBar();
  renderProducts();
  updateShopTitle();
}

/* ── Categoria ───────────────────────────────── */

function setCat(cat) {
  currentCat = cat;
  document.querySelectorAll('.cat-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.cat === cat)
  );
  renderProducts();
  updateShopTitle();
}

function updateCatBar() {
  document.querySelectorAll('.cat-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.cat === 'todos')
  );
}

/* ── Plataforma ──────────────────────────────── */

function togglePlatform(plat) {
  const idx = activePlatforms.indexOf(plat);
  if (idx > -1) activePlatforms.splice(idx, 1);
  else activePlatforms.push(plat);

  document.querySelectorAll('.fchip').forEach(c =>
    c.classList.toggle('on', activePlatforms.includes(c.dataset.plat))
  );
  renderProducts();
}

/* ── Ordenação ───────────────────────────────── */

function setSort(val) {
  currentSort = val;
  renderProducts();
}

/* ── Render grid ─────────────────────────────── */

async function renderProducts() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem 0;opacity:.4">
    <div style="font-family:'Bebas Neue',sans-serif;font-size:1.5rem">CARREGANDO...</div>
  </div>`;

  const list = await fetchProducts();
  const favIds = await loadFavoriteIds();
  const counter = document.getElementById('prodCount');
  if (counter) counter.textContent = list.length;

  if (!list.length) {
    grid.innerHTML = `<div class="no-prod">
      <div class="big">:(</div>
      <p>Nenhum produto encontrado</p>
    </div>`;
    return;
  }

  grid.innerHTML = list.map(p => buildCardHTML(p, favIds)).join('');
}

function buildCardHTML(p, favIds = []) {
  const loved     = favIds.includes(p.id) ? 'loved' : '';
  const badgeHTML = p.badge
    ? `<span class="p-badge ${['hot','mais vendido'].includes(p.badge) ? 'hot' : ''}">${sanitize(p.badge)}</span>`
    : '';
  const discHTML  = p.oldPrice
    ? `<span class="p-disc">-${Math.round((1 - p.price / p.oldPrice) * 100)}%</span>`
    : '';
  const oldpHTML  = p.oldPrice
    ? `<span class="p-oldp">R$ ${Number(p.oldPrice).toFixed(2).replace('.', ',')}</span>`
    : '';
  const thumb     = p.img && p.img.length > 10
    ? `<img src="${sanitize(p.img)}" alt="${sanitize(p.name)}" loading="lazy">`
    : `<div style="font-size:2rem;opacity:.3">${ICONS[p.icon] || ICONS.default}</div>`;

  return `
    <article class="p-card" onclick="openModal(${p.id})">
      <div class="p-thumb">
        ${thumb}
        <div class="p-thumb-overlay">Ver detalhes</div>
        ${badgeHTML}
        <button class="p-heart ${loved}"
          onclick="event.stopPropagation();toggleWish(${p.id})"
          aria-label="Favoritar">${loved ? '♥' : '♡'}</button>
      </div>
      <div class="p-info">
        <div class="p-brand">${sanitize(p.brand)}</div>
        <div class="p-name">${sanitize(p.name)}</div>
        <div class="p-foot">
          <div>
            <span class="p-price">R$ ${Number(p.price).toFixed(2).replace('.', ',')}</span>
            ${oldpHTML}${discHTML}
          </div>
          <button class="p-buy" onclick="event.stopPropagation();buyNow(${p.id})">
            Comprar
          </button>
        </div>
      </div>
    </article>`;
}

function updateShopTitle() {
  const el  = document.getElementById('shopTitleLabel');
  if (!el) return;
  const map = { masculino:'Masculino', feminino:'Feminino', unissex:'Unissex', '':'Todos' };
  el.textContent = map[currentGender] || 'Todos';
}

/* ── Modal de produto ────────────────────────── */

async function openModal(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;

  const favIds = await loadFavoriteIds();
  const loved  = favIds.includes(id);
  const modal  = document.getElementById('productModal');

  const thumbEl = document.getElementById('modalThumb');
  thumbEl.innerHTML = p.img && p.img.length > 10
    ? `<img src="${sanitize(p.img)}" alt="${sanitize(p.name)}">`
    : `<div style="font-size:4rem;opacity:.2">${ICONS[p.icon] || ICONS.default}</div>`;

  document.getElementById('modalBrand').textContent = p.brand;
  document.getElementById('modalName').textContent  = p.name;

  const priceEl = document.getElementById('modalPrice');
  priceEl.innerHTML = `R$ ${Number(p.price).toFixed(2).replace('.', ',')}`;
  if (p.oldPrice) priceEl.innerHTML +=
    ` <span class="old">R$ ${Number(p.oldPrice).toFixed(2).replace('.', ',')}</span>`;

  document.getElementById('modalTags').innerHTML =
    (p.tags || []).map(t => `<span class="modal-tag">${sanitize(t)}</span>`).join('');
  document.getElementById('modalDesc').textContent = p.desc || '';

  const platEl = document.getElementById('modalPlat');
  if (platEl) platEl.textContent = p.platform ? `Disponível em: ${p.platform}` : '';

  const wishBtn = document.getElementById('modalWishBtn');
  if (wishBtn) {
    wishBtn.classList.toggle('loved', loved);
    wishBtn.innerHTML = loved ? '♥' : '♡';
    wishBtn.onclick = async () => {
      await toggleWish(id);
      const newIds  = await loadFavoriteIds();
      const newLoved = newIds.includes(id);
      wishBtn.classList.toggle('loved', newLoved);
      wishBtn.innerHTML = newLoved ? '♥' : '♡';
    };
  }

  const buyBtn = document.getElementById('modalBuyBtn');
  if (buyBtn) buyBtn.onclick = () => buyNow(id);

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('productModal').classList.remove('open');
  document.body.style.overflow = '';
}

function buyNow(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  if (p.link && isValidUrl(p.link)) window.open(p.link, '_blank', 'noopener,noreferrer');
  else toast('Link de compra não disponível.', '');
}


/* ============================================================
   MODULE: search.js — busca via API
   ============================================================ */

function openSearch() {
  document.getElementById('searchOv').classList.add('open');
  document.getElementById('searchInput').value = '';
  document.getElementById('searchResults').innerHTML = '';
  setTimeout(() => document.getElementById('searchInput').focus(), 80);
}

function closeSearch() {
  document.getElementById('searchOv').classList.remove('open');
}

let _searchTimer = null;

async function renderSearch() {
  const q       = document.getElementById('searchInput').value.trim();
  const results = document.getElementById('searchResults');

  if (!q) { results.innerHTML = ''; return; }

  clearTimeout(_searchTimer);
  _searchTimer = setTimeout(async () => {
    try {
      const data    = await apiFetch(`/products/search?q=${encodeURIComponent(q)}`);
      const matches = data.products || [];

      if (!matches.length) {
        results.innerHTML = `<p style="font-family:'Barlow Condensed',sans-serif;font-size:.75rem;
          letter-spacing:2px;text-transform:uppercase;color:#555;padding-top:.5rem">
          Nenhum resultado para "${sanitize(q)}"</p>`;
        return;
      }

      results.innerHTML = matches.map(p => {
        const thumb = p.img && p.img.length > 10
          ? `<img src="${sanitize(p.img)}" alt="${sanitize(p.name)}">`
          : ICONS[p.icon] || ICONS.default;
        return `
          <div class="sr-item" onclick="closeSearch();openModal(${p.id})">
            <div class="sr-ico">${thumb}</div>
            <div class="sr-info">
              <div class="sr-name">${sanitize(p.name)}</div>
              <div class="sr-sub">${sanitize(p.brand)} · ${sanitize(p.category)}</div>
            </div>
            <span class="sr-price">R$ ${Number(p.price).toFixed(2).replace('.', ',')}</span>
          </div>`;
      }).join('');

      // Garante que produtos da busca estejam no cache para o modal
      matches.forEach(p => {
        if (!PRODUCTS.find(x => x.id === p.id)) PRODUCTS.push(p);
      });
    } catch (err) {
      results.innerHTML = `<p style="color:#555;font-family:'Barlow Condensed',sans-serif;
        font-size:.75rem;letter-spacing:2px">Erro na busca.</p>`;
    }
  }, 280); // debounce 280ms
}


/* ============================================================
   MODULE: wishlist.js — via API
   ============================================================ */

let _favIdsCache = null;

async function loadFavoriteIds() {
  if (!getToken()) return [];
  if (_favIdsCache !== null) return _favIdsCache;
  try {
    const data    = await apiFetch('/wishlist/ids');
    _favIdsCache  = data.ids || [];
    return _favIdsCache;
  } catch { return []; }
}

function invalidateFavCache() { _favIdsCache = null; }

async function toggleWish(id) {
  if (!getToken()) { openAuth('login'); toast('Entre para salvar favoritos.', ''); return; }

  const favIds = await loadFavoriteIds();
  const isIn   = favIds.includes(id);

  try {
    if (isIn) {
      await apiFetch(`/wishlist/${id}`, { method: 'DELETE' });
      toast('Removido dos favoritos.');
    } else {
      await apiFetch('/wishlist', { method: 'POST', body: JSON.stringify({ productId: id }) });
      toast('Adicionado aos favoritos! ♥', 'green');
    }
    invalidateFavCache();
    updateCardHeart(id, !isIn);
    updateWishBadge();
    if (document.getElementById('wishDrawer').classList.contains('open')) renderWishDrawer();
  } catch (err) {
    toast(err.message || 'Erro ao atualizar favoritos.', 'red');
  }
}

function updateCardHeart(id, loved) {
  document.querySelectorAll('.p-heart').forEach(h => {
    if (h.getAttribute('onclick')?.includes(`${id}`)) {
      h.classList.toggle('loved', loved);
      h.innerHTML = loved ? '♥' : '♡';
    }
  });
}

async function updateWishBadge() {
  const badge = document.querySelector('#wishBtn .badge');
  if (!badge) return;
  const ids   = await loadFavoriteIds();
  const count = ids.length;
  badge.textContent = count > 9 ? '9+' : count;
  badge.classList.toggle('visible', count > 0);
}

function openWish() {
  renderWishDrawer();
  document.getElementById('wishDrawer').classList.add('open');
  document.querySelector('.drw-ov').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeWish() {
  document.getElementById('wishDrawer').classList.remove('open');
  document.querySelector('.drw-ov').classList.remove('open');
  document.body.style.overflow = '';
}

async function renderWishDrawer() {
  const container = document.getElementById('wishList');
  if (!container) return;

  container.innerHTML = `<div style="text-align:center;padding:2rem;opacity:.4;
    font-family:'Bebas Neue',sans-serif;font-size:1rem">CARREGANDO...</div>`;

  if (!getToken()) {
    container.innerHTML = `<div class="wish-empty">
      <div class="big">♡</div><p>Entre para ver seus favoritos</p></div>`;
    return;
  }

  try {
    const data  = await apiFetch('/wishlist');
    const prods = data.products || [];
    invalidateFavCache();

    if (!prods.length) {
      container.innerHTML = `<div class="wish-empty">
        <div class="big">♡</div><p>Nenhum favorito ainda</p></div>`;
      return;
    }

    container.innerHTML = prods.map(p => {
      const thumb = p.img && p.img.length > 10
        ? `<img src="${sanitize(p.img)}" alt="${sanitize(p.name)}">`
        : ICONS[p.icon] || ICONS.default;
      return `<div class="wish-item">
        <div class="wish-ico">${thumb}</div>
        <div class="wish-info">
          <div class="wish-name">${sanitize(p.name)}</div>
          <div class="wish-price">R$ ${Number(p.price).toFixed(2).replace('.', ',')}</div>
        </div>
        <button class="wish-rm" onclick="toggleWish(${p.id})" aria-label="Remover">✕</button>
      </div>`;
    }).join('');
  } catch (err) {
    container.innerHTML = `<div class="wish-empty"><p>Erro ao carregar favoritos.</p></div>`;
  }
}


/* ============================================================
   MODULE: auth.js — login/register via API
   ============================================================ */

function openAuth(tab = 'login') {
  document.getElementById('authModal').classList.add('open');
  switchAuthTab(tab);
  setTimeout(() => {
    const el = tab === 'login'
      ? document.getElementById('loginUser')
      : document.getElementById('regUser');
    if (el) el.focus();
  }, 120);
}

function closeAuth() {
  document.getElementById('authModal').classList.remove('open');
  ['loginErr', 'regErr'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
}

function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.auth-form').forEach(f => f.classList.add('hidden'));
  document.querySelector(`.auth-tab[data-tab="${tab}"]`)?.classList.add('active');
  document.getElementById(`form-${tab}`)?.classList.remove('hidden');
}

async function doLogin() {
  const username = document.getElementById('loginUser').value.trim();
  const password = document.getElementById('loginPass').value;
  const errEl    = document.getElementById('loginErr');

  if (!username || !password) { errEl.textContent = 'Preencha todos os campos.'; return; }

  const btn = document.querySelector('#form-login .form-submit');
  if (btn) { btn.disabled = true; btn.textContent = 'ENTRANDO...'; }

  try {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });

    setToken(data.token);
    setSessionCache(data.user);
    invalidateFavCache();
    closeAuth();
    updateAuthUI();
    toast(`Bem-vindo, ${sanitize(data.user.username)}!`, 'green');
    renderWishDrawer();
    updateWishBadge();
  } catch (err) {
    errEl.textContent = err.message || 'Erro no login.';
    document.getElementById('loginPass').value = '';
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'ENTRAR'; }
  }
}

async function doRegister() {
  const username = document.getElementById('regUser').value.trim();
  const email    = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPass').value;
  const errEl    = document.getElementById('regErr');

  if (!username || !password) { errEl.textContent = 'Usuário e senha são obrigatórios.'; return; }

  const btn = document.querySelector('#form-register .form-submit');
  if (btn) { btn.disabled = true; btn.textContent = 'CRIANDO...'; }

  try {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password })
    });

    setToken(data.token);
    setSessionCache(data.user);
    invalidateFavCache();
    closeAuth();
    updateAuthUI();
    toast(`Conta criada! Bem-vindo, ${sanitize(data.user.username)}!`, 'green');
  } catch (err) {
    errEl.textContent = err.message || 'Erro ao criar conta.';
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'CRIAR CONTA'; }
  }
}

function doLogout() {
  removeToken();
  clearSessionCache();
  invalidateFavCache();
  updateAuthUI();
  closeUserMenu();
  renderWishDrawer();
  updateWishBadge();
  toast('Sessão encerrada.');
}

function getSession() {
  if (!getToken()) return null;
  return getSessionCache();
}

function updateAuthUI() {
  const session    = getSession();
  const navUserBtn = document.getElementById('navUserBtn');

  document.querySelectorAll('.guest-only').forEach(el =>
    el.style.display = session ? 'none' : '');
  document.querySelectorAll('.user-only').forEach(el =>
    el.style.display = session ? '' : 'none');

  if (navUserBtn) {
    navUserBtn.textContent = session
      ? session.username.charAt(0).toUpperCase()
      : '?';
    navUserBtn.title = session ? session.username : 'Entrar';
  }

  const nameEl = document.getElementById('menuUserName');
  if (nameEl && session) nameEl.textContent = session.username;

  updateWishBadge();
}

function checkPassStrength(input) {
  const bar = input.parentElement.querySelector('.pass-strength');
  if (!bar) return;
  const v = input.value;
  let s = 'weak';
  if (v.length >= 8 && /[A-Z]/.test(v) && /[0-9]/.test(v)) s = 'strong';
  else if (v.length >= 6) s = 'medium';
  bar.className = `pass-strength ${s}`;
}

function toggleUserMenu() {
  const m = document.getElementById('userMenu');
  m.classList.toggle('open');
  if (m.classList.contains('open'))
    document.addEventListener('click', outsideUserMenu, { once: true });
}

function outsideUserMenu(e) {
  if (!document.getElementById('userMenu').contains(e.target) &&
      e.target !== document.getElementById('navUserBtn')) closeUserMenu();
}

function closeUserMenu() {
  document.getElementById('userMenu').classList.remove('open');
}


/* ============================================================
   MODULE: app.js — SPA router + eventos globais
   ============================================================ */

const PAGES = ['home', 'shop', 'cultura', 'sobre'];

function showPage(id) {
  if (!PAGES.includes(id)) return;
  PAGES.forEach(p => {
    const el = document.getElementById(`page-${p}`);
    if (el) el.classList.toggle('active', p === id);
  });
  document.querySelectorAll('.nav-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.page === id));
  document.querySelectorAll('.mob-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.page === id));
  closeMobile();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (id === 'shop') renderProducts();
}

function navTo(page) { showPage(page); }

/* ── Navbar scroll ───────────────────────────── */

function updateNavScroll() {
  document.getElementById('navbar')
    ?.classList.toggle('scrolled', window.scrollY > 40);
  document.getElementById('scrollTop')
    ?.classList.toggle('visible', window.scrollY > 300);
}
window.addEventListener('scroll', updateNavScroll, { passive: true });

/* ── Mobile menu ─────────────────────────────── */

function toggleMobile() {
  const btn = document.getElementById('mobileMenuBtn');
  btn.classList.toggle('open');
  btn.setAttribute('aria-expanded', btn.classList.contains('open'));
  document.getElementById('mobileNav').classList.toggle('open');
}

function closeMobile() {
  const btn = document.getElementById('mobileMenuBtn');
  if (!btn) return;
  btn.classList.remove('open');
  btn.setAttribute('aria-expanded', 'false');
  document.getElementById('mobileNav')?.classList.remove('open');
}

/* ── FAQ ─────────────────────────────────────── */

function toggleFaq(item) {
  const was = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  if (!was) item.classList.add('open');
}

/* ── Toast ───────────────────────────────────── */

function toast(msg, type = '') {
  const c = document.getElementById('toastCont');
  if (!c) return;
  const t       = document.createElement('div');
  t.className   = `toast ${type}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3100);
}

/* ── Cookie banner ───────────────────────────── */

function acceptCookie() {
  localStorage.setItem('ts_cookie', '1');
  document.getElementById('cookieBanner')?.classList.remove('show');
}

/* ── Stat observer ───────────────────────────── */

function initStatObserver() {
  const items = document.querySelectorAll('.stat-item');
  if (!items.length) return;
  const obs = new IntersectionObserver(entries =>
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); }),
    { threshold: 0.2 }
  );
  items.forEach(el => obs.observe(el));
}

/* ── Contadores da home ──────────────────────── */

async function updateGenderCounts() {
  try {
    const [men, women] = await Promise.all([
      apiFetch('/products?gender=masculino'),
      apiFetch('/products?gender=feminino')
    ]);
    const mEl = document.getElementById('countMen');
    const wEl = document.getElementById('countWomen');
    if (mEl) mEl.textContent = `${men.total || men.products?.length || 0} PRODUTOS`;
    if (wEl) wEl.textContent = `${women.total || women.products?.length || 0} PRODUTOS`;
  } catch { /* silencioso */ }
}

/* ── Eventos globais ─────────────────────────── */

document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  closeModal();
  closeSearch();
  closeAuth();
});

document.getElementById('authModal')?.addEventListener('click', function(e) {
  if (e.target === this) closeAuth();
});

document.getElementById('loginPass')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') doLogin();
});

/* ── Inicialização ───────────────────────────── */

(async function init() {
  showPage('home');
  updateAuthUI();
  initStatObserver();
  updateGenderCounts();

  if (!localStorage.getItem('ts_cookie')) {
    setTimeout(() =>
      document.getElementById('cookieBanner')?.classList.add('show'), 1800);
  }

  // Valida token salvo ao iniciar
  if (getToken()) {
    try {
      const data = await apiFetch('/auth/me');
      setSessionCache(data.user);
      updateAuthUI();
      updateWishBadge();
    } catch {
      // Token expirado ou inválido
      removeToken();
      clearSessionCache();
      updateAuthUI();
    }
  }
})();
