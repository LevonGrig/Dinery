// ── Restaurant data ──────────────────────────────────────────────────────────
const RESTAURANTS = [
  { id:0, name:"Lumière", cuisine:"French",
    desc:"Award-winning French fine dining in the heart of the city. Chef Antoine brings Michelin-starred techniques to every plate, creating an unforgettable sensory journey.",
    rating:"4.9", dist:"0.8km", price:"$$$", time:"23:00",
    address:"12 Rue de la Paix, City Centre", phone:"+1 555 0101",
    img:"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    menu:[
      { cat:"Starters", items:[
        { name:"Foie Gras Torchon", desc:"House brioche, fig compote", price:"$28" },
        { name:"Oysters Gratinée",  desc:"Champagne sabayon, caviar", price:"$32" },
      ]},
      { cat:"Mains", items:[
        { name:"Filet de Bœuf",  desc:"Truffle jus, dauphinoise potato", price:"$68" },
        { name:"Sole Meunière",  desc:"Brown butter, capers, lemon",     price:"$54" },
      ]},
      { cat:"Desserts", items:[
        { name:"Soufflé au Chocolat", desc:"Madagascan vanilla ice cream", price:"$18" },
        { name:"Crème Brûlée",        desc:"Classic Tahitian vanilla",     price:"$14" },
      ]},
    ],
    reviews:[
      { name:"Emily R.", stars:5, text:"An absolutely magical evening. The sommelier's pairing was exceptional." },
      { name:"James T.", stars:5, text:"The tasting menu is worth every penny. Service was impeccable." },
    ]
  },
  { id:1, name:"Sakura Omakase", cuisine:"Japanese",
    desc:"Premium omakase experience with the freshest daily-flown Tsukiji imports. Only 12 seats ensure an intimate, personalised experience.",
    rating:"4.8", dist:"1.2km", price:"$$$", time:"22:00",
    address:"8 Blossom Lane, Midtown", phone:"+1 555 0202",
    img:"https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80",
    menu:[
      { cat:"Omakase", items:[
        { name:"Chef's Omakase (12 course)", desc:"Daily selection from Tsukiji", price:"$180" },
        { name:"Sake Pairing",               desc:"Curated by our sake sommelier", price:"$65" },
      ]},
      { cat:"À La Carte", items:[
        { name:"A5 Wagyu Nigiri", desc:"Topped with truffle shavings",  price:"$42" },
        { name:"Uni Handroll",    desc:"Santa Barbara uni, crispy nori", price:"$28" },
      ]},
    ],
    reviews:[
      { name:"Sophia K.", stars:5, text:"The best sushi outside of Japan. Chef's attention to detail is extraordinary." },
    ]
  },
  { id:2, name:"Ember & Stone", cuisine:"Steakhouse",
    desc:"Premium dry-aged beef and wood-fired cooking in an atmospheric setting. Our 45-day dry-aged cuts are sourced from a single farm in the Scottish Highlands.",
    rating:"4.7", dist:"2.1km", price:"$$", time:"23:30",
    address:"34 Grill Street, West End", phone:"+1 555 0303",
    img:"https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
    menu:[
      { cat:"Steaks", items:[
        { name:"Côte de Bœuf (for 2)", desc:"45-day dry-aged, bone-in rib",   price:"$145" },
        { name:"Filet Mignon 8oz",     desc:"Béarnaise or red wine jus",       price:"$72" },
      ]},
      { cat:"Sides", items:[
        { name:"Truffle Mac & Cheese",   desc:"Black truffle, aged Gruyère", price:"$18" },
        { name:"Crispy Duck Fat Fries",  desc:"Smoked paprika aioli",         price:"$12" },
      ]},
    ],
    reviews:[
      { name:"Marcus L.", stars:5, text:"The Côte de Bœuf for two is the best steak I've ever had, full stop." },
      { name:"Clara B.",  stars:4, text:"Excellent meat quality. The atmosphere is dark and romantic." },
    ]
  },
  { id:3, name:"Marea Blu", cuisine:"Seafood",
    desc:"Coastal Italian seafood with daily catches from local fishermen. Our terrace overlooks the harbour — the perfect backdrop for a long, lazy lunch.",
    rating:"4.6", dist:"1.8km", price:"$$", time:"22:30",
    address:"Harbour Row 7, Portside", phone:"+1 555 0404",
    img:"https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
    menu:[
      { cat:"Antipasti", items:[
        { name:"Carpaccio di Polpo", desc:"Octopus, lemon oil, celery",     price:"$22" },
        { name:"Burrata & Anchovies",desc:"Heirloom tomatoes, basil oil",   price:"$18" },
      ]},
      { cat:"Primi", items:[
        { name:"Linguine alle Vongole",      desc:"Littleneck clams, white wine, chilli", price:"$34" },
        { name:"Risotto ai Frutti di Mare",  desc:"Mixed shellfish, bisque",              price:"$38" },
      ]},
    ],
    reviews:[
      { name:"Anna M.", stars:5, text:"The freshest seafood in the city. The harbour view from the terrace is stunning." },
    ]
  },
  { id:4, name:"Trattoria Nonna", cuisine:"Italian",
    desc:"Authentic southern Italian home cooking passed down four generations. Handmade pasta rolled fresh each morning, slow-cooked sauces, and a wine list focused on small Italian producers.",
    rating:"4.5", dist:"0.5km", price:"$", time:"22:00",
    address:"23 Vine Street, Old Quarter", phone:"+1 555 0505",
    img:"https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
    menu:[
      { cat:"Pasta", items:[
        { name:"Tagliatelle al Ragù", desc:"8-hour Bolognese, Parmigiano",  price:"$24" },
        { name:"Cacio e Pepe",        desc:"Tonnarelli, Pecorino, black pepper", price:"$20" },
      ]},
      { cat:"Secondi", items:[
        { name:"Osso Buco",               desc:"Slow-braised veal shank, gremolata", price:"$38" },
        { name:"Saltimbocca alla Romana", desc:"Veal, prosciutto, sage",             price:"$32" },
      ]},
    ],
    reviews:[
      { name:"Giulia V.", stars:5, text:"Tastes exactly like my nonna's kitchen. The pasta is exceptional." },
      { name:"Tom H.",    stars:4, text:"A neighbourhood gem. Cosy, affordable, and delicious." },
    ]
  },
];

const TIMES = [
  { t:"12:00", avail:true  }, { t:"12:30", avail:true  }, { t:"13:00", avail:false },
  { t:"13:30", avail:true  }, { t:"14:00", avail:true  }, { t:"14:30", avail:false },
  { t:"18:00", avail:true  }, { t:"18:30", avail:true  }, { t:"19:00", avail:true  },
  { t:"19:30", avail:true  }, { t:"20:00", avail:false }, { t:"20:30", avail:true  },
  { t:"21:00", avail:true  }, { t:"21:30", avail:true  },
];

// ── State ────────────────────────────────────────────────────────────────────
const AUTH_SCREENS    = ['signup','signin'];
const BOOKING_SCREENS = ['book-datetime','book-seating','book-guests','book-details','confirmed'];

let state = {
  currentScreen      : 'home',
  prevScreen         : null,
  selectedRestaurant : null,
  selectedDate       : null,
  selectedTime       : null,
  selectedSeating    : null,
  guestCount         : 2,
  favourites         : [],          // loaded from user.savedRestaurants on login
  reservations       : JSON.parse(localStorage.getItem('dn_reservations') || '[]'),
  searchFilter       : 'All',
  user               : JSON.parse(localStorage.getItem('dn_user') || 'null'),
  pendingSaveId      : null,        // restaurant id queued to save after auth
};

// ── Boot ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (state.user) state.favourites = state.user.savedRestaurants || [];
  renderSearchResults();
  renderHome();
  goScreen('home');
});

// ── Navigation ────────────────────────────────────────────────────────────────
function goScreen(id) {
  document.getElementById('screen-' + state.currentScreen)?.classList.remove('active');
  document.getElementById('screen-' + id)?.classList.add('active');
  state.prevScreen    = state.currentScreen;
  state.currentScreen = id;

  // 'saved' is a sub-screen of profile — keep profile tab highlighted
  document.querySelectorAll('.bottomnav button').forEach(b => b.classList.remove('active'));
  const navBtn = document.getElementById('nav-' + (id === 'saved' ? 'profile' : id));
  if (navBtn) navBtn.classList.add('active');

  // hide bottom nav for auth + booking screens (on desktop it stays as sidebar)
  const hideNav = [...AUTH_SCREENS, ...BOOKING_SCREENS, 'edit-profile'].includes(id);
  if (window.innerWidth < 1200) {
    document.getElementById('bottomnav').style.display = hideNav ? 'none' : 'flex';
  }

  // per-screen init
  if (id === 'home')         renderHome();
  if (id === 'reservations') renderReservations();
  if (id === 'profile')      renderProfile();
  if (id === 'saved')        renderSaved();
  if (id === 'book-details') populateSummary();
  if (id === 'edit-profile') populateEditForm();
}

function goBack(fallback) {
  goScreen(state.prevScreen || fallback);
}

function goSearch() {
  goScreen('search');
  setTimeout(() => document.getElementById('searchInput')?.focus(), 300);
}

// ── Auth ─────────────────────────────────────────────────────────────────────
function doSignUp() {
  const name     = document.getElementById('su-name').value.trim();
  const phone    = document.getElementById('su-phone').value.trim();
  const email    = document.getElementById('su-email').value.trim();
  const password = document.getElementById('su-password').value;

  let ok = true;
  if (!name)                         { showErr('err-su-name',     'Please enter your name');                  ok = false; }
  if (!phone)                        { showErr('err-su-phone',    'Please enter your phone number');          ok = false; }
  if (!email || !email.includes('@')){ showErr('err-su-email',    'Please enter a valid email');              ok = false; }
  if (password.length < 6)           { showErr('err-su-password', 'Password must be at least 6 characters'); ok = false; }
  if (!ok) return;

  const users = JSON.parse(localStorage.getItem('dn_users') || '[]');
  const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    showErr('err-su-email', 'An account with this email already exists — please sign in instead.');
    return;
  }

  const user = { name, phone, email, password, savedRestaurants: [] };
  users.push(user);
  localStorage.setItem('dn_users', JSON.stringify(users));
  localStorage.setItem('dn_user',  JSON.stringify(user));
  state.user      = user;
  state.favourites = [];

  // Auto-save the restaurant the guest was trying to save before signing up
  if (state.pendingSaveId !== null) {
    state.favourites.push(state.pendingSaveId);
    state.pendingSaveId = null;
    persistFavourites();
  }

  showToast('Account created! Welcome, ' + name.split(' ')[0] + ' 👋');
  goScreen(state.prevScreen === 'confirmed' ? 'confirmed' : 'home');
}

function doSignIn() {
  const email    = document.getElementById('si-email').value.trim();
  const password = document.getElementById('si-password').value;

  const users = JSON.parse(localStorage.getItem('dn_users') || '[]');
  const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

  if (!found) {
    showErr('err-si', 'Email or password is incorrect');
    return;
  }

  state.user       = found;
  state.favourites = found.savedRestaurants || [];
  localStorage.setItem('dn_user', JSON.stringify(found));

  // Auto-save any restaurant queued before sign-in
  if (state.pendingSaveId !== null) {
    if (!state.favourites.includes(state.pendingSaveId)) {
      state.favourites.push(state.pendingSaveId);
      persistFavourites();
    }
    state.pendingSaveId = null;
  }

  showToast('Welcome back, ' + found.name.split(' ')[0] + ' 👋');
  goScreen(state.prevScreen === 'profile' ? 'profile' : 'home');
}

function doSignOut() {
  if (!confirm('Sign out of Dinery?')) return;
  state.user       = null;
  state.favourites = [];
  localStorage.removeItem('dn_user');
  goScreen('home');
  showToast('Signed out');
}

function saveProfile() {
  const name     = document.getElementById('ep-name').value.trim();
  const phone    = document.getElementById('ep-phone').value.trim();
  const email    = document.getElementById('ep-email').value.trim();
  const password = document.getElementById('ep-password').value;

  if (!name || !phone || !email) { showToast('Please fill all required fields'); return; }

  const users = JSON.parse(localStorage.getItem('dn_users') || '[]');
  const conflict = users.find(u =>
    u.email.toLowerCase() === email.toLowerCase() &&
    u.email.toLowerCase() !== state.user.email.toLowerCase()
  );
  if (conflict) { showToast('That email is already used by another account'); return; }

  const updated = {
    ...state.user,
    name, phone, email,
    savedRestaurants: state.user.savedRestaurants || [],
    ...(password.length >= 6 ? { password } : {}),
  };

  const idx = users.findIndex(u => u.email.toLowerCase() === state.user.email.toLowerCase());
  if (idx !== -1) users[idx] = updated; else users.push(updated);
  localStorage.setItem('dn_users', JSON.stringify(users));
  localStorage.setItem('dn_user',  JSON.stringify(updated));
  state.user = updated;
  showToast('Profile updated ✓');
  goScreen('profile');
}

function populateEditForm() {
  if (!state.user) return;
  document.getElementById('ep-name').value     = state.user.name  || '';
  document.getElementById('ep-phone').value    = state.user.phone || '';
  document.getElementById('ep-email').value    = state.user.email || '';
  document.getElementById('ep-password').value = '';
}

// ── Profile screen ────────────────────────────────────────────────────────────
function renderProfile() {
  const u = state.user;
  if (u) {
    document.getElementById('profileAvatar').textContent = u.name.charAt(0).toUpperCase();
    document.getElementById('profileName').textContent   = u.name;
    document.getElementById('profileEmail').textContent  = u.email;
    document.getElementById('profileEditRow').style.display = '';
    document.getElementById('signOutRow').style.display     = '';
    document.getElementById('signInRow').style.display      = 'none';
    document.getElementById('createAccRow').style.display   = 'none';
  } else {
    document.getElementById('profileAvatar').textContent = 'G';
    document.getElementById('profileName').textContent   = 'Guest';
    document.getElementById('profileEmail').textContent  = 'Not signed in';
    document.getElementById('profileEditRow').style.display = 'none';
    document.getElementById('signOutRow').style.display     = 'none';
    document.getElementById('signInRow').style.display      = '';
    document.getElementById('createAccRow').style.display   = '';
  }
}

// ── Home ─────────────────────────────────────────────────────────────────────
function renderHome() {
  const hour   = new Date().getHours();
  const period = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  document.getElementById('homeGreetSub').textContent = period;
  if (state.user) {
    document.getElementById('homeGreetH1').innerHTML =
      `Hi, <span>${state.user.name.split(' ')[0]}</span> 👋`;
  } else {
    document.getElementById('homeGreetH1').innerHTML =
      `Find your <span>perfect</span> table`;
  }
  renderRecommended();
  renderNearby();
}

function renderRecommended() {
  const row = document.getElementById('recommendedRow');
  if (!row) return;
  row.innerHTML = [1,2,3].map(i => {
    const r     = RESTAURANTS[i];
    const saved = state.favourites.includes(r.id);
    return `<div class="rest-card" onclick="openRestaurant(${r.id})">
      <div class="card-img-wrap">
        <img src="${r.img}" alt="${r.name}" loading="lazy">
        <button class="card-save-btn${saved ? ' saved' : ''}"
          onclick="event.stopPropagation();toggleFav(${r.id})" title="Save restaurant">&#9829;</button>
      </div>
      <div class="info">
        <h3>${r.name}</h3>
        <div class="sub">${r.cuisine}</div>
        <div class="stars">${'★'.repeat(Math.round(+r.rating))} ${r.rating}</div>
      </div>
    </div>`;
  }).join('');
}

function renderNearby() {
  const list = document.getElementById('nearbyList');
  if (!list) return;
  list.innerHTML = [4,3,2].map(i => {
    const r     = RESTAURANTS[i];
    const saved = state.favourites.includes(r.id);
    return `<div class="list-card" onclick="openRestaurant(${r.id})">
      <img src="${r.img}" alt="${r.name}" loading="lazy">
      <div class="info">
        <h3>${r.name}</h3>
        <div class="sub">${r.cuisine} · ${r.dist}</div>
        <div class="row-meta">
          <span class="stars">★ ${r.rating}</span>
          <span class="price">${r.price}</span>
          <span class="badge-open">Open</span>
        </div>
      </div>
      <button class="list-save-btn${saved ? ' saved' : ''}"
        onclick="event.stopPropagation();toggleFav(${r.id})" title="Save restaurant">&#9829;</button>
    </div>`;
  }).join('');
}

function filterCuisine(el) {
  document.querySelectorAll('#cuisineFilters .pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
}

// ── Search ────────────────────────────────────────────────────────────────────
function filterSearch(q) { renderSearchResults(q, state.searchFilter); }

function filterSearchCuisine(el, cuisine) {
  document.querySelectorAll('#searchFilters .pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  state.searchFilter = cuisine;
  renderSearchResults(document.getElementById('searchInput')?.value || '', cuisine);
}

function renderSearchResults(q = '', cuisine = 'All') {
  const container = document.getElementById('searchResults');
  if (!container) return;
  const query   = q.toLowerCase();
  const results = RESTAURANTS.filter(r => {
    const mc = cuisine === 'All' || r.cuisine === cuisine;
    const mq = !query || r.name.toLowerCase().includes(query) || r.cuisine.toLowerCase().includes(query);
    return mc && mq;
  });
  if (!results.length) {
    container.innerHTML = `<div class="empty-state"><div class="icon">🍽</div><h2>No results</h2><p>Try a different search or filter.</p></div>`;
    return;
  }
  container.innerHTML = results.map(r => {
    const saved = state.favourites.includes(r.id);
    return `<div class="list-card" onclick="openRestaurant(${r.id})">
      <img src="${r.img}" alt="${r.name}" loading="lazy">
      <div class="info">
        <h3>${r.name}</h3>
        <div class="sub">${r.cuisine} · ${r.dist}</div>
        <div class="row-meta">
          <span class="stars">★ ${r.rating}</span>
          <span class="price">${r.price}</span>
          <span class="badge-open">Open</span>
        </div>
      </div>
      <button class="list-save-btn${saved ? ' saved' : ''}"
        onclick="event.stopPropagation();toggleFav(${r.id})" title="Save restaurant">&#9829;</button>
    </div>`;
  }).join('');
}

// ── Restaurant Detail ─────────────────────────────────────────────────────────
function openRestaurant(id) {
  const r = RESTAURANTS[id];
  state.selectedRestaurant = r;
  document.getElementById('detailImg').src             = r.img;
  document.getElementById('detailCuisine').textContent = r.cuisine;
  document.getElementById('detailName').textContent    = r.name;
  document.getElementById('detailDesc').textContent    = r.desc;
  document.getElementById('detailRating').textContent  = '★ ' + r.rating;
  document.getElementById('detailDist').textContent    = r.dist;
  document.getElementById('detailPrice').textContent   = r.price;
  document.getElementById('detailTime').textContent    = r.time;
  document.getElementById('detailAddress').textContent = r.address;
  document.getElementById('detailPhone').textContent   = r.phone;

  document.getElementById('menuItems').innerHTML = r.menu.map(cat =>
    `<div class="section-label" style="margin-top:16px">${cat.cat}</div>` +
    cat.items.map(item =>
      `<div class="menu-item">
        <div><div class="name">${item.name}</div><div class="desc">${item.desc}</div></div>
        <div class="price">${item.price}</div>
      </div>`
    ).join('')
  ).join('');

  document.getElementById('reviewsList').innerHTML = r.reviews.map(rev =>
    `<div style="padding:14px 0;border-bottom:1px solid var(--border)">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px">
        <span style="font-weight:600;font-size:14px">${rev.name}</span>
        <span style="color:var(--gold);font-size:13px">${'★'.repeat(rev.stars)}</span>
      </div>
      <p style="font-size:13px">${rev.text}</p>
    </div>`
  ).join('');

  updateFavBtn();
  document.querySelectorAll('.menu-tab').forEach(t => t.classList.remove('active'));
  document.querySelector('.menu-tab').classList.add('active');
  document.getElementById('tab-menu').style.display    = '';
  document.getElementById('tab-info').style.display    = 'none';
  document.getElementById('tab-reviews').style.display = 'none';
  goScreen('detail');
}

function switchTab(el, tab) {
  document.querySelectorAll('.menu-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('tab-menu').style.display    = tab === 'menu'    ? '' : 'none';
  document.getElementById('tab-info').style.display    = tab === 'info'    ? '' : 'none';
  document.getElementById('tab-reviews').style.display = tab === 'reviews' ? '' : 'none';
}

// ── Favourites ────────────────────────────────────────────────────────────────
function toggleFav(id) {
  const rId = (id !== undefined) ? id : state.selectedRestaurant?.id;
  if (rId === undefined || rId === null) return;

  if (!state.user) {
    state.pendingSaveId = rId;
    document.getElementById('auth-prompt-modal').classList.add('open');
    return;
  }

  const idx = state.favourites.indexOf(rId);
  if (idx === -1) { state.favourites.push(rId);    showToast('Saved to favourites ❤️'); }
  else            { state.favourites.splice(idx,1); showToast('Removed from saved'); }

  persistFavourites();
  updateFavBtn();
  refreshCards();
}

function persistFavourites() {
  if (!state.user) return;
  state.user.savedRestaurants = [...state.favourites];
  localStorage.setItem('dn_user', JSON.stringify(state.user));
  const users = JSON.parse(localStorage.getItem('dn_users') || '[]');
  const idx   = users.findIndex(u => u.email.toLowerCase() === state.user.email.toLowerCase());
  if (idx !== -1) {
    users[idx].savedRestaurants = [...state.favourites];
    localStorage.setItem('dn_users', JSON.stringify(users));
  }
}

function updateFavBtn() {
  const btn = document.getElementById('favBtn');
  if (!btn || !state.selectedRestaurant) return;
  const isFav     = state.favourites.includes(state.selectedRestaurant.id);
  btn.textContent = isFav ? '♥' : '♡';
  btn.style.color = isFav ? '#e05555' : 'white';
}

function refreshCards() {
  if (state.currentScreen === 'home') { renderRecommended(); renderNearby(); }
  if (state.currentScreen === 'search') renderSearchResults(document.getElementById('searchInput')?.value || '', state.searchFilter);
  if (state.currentScreen === 'saved') renderSaved();
}

// ── Auth prompt (save without account) ───────────────────────────────────────
function closeAuthPrompt() {
  document.getElementById('auth-prompt-modal').classList.remove('open');
}
function authPromptAction(screen) {
  closeAuthPrompt();
  goScreen(screen);
}

// ── Saved restaurants screen ──────────────────────────────────────────────────
function renderSaved() {
  const el = document.getElementById('savedList');
  if (!el) return;

  if (!state.user) {
    el.innerHTML = `<div class="empty-state">
      <div class="icon">❤️</div>
      <h2>Sign in to view saved restaurants</h2>
      <p>Create a free account to save your favourite restaurants and access them any time.</p>
      <button class="btn-primary" style="max-width:200px;margin:0 auto" onclick="goScreen('signin')">Sign In</button>
    </div>`;
    return;
  }

  const saved = RESTAURANTS.filter(r => state.favourites.includes(r.id));
  if (!saved.length) {
    el.innerHTML = `<div class="empty-state">
      <div class="icon">❤️</div>
      <h2>No saved restaurants yet</h2>
      <p>Tap ♥ on any restaurant to save it here.</p>
      <button class="btn-primary" style="max-width:200px;margin:0 auto" onclick="goScreen('home')">Explore restaurants</button>
    </div>`;
    return;
  }

  el.innerHTML =
    '<div style="padding:20px 20px 8px"><div class="section-label">Saved Restaurants</div></div>' +
    saved.map(r => `
      <div class="list-card" onclick="openRestaurant(${r.id})">
        <img src="${r.img}" alt="${r.name}" loading="lazy">
        <div class="info">
          <h3>${r.name}</h3>
          <div class="sub">${r.cuisine} · ${r.dist}</div>
          <div class="row-meta">
            <span class="stars">★ ${r.rating}</span>
            <span class="price">${r.price}</span>
            <span class="badge-open">Open</span>
          </div>
        </div>
        <button class="list-save-btn saved"
          onclick="event.stopPropagation();toggleFav(${r.id})" title="Remove from saved">&#9829;</button>
      </div>`
    ).join('') + '<div style="height:20px"></div>';
}

// ── Booking Flow ──────────────────────────────────────────────────────────────
function startBooking() {
  if (!state.selectedRestaurant) return;
  state.selectedDate    = null;
  state.selectedTime    = null;
  state.selectedSeating = null;
  state.guestCount      = 2;
  document.getElementById('bookingRestName').textContent = state.selectedRestaurant.name;
  document.getElementById('guestCount').textContent      = '2';
  buildDateGrid();
  buildTimeGrid();
  document.getElementById('btnDateTime').disabled = true;
  document.getElementById('btnSeating').disabled  = true;
  document.querySelectorAll('.seating-option').forEach(el => el.classList.remove('active'));
  goScreen('book-datetime');
}

function buildDateGrid() {
  const days  = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  const today = new Date();
  let html = '';
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const iso = d.toISOString().split('T')[0];
    html += `<div class="date-cell" onclick="selectDate(this,'${iso}')">
      <div class="day">${days[d.getDay()]}</div>
      <div class="num">${d.getDate()}</div>
    </div>`;
  }
  document.getElementById('dateGrid').innerHTML = html;
}

function buildTimeGrid() {
  document.getElementById('timeGrid').innerHTML = TIMES.map(t =>
    `<div class="time-btn ${t.avail ? '' : 'unavailable'}"
      ${t.avail ? `onclick="selectTime(this,'${t.t}')"` : ''}>
      ${t.t}
    </div>`
  ).join('');
}

function selectDate(el, date) {
  document.querySelectorAll('.date-cell').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  state.selectedDate = date;
  checkDateTimeReady();
}

function selectTime(el, time) {
  document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  state.selectedTime = time;
  checkDateTimeReady();
}

function checkDateTimeReady() {
  document.getElementById('btnDateTime').disabled = !(state.selectedDate && state.selectedTime);
}

function selectSeat(type) {
  document.querySelectorAll('.seating-option').forEach(el => el.classList.remove('active'));
  document.getElementById('seat-' + type)?.classList.add('active');
  state.selectedSeating = type;
  document.getElementById('btnSeating').disabled = false;
}

function changeGuests(delta) {
  state.guestCount = Math.max(1, Math.min(20, state.guestCount + delta));
  document.getElementById('guestCount').textContent = state.guestCount;
  document.getElementById('guestLabel').textContent = state.guestCount === 1 ? 'guest' : 'guests';
  document.getElementById('btnMinus').disabled = state.guestCount <= 1;
  document.getElementById('groupNote').style.display = state.guestCount >= 7 ? 'block' : 'none';
}

const SEATING_LABELS = { terrace:'Terrace', main:'Main Hall', vip:'VIP Room' };

function populateSummary() {
  const r = state.selectedRestaurant;
  if (!r) return;
  document.getElementById('sumRestName').textContent = r.name;
  const dateObj = new Date(state.selectedDate + 'T12:00:00');
  const dateStr = dateObj.toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'long' });
  document.getElementById('sumDateTime').textContent = `${dateStr}, ${state.selectedTime}`;
  document.getElementById('sumSeating').textContent  = SEATING_LABELS[state.selectedSeating] || '';
  document.getElementById('sumGuests').textContent   = `${state.guestCount} guest${state.guestCount > 1 ? 's' : ''}`;

  const u = state.user;
  if (u) {
    document.getElementById('fieldName').value  = u.name  || '';
    document.getElementById('fieldPhone').value = u.phone || '';
    document.getElementById('fieldEmail').value = u.email || '';
    document.getElementById('autofillBadge').style.display = '';
  } else {
    document.getElementById('fieldName').value  = '';
    document.getElementById('fieldPhone').value = '';
    document.getElementById('fieldEmail').value = '';
    document.getElementById('autofillBadge').style.display = 'none';
  }
  document.getElementById('fieldRequests').value = '';
  validateForm();
}

function validateForm() {
  const name  = document.getElementById('fieldName').value.trim();
  const phone = document.getElementById('fieldPhone').value.trim();
  document.getElementById('btnConfirm').disabled = !(name && phone);
}

function confirmBooking() {
  const r        = state.selectedRestaurant;
  const name     = document.getElementById('fieldName').value.trim();
  const phone    = document.getElementById('fieldPhone').value.trim();
  const requests = document.getElementById('fieldRequests').value.trim();
  const dateObj  = new Date(state.selectedDate + 'T12:00:00');
  const dateStr  = dateObj.toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'long' });
  const ref      = 'DN' + Math.random().toString(36).substr(2,6).toUpperCase();

  const booking = {
    ref, restaurant:r.name, img:r.img, date:dateStr,
    time:state.selectedTime, seating:SEATING_LABELS[state.selectedSeating],
    guests:state.guestCount, name, phone, requests, ts:Date.now(),
  };
  state.reservations.unshift(booking);
  localStorage.setItem('dn_reservations', JSON.stringify(state.reservations));

  state.lastBookingName  = name;
  state.lastBookingPhone = phone;
  state.lastBookingEmail = document.getElementById('fieldEmail').value.trim();

  document.getElementById('confRestName').textContent = r.name;
  document.getElementById('confDate').textContent     = dateStr;
  document.getElementById('confTime').textContent     = state.selectedTime;
  document.getElementById('confSeating').textContent  = SEATING_LABELS[state.selectedSeating];
  document.getElementById('confGuests').textContent   = `${state.guestCount} guest${state.guestCount > 1 ? 's' : ''}`;
  document.getElementById('confName').textContent     = name;
  document.getElementById('confRef').textContent      = ref;
  goScreen('confirmed');

  if (!state.user && localStorage.getItem('dn_noask') !== 'true') {
    setTimeout(showSaveModal, 700);
  }
}

// ── Reservations ──────────────────────────────────────────────────────────────
function renderReservations() {
  const el = document.getElementById('reservationsList');
  if (!el) return;
  if (!state.reservations.length) {
    el.innerHTML = `
      <div class="empty-state">
        <div class="icon">📋</div>
        <h2>No bookings yet</h2>
        <p>Your reservations will appear here once you've booked a table.</p>
        <button class="btn-primary" style="max-width:200px" onclick="goScreen('home')">Explore restaurants</button>
      </div>`;
    return;
  }
  el.innerHTML =
    `<div style="padding:20px 20px 8px"><div class="section-label">My Reservations</div></div>` +
    state.reservations.map(b => `
      <div class="list-card" style="cursor:default;margin-bottom:14px">
        <img src="${b.img}" alt="${b.restaurant}">
        <div class="info">
          <h3>${b.restaurant}</h3>
          <div class="sub">${b.date} · ${b.time}</div>
          <div class="sub">${b.seating} · ${b.guests} guest${b.guests > 1 ? 's' : ''}</div>
          <div style="margin-top:6px;font-size:11px;color:var(--gold);letter-spacing:1px">Ref: ${b.ref}</div>
        </div>
      </div>`
    ).join('') + '<div style="height:20px"></div>';
}

// ── Save-credentials modal ────────────────────────────────────────────────────
function showSaveModal() {
  document.getElementById('save-modal').classList.add('open');
}
function hideSaveModal() {
  document.getElementById('save-modal').classList.remove('open');
}
function savePromptYes() {
  hideSaveModal();
  document.getElementById('su-name').value  = state.lastBookingName  || '';
  document.getElementById('su-phone').value = state.lastBookingPhone || '';
  document.getElementById('su-email').value = state.lastBookingEmail || '';
  document.getElementById('su-password').value = '';
  ['err-su-name','err-su-phone','err-su-email','err-su-password'].forEach(clearErr);
  goScreen('signup');
}
function savePromptLater() { hideSaveModal(); }
function savePromptNo() {
  localStorage.setItem('dn_noask', 'true');
  hideSaveModal();
}

// ── Utilities ─────────────────────────────────────────────────────────────────
function togglePw(id, btn) {
  const inp  = document.getElementById(id);
  inp.type   = inp.type === 'password' ? 'text' : 'password';
  btn.textContent = inp.type === 'password' ? '👁' : '🙈';
}

function showErr(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.textContent = msg; el.classList.add('show'); }
}

function clearErr(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('show');
}

let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
}
