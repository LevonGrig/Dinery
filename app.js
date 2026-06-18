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

// ── Restaurant data model: halls & tables (Firestore-backed) ──────────────────
// Each restaurant owns its own halls, and each hall owns its own tables.
// These DEFAULT_HALLS are only used to SEED the 5 existing restaurants into
// Firestore the first time; afterwards every restaurant's halls/tables live in
// its /restaurants/{id} document and are edited from the admin panel.
function mkTables(prefix, sizes) {
  return sizes.map((seats, i) => ({ id: `${prefix}${i + 1}`, label: `${prefix}${i + 1}`, seats }));
}
const DEFAULT_HALLS = [
  { id: 'terrace', label: 'Terrace',   tables: mkTables('T', [2, 2, 2, 4, 4, 4, 6, 6]) }, // ~30 seats
  { id: 'main',    label: 'Main Hall', tables: mkTables('M', [2, 2, 4, 4, 4, 4, 6, 6, 8]) }, // ~40 seats
  { id: 'vip',     label: 'VIP Room',  tables: mkTables('V', [4, 4, 4]) },                   // 12 seats
];

// One-time migration: copies the hardcoded RESTAURANTS (plus starter halls/
// tables) into Firestore. Run ONCE from the browser console as an admin:
//   await seedDinery()
// Safe to re-run — it overwrites the /restaurants docs with the same data.
async function seedDinery() {
  if (!window.db) { console.error('Firestore not ready'); return; }
  if (!state.user) { console.error('Sign in (as an admin) before seeding'); return; }
  for (const r of RESTAURANTS) {
    const halls = DEFAULT_HALLS.map(h => ({
      id: h.id, label: h.label, tables: h.tables.map(t => ({ ...t })),
    }));
    try {
      await db.collection('restaurants').doc(String(r.id)).set({
        id: r.id, name: r.name, cuisine: r.cuisine, desc: r.desc,
        rating: r.rating, dist: r.dist, price: r.price, time: r.time,
        address: r.address, phone: r.phone, img: r.img,
        menu: r.menu, reviews: r.reviews,
        halls, active: true, order: r.id,
      });
      console.log('Seeded restaurant:', r.name);
    } catch (e) {
      console.error('Failed to seed', r.name, '-', e?.code || e?.message || e);
    }
  }
  console.log('✅ Seed complete — check Firestore → restaurants collection');
}
window.seedDinery = seedDinery;

// Give every restaurant its own halls/tables (defaults) until/unless the admin
// edits them in Firestore. maxTableWaste = how many empty seats a table may be
// left with when auto-assigned (1 = strict: a 4-top only goes to parties of 3-4).
RESTAURANTS.forEach(r => {
  if (!Array.isArray(r.halls) || !r.halls.length) {
    r.halls = DEFAULT_HALLS.map(h => ({ id: h.id, label: h.label, tables: h.tables.map(t => ({ ...t })) }));
  }
  if (r.maxTableWaste == null) r.maxTableWaste = 1;
});

function hallById(restaurant, hallId) {
  return (restaurant?.halls || []).find(h => h.id === hallId) || null;
}
function hallLabel(hallId) {
  return hallById(state.selectedRestaurant, hallId)?.label || SEATING_LABELS[hallId] || hallId;
}

// Best-fit auto-assignment: the smallest free table that seats the party while
// leaving at most `maxWaste` empty seats. Returns the chosen table or null.
function assignTable(hall, guests, bookedIds, maxWaste = 1) {
  const taken = bookedIds || new Set();
  return (hall?.tables || [])
    .filter(t => !taken.has(t.id) && t.seats >= guests && (t.seats - guests) <= maxWaste)
    .sort((a, b) => (a.seats - b.seats) || String(a.id).localeCompare(String(b.id)))[0] || null;
}

// Free the table (or legacy seat-count) held by a booking. Used by cancel,
// change-booking and account deletion.
async function releaseBookingSlot(b) {
  if (!b) return;
  if (b.assignedTable && window.tableStore) {
    await window.tableStore.release(b.restaurantId, b.hall, b.assignedTable.id, b.slotDate, b.slotTime);
  } else if (window.hallStore && b.hallKey) {
    await window.hallStore.release(b.hallKey, b.seats || b.guests || 1);
  }
}

// ── State ────────────────────────────────────────────────────────────────────
const AUTH_SCREENS    = ['signup','signin'];
const BOOKING_SCREENS = ['book-datetime','book-seating','book-guests','book-details','confirmed'];

let state = {
  currentScreen      : 'home',
  prevScreen         : null,
  history            : [],          // navigation stack for the back button
  selectedRestaurant : null,
  selectedDate       : null,
  selectedTime       : null,
  selectedSeating    : null,
  guestCount         : 2,
  favourites         : [],
  reservations       : [],
  searchFilter       : 'All',
  user               : null,   // { uid?, name, phone, email }
  isAdmin            : false,  // true if the signed-in user's doc has admin == true
  pendingSaveId      : null,
  changingBookingRef : null,   // ref of booking being changed (replaced on confirm)
  maxGuests          : 20,     // cap based on the selected hall's remaining seats
  selectedHallRemaining : null,// remaining seats in the selected hall (null = unknown)
};

// ── Hall capacity (concurrency-aware booking) ─────────────────────────────────
// Default seats + base occupancy per hall for a given date+time slot. An admin
// panel will later edit the /halls documents directly; these are just the seed
// values so the feature works before the panel exists.
const HALL_CAPACITY = {
  terrace: { capacity: 30, occupied: 9  },  // ~30% occupied
  main:    { capacity: 40, occupied: 26 },  // ~65% occupied
  vip:     { capacity: 12, occupied: 10 },  // ~85% occupied — only 2 seats left
};

function hallKey(restaurantId, hall, date, time) {
  return `${restaurantId}__${hall}__${date}__${time}`.replace(/:/g, '');
}
function hallMeta(restaurantId, hall, date, time) {
  const base = HALL_CAPACITY[hall] || { capacity: 30, occupied: 0 };
  return { restaurantId, hall, date, time, capacity: base.capacity, occupied: base.occupied };
}

// ── Boot ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderSearchResults();
  renderHome();
  goScreen('home');

  // Pull admin-edited settings (e.g. maxTableWaste) over the built-in defaults.
  loadRestaurantOverrides();

  // Capture any deep-link from an email (e.g. ?r=DN123&a=cancel) before auth runs.
  parseDeepLink();

  auth.onAuthStateChanged(async (firebaseUser) => {
    if (firebaseUser) {
      // Set minimal user immediately so UI unblocks (saves, etc.)
      state.user = { uid: firebaseUser.uid, name: '', phone: '', email: firebaseUser.email };
      await loadUserData(firebaseUser.uid, firebaseUser.email);
      renderHome();
      renderProfile();
      refreshCards();
      if (state.currentScreen === 'reservations') renderReservations();
    } else if (state.user) {
      state.user         = null;
      state.favourites   = [];
      state.reservations = [];
      state.isAdmin      = false;
      renderHome();
      renderProfile();
      refreshCards();
    }
    // Act on an email deep-link once we know the auth/reservation state.
    if (state.pendingDeepLink) resolvePendingDeepLink();
  });
});

// ── Email deep-links ──────────────────────────────────────────────────────────
// Links in confirmation emails point at e.g. https://dinery.am/?r=DN123&a=cancel
// so a tap opens the app straight into that booking's manage/cancel/modify flow.
function parseDeepLink() {
  try {
    const p      = new URLSearchParams(location.search);
    const ref    = p.get('r');
    const action = p.get('a');
    if (ref && ['view', 'modify', 'cancel'].includes(action)) {
      state.pendingDeepLink = { ref, action };
    }
  } catch (e) { /* ignore malformed URLs */ }
}

function clearDeepLinkUrl() {
  try { history.replaceState({}, '', location.pathname); } catch (e) {}
}

function resolvePendingDeepLink() {
  const dl = state.pendingDeepLink;
  if (!dl) return;
  const booking = state.reservations.find(b => b.ref === dl.ref);

  if (booking) {
    state.pendingDeepLink = null;
    clearDeepLinkUrl();
    if (dl.action === 'cancel')      { goScreen('reservations'); cancelReservation(dl.ref); }
    else if (dl.action === 'modify') { changeBooking(dl.ref); }
    else                             { openReservation(dl.ref); }
    return;
  }

  // Reservation not loaded yet. If nobody's signed in, their bookings live in
  // their account — ask them to sign in, then we'll retry after auth loads.
  if (!state.user) {
    showToast('Please sign in to manage your reservation.');
    goScreen('signin');
  } else {
    // Signed in, but this code isn't on their account.
    state.pendingDeepLink = null;
    clearDeepLinkUrl();
    showToast("We couldn't find that reservation on your account.");
    goScreen('reservations');
  }
}

// Load the user's profile, favourites and reservations from Firestore.
// Creates the document on first sign-in if it doesn't exist yet.
async function loadUserData(uid, email) {
  try {
    const doc = await db.collection('users').doc(uid).get();
    if (doc.exists) {
      const d = doc.data();
      state.user         = { uid, name: d.name || '', phone: d.phone || '', email };
      state.favourites   = d.savedRestaurants || [];
      state.reservations = d.reservations || [];
      state.isAdmin      = d.admin === true;
    } else {
      await db.collection('users').doc(uid).set({
        name: '', phone: '', email, savedRestaurants: [], reservations: []
      });
      state.favourites   = [];
      state.reservations = [];
    }
  } catch(e) {
    console.error('Failed to load profile from Firestore:', e);
    showToast('Could not load your data — check your connection');
  }
}

// ── Navigation ────────────────────────────────────────────────────────────────
// Top-level tabs — reaching one starts a fresh history (no "back" expected).
const ROOT_SCREENS = ['home','search','reservations','profile'];

function goScreen(id) { navigate(id, false); }

// goBack pops the real navigation history so you return to wherever you
// actually came from (e.g. mid-booking → back → the restaurant list),
// instead of bouncing between the last two screens. fallback is only used
// when there's no history (e.g. deep-linked entry).
function goBack(fallback) {
  const target = state.history.length ? state.history.pop() : fallback;
  navigate(target, true);
}

function navigate(id, isBack) {
  document.getElementById('screen-' + state.currentScreen)?.classList.remove('active');
  document.getElementById('screen-' + id)?.classList.add('active');

  if (!isBack) {
    if (ROOT_SCREENS.includes(id)) {
      state.history = [];                       // fresh root context
    } else if (state.currentScreen && state.currentScreen !== id) {
      state.history.push(state.currentScreen);  // remember where we came from
    }
  }

  state.prevScreen    = state.currentScreen;
  state.currentScreen = id;

  document.querySelectorAll('.bottomnav button').forEach(b => b.classList.remove('active'));
  const navBtn = document.getElementById('nav-' + (id === 'saved' ? 'profile' : id));
  if (navBtn) navBtn.classList.add('active');

  const hideNav = [...AUTH_SCREENS, ...BOOKING_SCREENS, 'edit-profile'].includes(id);
  if (window.innerWidth < 1200) {
    document.getElementById('bottomnav').style.display = hideNav ? 'none' : 'flex';
  }

  if (id === 'home')         renderHome();
  if (id === 'reservations') { state.changingBookingRef = null; renderReservations(); }
  if (id === 'profile')      renderProfile();
  if (id === 'saved')        renderSaved();
  if (id === 'book-guests')   initGuests();
  if (id === 'book-seating')  renderSeating();
  if (id === 'book-details')  populateSummary();
  if (id === 'admin')        renderAdmin();
  if (id === 'edit-profile') populateEditForm();
}

function goSearch() {
  goScreen('search');
  setTimeout(() => document.getElementById('searchInput')?.focus(), 300);
}

// ── Auth ─────────────────────────────────────────────────────────────────────
async function doSignUp() {
  const name     = document.getElementById('su-name').value.trim();
  const phone    = document.getElementById('su-phone').value.trim();
  const email    = document.getElementById('su-email').value.trim();
  const password = document.getElementById('su-password').value;

  let ok = true;
  if (!name)                          { showErr('err-su-name',     'Please enter your name');                  ok = false; }
  if (!phone)                         { showErr('err-su-phone',    'Please enter your phone number');          ok = false; }
  if (!email || !email.includes('@')) { showErr('err-su-email',    'Please enter a valid email');              ok = false; }
  if (password.length < 6)            { showErr('err-su-password', 'Password must be at least 6 characters'); ok = false; }
  if (!ok) return;

  let cred;
  try {
    cred = await auth.createUserWithEmailAndPassword(email, password);
  } catch(err) {
    if (err.code === 'auth/email-already-in-use') {
      showErr('err-su-email', 'An account with this email already exists — please sign in instead.');
    } else if (err.code === 'auth/weak-password') {
      showErr('err-su-password', 'Password must be at least 6 characters');
    } else {
      showErr('err-su-email', err.message || 'Sign up failed. Please try again.');
    }
    return;
  }

  const uid = cred.user.uid;
  state.user         = { uid, name, phone, email };
  state.favourites   = [];
  state.reservations = [];

  if (state.pendingSaveId !== null) {
    state.favourites.push(state.pendingSaveId);
    state.pendingSaveId = null;
  }

  try {
    await db.collection('users').doc(uid).set({
      name, phone, email,
      savedRestaurants: [...state.favourites],
      reservations: []
    });
  } catch(err) {
    console.error('Failed to create profile in Firestore:', err);
    showToast('Account created, but saving your profile failed — check your connection');
  }

  showToast('Account created! Welcome, ' + name.split(' ')[0] + ' 👋');
  goScreen(state.prevScreen === 'confirmed' ? 'confirmed' : 'home');
}

async function doSignIn() {
  const email    = document.getElementById('si-email').value.trim();
  const password = document.getElementById('si-password').value;

  // Only auth errors mean "wrong email/password" — Firestore problems must not
  // show that message (that was the bug causing false "incorrect password")
  let cred;
  try {
    cred = await auth.signInWithEmailAndPassword(email, password);
  } catch(err) {
    showErr('err-si', 'Email or password is incorrect');
    return;
  }

  const uid = cred.user.uid;
  state.user = { uid, name: '', phone: '', email };
  await loadUserData(uid, email);

  if (state.pendingSaveId !== null) {
    if (!state.favourites.includes(state.pendingSaveId)) {
      state.favourites.push(state.pendingSaveId);
      persistFavourites();
    }
    state.pendingSaveId = null;
  }

  showToast('Welcome back, ' + (state.user.name || email).split(' ')[0] + ' 👋');
  goScreen(state.prevScreen === 'profile' ? 'profile' : 'home');
}

async function doSignOut() {
  if (!confirm('Sign out of Dinery?')) return;
  await auth.signOut();
  state.user         = null;
  state.favourites   = [];
  state.reservations = [];
  state.isAdmin      = false;
  goScreen('home');
  showToast('Signed out');
}

async function saveProfile() {
  const name     = document.getElementById('ep-name').value.trim();
  const phone    = document.getElementById('ep-phone').value.trim();
  const email    = document.getElementById('ep-email').value.trim();
  const password = document.getElementById('ep-password').value;

  if (!name || !phone || !email) { showToast('Please fill all required fields'); return; }

  if (!state.user?.uid) return;
  try {
    await db.collection('users').doc(state.user.uid).set({ name, phone }, { merge: true });
    if (password.length >= 6) {
      try {
        await auth.currentUser.updatePassword(password);
      } catch(e) {
        if (e.code === 'auth/requires-recent-login') {
          showToast('Sign out and sign back in to change your password.');
          return;
        }
      }
    }
    state.user = { ...state.user, name, phone };
    showToast('Profile updated ✓');
    goScreen('profile');
    renderProfile();
  } catch(err) {
    showToast(err.message || 'Update failed. Please try again.');
  }
}

function openDeleteModal() {
  const m = document.getElementById('delete-account-modal');
  m.style.display = 'flex';
}

function closeDeleteModal() {
  const m = document.getElementById('delete-account-modal');
  m.style.display = 'none';
}

async function confirmDeleteAccount() {
  if (!state.user?.uid) return;
  closeDeleteModal();
  try {
    // Free every held table so the space becomes available to others — same
    // release path the Cancel button uses, run for all of this account's
    // reservations before the account is removed.
    for (const b of state.reservations) {
      await releaseBookingSlot(b);
    }

    await db.collection('users').doc(state.user.uid).delete();
    await auth.deleteCurrentUser();
    state.user         = null;
    state.favourites   = [];
    state.reservations = [];
    goScreen('home');
    showToast('Your account has been deleted.');
  } catch(e) {
    if (e.code === 'auth/requires-recent-login') {
      showToast('Please sign out and sign back in, then try again.');
    } else {
      showToast(e.message || 'Could not delete account. Please try again.');
    }
  }
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
  const adminRow = document.getElementById('adminRow');
  if (u) {
    document.getElementById('profileAvatar').textContent = (u.name || u.email || 'U').charAt(0).toUpperCase();
    document.getElementById('profileName').textContent   = u.name || u.email;
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
  if (adminRow) adminRow.style.display = state.isAdmin ? '' : 'none';
}

// ── Admin: per-restaurant settings ────────────────────────────────────────────
// Merge admin-edited /restaurants settings (currently maxTableWaste, and halls
// if seeded) over the built-in RESTAURANTS so they take effect for bookings.
async function loadRestaurantOverrides() {
  if (!window.restaurantStore) return;
  const docs = await window.restaurantStore.all();
  if (!docs) return;
  for (const d of docs) {
    const r = RESTAURANTS.find(x => String(x.id) === String(d.id));
    if (!r) continue;
    if (d.maxTableWaste != null) r.maxTableWaste = d.maxTableWaste;
    if (Array.isArray(d.halls) && d.halls.length) r.halls = d.halls;
  }
}

function renderAdmin() {
  const list = document.getElementById('adminList');
  if (!list) return;
  if (!state.isAdmin) {
    list.innerHTML = `<div class="empty-state"><div class="icon">🔒</div><h2>Admins only</h2></div>`;
    return;
  }
  list.innerHTML = RESTAURANTS.map(r => {
    const w = (r.maxTableWaste == null) ? 1 : r.maxTableWaste;
    return `
      <div class="admin-rest-card" id="admin-rest-${r.id}">
        <div class="admin-rest-head">
          <img src="${r.img}" alt="" class="admin-rest-img">
          <div>
            <div class="admin-rest-name">${r.name}</div>
            <div class="admin-rest-sub">${r.cuisine}</div>
          </div>
        </div>
        <div class="admin-setting">
          <div class="admin-setting-label">
            Max empty seats per table
            <span class="admin-hint">0 = exact fit only · higher = bigger tables for small groups</span>
          </div>
          <div class="admin-stepper">
            <button class="counter-btn" onclick="adminChangeWaste(${r.id}, -1)">−</button>
            <div class="counter-val" id="adminWaste-${r.id}">${w}</div>
            <button class="counter-btn" onclick="adminChangeWaste(${r.id}, 1)">+</button>
          </div>
        </div>
        <button class="btn-primary admin-save" id="adminSave-${r.id}" onclick="saveAdminWaste(${r.id})">Save</button>
      </div>`;
  }).join('');
}

function adminChangeWaste(id, delta) {
  const r = RESTAURANTS.find(x => x.id === id);
  if (!r) return;
  const cur = (r.maxTableWaste == null) ? 1 : r.maxTableWaste;
  r.maxTableWaste = Math.max(0, Math.min(6, cur + delta));
  const el = document.getElementById(`adminWaste-${id}`);
  if (el) el.textContent = r.maxTableWaste;
}

async function saveAdminWaste(id) {
  const r = RESTAURANTS.find(x => x.id === id);
  if (!r || !window.restaurantStore) return;
  const btn = document.getElementById(`adminSave-${id}`);
  if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }
  const res = await window.restaurantStore.update(id, { maxTableWaste: r.maxTableWaste });
  if (btn) { btn.disabled = false; btn.textContent = 'Save'; }
  showToast(res.ok
    ? `${r.name}: max waste set to ${r.maxTableWaste}`
    : `Save failed — ${res.error || 'check your connection / admin access'}`);
}

// ── Home ─────────────────────────────────────────────────────────────────────
function renderHome() {
  const hour   = new Date().getHours();
  const period = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  document.getElementById('homeGreetSub').textContent = period;
  if (state.user) {
    document.getElementById('homeGreetH1').innerHTML =
      `Hi, <span>${(state.user.name || state.user.email || '').split(' ')[0]}</span> 👋`;
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
  if (!state.user?.uid) return;
  db.collection('users').doc(state.user.uid).set(
    { savedRestaurants: [...state.favourites] }, { merge: true }
  ).catch(e => {
    console.error('persistFavourites failed:', e);
    showToast('Saving failed — check your connection');
  });
}

function updateFavBtn() {
  const btn = document.getElementById('favBtn');
  if (!btn || !state.selectedRestaurant) return;
  const isFav     = state.favourites.includes(state.selectedRestaurant.id);
  btn.textContent = isFav ? '♥' : '♡';
  btn.style.color = isFav ? '#e05555' : 'white';
}

function refreshCards() {
  if (state.currentScreen === 'home')   { renderRecommended(); renderNearby(); }
  if (state.currentScreen === 'search') renderSearchResults(document.getElementById('searchInput')?.value || '', state.searchFilter);
  if (state.currentScreen === 'saved')  renderSaved();
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
  state.maxGuests       = 20;
  state.selectedHallRemaining = null;
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

// Show each hall with its REAL availability for the chosen party size and slot:
// how many free tables actually fit the group under the no-waste rule. Halls
// that can't fit the party are dimmed and not selectable.
async function renderSeating() {
  const r        = state.selectedRestaurant;
  const guests   = state.guestCount;
  const maxWaste = (r?.maxTableWaste == null) ? 1 : r.maxTableWaste;

  state.selectedSeating = null;
  document.querySelectorAll('.seating-option').forEach(el => el.classList.remove('active'));
  const btn = document.getElementById('btnSeating');
  if (btn) btn.disabled = true;

  for (const hall of (r?.halls || [])) {
    const card = document.getElementById('seat-' + hall.id);
    if (!card) continue;

    const tables   = hall.tables || [];
    const tableIds = tables.map(t => t.id);

    let bookedIds = new Set();
    if (window.tableStore && tableIds.length) {
      const b = await window.tableStore.bookedSet(r.id, hall.id, state.selectedDate, state.selectedTime, tableIds);
      if (b) bookedIds = b;   // null => guard inactive, treat as none
    }

    const freeCount = tableIds.filter(id => !bookedIds.has(id)).length;
    const fitCount  = tables.filter(t =>
      !bookedIds.has(t.id) && t.seats >= guests && (t.seats - guests) <= maxWaste).length;
    const occPct    = tables.length ? Math.round(((tables.length - freeCount) / tables.length) * 100) : 0;
    const canFit    = fitCount > 0;

    const fill  = card.querySelector('.occupancy-fill');
    const label = card.querySelector('.occupancy-label');
    if (fill) {
      fill.style.width = occPct + '%';
      fill.className   = 'occupancy-fill ' + (occPct >= 80 ? 'fill-high' : occPct >= 50 ? 'fill-mid' : 'fill-low');
    }
    if (label) {
      label.textContent = canFit
        ? `${fitCount} table${fitCount === 1 ? '' : 's'} fit your group of ${guests} · ${occPct}% full`
        : (freeCount === 0
            ? 'Fully booked for this time'
            : `No free table fits ${guests} guest${guests === 1 ? '' : 's'} here`);
    }

    card.classList.toggle('disabled', !canFit);
    card.style.opacity       = canFit ? '' : '0.55';
    card.style.pointerEvents = canFit ? '' : 'none';
  }
}

function selectSeat(type) {
  const card = document.getElementById('seat-' + type);
  if (!card || card.classList.contains('disabled')) return;  // can't pick a hall that doesn't fit
  document.querySelectorAll('.seating-option').forEach(el => el.classList.remove('active'));
  card.classList.add('active');
  state.selectedSeating = type;
  const btn = document.getElementById('btnSeating');
  if (btn) btn.disabled = false;
}

// Prepare the guest counter, capping it to the selected hall's remaining seats.
function initGuests() {
  // Party size is capped by the restaurant's largest table across all halls
  // (the hall is chosen on the next screen).
  const r = state.selectedRestaurant;
  const allSeats = (r?.halls || []).flatMap(h => (h.tables || []).map(t => t.seats));
  const max = allSeats.length ? Math.max(...allSeats) : 20;
  state.maxGuests = max;
  if (state.guestCount > max) state.guestCount = Math.max(1, max);
  document.getElementById('guestCount').textContent = state.guestCount;
  document.getElementById('guestLabel').textContent = state.guestCount === 1 ? 'guest' : 'guests';
  document.getElementById('btnMinus').disabled = state.guestCount <= 1;
  const plus = document.getElementById('btnPlus');
  if (plus) plus.disabled = state.guestCount >= max;

  const note = document.getElementById('capacityNote');
  if (note) {
    if (max < 20) {
      note.textContent = `Our largest table seats ${max} — for bigger groups, please contact the restaurant directly.`;
      note.style.display = 'block';
    } else {
      note.style.display = 'none';
    }
  }
}

function changeGuests(delta) {
  const max = state.maxGuests || 20;
  state.guestCount = Math.max(1, Math.min(max, state.guestCount + delta));
  document.getElementById('guestCount').textContent = state.guestCount;
  document.getElementById('guestLabel').textContent = state.guestCount === 1 ? 'guest' : 'guests';
  document.getElementById('btnMinus').disabled = state.guestCount <= 1;
  const plus = document.getElementById('btnPlus');
  if (plus) plus.disabled = state.guestCount >= max;
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

async function confirmBooking() {
  const r        = state.selectedRestaurant;
  const name     = document.getElementById('fieldName').value.trim();
  const phone    = document.getElementById('fieldPhone').value.trim();
  const requests = document.getElementById('fieldRequests').value.trim();
  const dateObj  = new Date(state.selectedDate + 'T12:00:00');
  const dateStr  = dateObj.toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'long' });
  const ref      = 'DN' + Math.random().toString(36).substr(2,6).toUpperCase();

  const hall     = state.selectedSeating;
  const seats    = state.guestCount;
  const hallObj  = hallById(r, hall);
  const maxWaste = (r.maxTableWaste == null) ? 1 : r.maxTableWaste;

  // The booking being replaced (change-booking flow), if any
  const oldBooking = state.changingBookingRef
    ? state.reservations.find(b => b.ref === state.changingBookingRef)
    : null;

  // Auto-assign the best-fit table. If changing a booking, free its old table
  // first (so moving within the same hall doesn't falsely look full); restore
  // it if no new table can be assigned.
  const btn = document.getElementById('btnConfirm');
  if (btn) btn.disabled = true;

  if (oldBooking) await releaseBookingSlot(oldBooking);

  const tableIds = (hallObj?.tables || []).map(t => t.id);
  let bookedIds = new Set();
  if (window.tableStore && tableIds.length) {
    const b = await window.tableStore.bookedSet(r.id, hall, state.selectedDate, state.selectedTime, tableIds);
    if (b) bookedIds = b;   // null => guard inactive, treat as none (fail open)
  }

  // Pick a best-fit table and claim it atomically; if another guest grabs it
  // first, exclude it and try the next best fit.
  let assignedTable = null;
  for (let attempt = 0; attempt < 6; attempt++) {
    const pick = assignTable(hallObj, seats, bookedIds, maxWaste);
    if (!pick) break;
    if (!window.tableStore) { assignedTable = pick; break; }
    const claim = await window.tableStore.claim(
      r.id, hall, pick.id, state.selectedDate, state.selectedTime,
      { uid: state.user?.uid || null, restaurantId: r.id, hallId: hall,
        tableId: pick.id, date: state.selectedDate, time: state.selectedTime, guests: seats }
    );
    if (claim.ok) { assignedTable = pick; break; }
    bookedIds.add(pick.id);
  }

  if (!assignedTable) {
    // Nothing fit — restore the old booking's table (if we freed one) and bail
    if (oldBooking?.assignedTable && window.tableStore) {
      await window.tableStore.claim(
        oldBooking.restaurantId, oldBooking.hall, oldBooking.assignedTable.id,
        oldBooking.slotDate, oldBooking.slotTime,
        { uid: state.user?.uid || null, restaurantId: oldBooking.restaurantId, hallId: oldBooking.hall,
          tableId: oldBooking.assignedTable.id, date: oldBooking.slotDate, time: oldBooking.slotTime,
          guests: oldBooking.guests }
      );
    }
    showToast(`No free table fits ${seats} guest${seats === 1 ? '' : 's'} in ${hallLabel(hall)} at ${state.selectedTime}. Try another hall or time.`);
    if (btn) btn.disabled = false;
    goScreen('book-seating');
    return;
  }

  const seatingText = `${hallLabel(hall)} · Table ${assignedTable.label}`;
  const booking = {
    ref, restaurant:r.name, img:r.img, date:dateStr,
    time:state.selectedTime, seating:seatingText,
    guests:seats, name, phone, requests, ts:Date.now(),
    // booking bookkeeping — lets us release the table on cancel/change
    seats, hall, restaurantId: r.id, assignedTable,
    slotDate: state.selectedDate, slotTime: state.selectedTime,
  };
  // If changing an existing booking, remove the old one (its table was freed above)
  const wasModification = !!state.changingBookingRef;
  if (state.changingBookingRef) {
    state.reservations = state.reservations.filter(b => b.ref !== state.changingBookingRef);
    state.changingBookingRef = null;
  }
  state.reservations.unshift(booking);
  persistReservations();
  // Guests keep reservations in memory for this visit only — they're prompted
  // to create an account after booking so future bookings sync to the cloud

  state.lastBookingName  = name;
  state.lastBookingPhone = phone;
  state.lastBookingEmail = document.getElementById('fieldEmail').value.trim();

  // Email the right notice to whatever address was entered (works for guests
  // too), falling back to the signed-in user's email: a "reservation updated"
  // email after a modification, otherwise the booking-confirmation email.
  if (wasModification) {
    sendModifiedEmail(booking, state.lastBookingEmail);
  } else {
    sendConfirmationEmail(booking, state.lastBookingEmail);
  }

  document.getElementById('confRestName').textContent = r.name;
  document.getElementById('confDate').textContent     = dateStr;
  document.getElementById('confTime').textContent     = state.selectedTime;
  document.getElementById('confSeating').textContent  = seatingText;
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
      <div class="list-card reservation-card" onclick="openReservation('${b.ref}')">
        <img src="${b.img}" alt="${b.restaurant}">
        <div class="info">
          <h3>${b.restaurant}</h3>
          <div class="sub">${b.date} · ${b.time}</div>
          <div class="sub">${b.seating} · ${b.guests} guest${b.guests > 1 ? 's' : ''}</div>
          <div style="margin-top:6px;font-size:11px;color:var(--gold);letter-spacing:1px">Ref: ${b.ref}</div>
        </div>
        <span class="arrow" style="align-self:center;padding-right:14px;color:var(--gray)">›</span>
      </div>`
    ).join('') + '<div style="height:20px"></div>';
}

// Open the full reservation detail screen for a given booking reference.
function openReservation(ref) {
  const b = state.reservations.find(x => x.ref === ref);
  if (!b) return;
  document.getElementById('resDetailImg').src           = b.img;
  document.getElementById('resDetailName').textContent  = b.restaurant;
  document.getElementById('resDetailDate').textContent  = b.date;
  document.getElementById('resDetailTime').textContent  = b.time;
  document.getElementById('resDetailSeating').textContent = b.seating;
  document.getElementById('resDetailGuests').textContent  = `${b.guests} guest${b.guests > 1 ? 's' : ''}`;
  document.getElementById('resDetailGuestName').textContent = b.name || '—';
  document.getElementById('resDetailPhone').textContent     = b.phone || '—';
  document.getElementById('resDetailRef').textContent       = b.ref;

  const reqRow = document.getElementById('resDetailRequestsRow');
  if (b.requests) {
    document.getElementById('resDetailRequests').textContent = b.requests;
    reqRow.style.display = '';
  } else {
    reqRow.style.display = 'none';
  }

  document.getElementById('resCancelBtn').onclick = () => cancelReservation(ref);
  document.getElementById('resChangeBtn').onclick  = () => changeBooking(ref);
  goScreen('reservation-detail');
}

// Start a new booking for the same restaurant, then swap it for the old one on confirm.
function changeBooking(ref) {
  const b = state.reservations.find(x => x.ref === ref);
  if (!b) return;
  const restaurant = RESTAURANTS.find(r => r.name === b.restaurant);
  if (!restaurant) { showToast('Restaurant no longer available'); return; }

  state.changingBookingRef  = ref;
  state.selectedRestaurant  = restaurant;
  state.selectedDate        = null;
  state.selectedTime        = null;
  state.selectedSeating     = null;
  state.guestCount          = b.guests || 2;
  state.maxGuests           = 20;
  state.selectedHallRemaining = null;

  document.getElementById('bookingRestName').textContent = restaurant.name;
  document.getElementById('guestCount').textContent      = state.guestCount;
  buildDateGrid();
  buildTimeGrid();
  document.getElementById('btnDateTime').disabled = true;
  document.getElementById('btnSeating').disabled  = true;
  document.querySelectorAll('.seating-option').forEach(el => el.classList.remove('active'));
  goScreen('book-datetime');
}

// Cancel a booking by its reference, free its seats, persist, return to list.
async function cancelReservation(ref) {
  const booking = state.reservations.find(b => b.ref === ref);
  if (!booking) return;
  if (!confirm(`Cancel your reservation at ${booking.restaurant} on ${booking.date} at ${booking.time}?`)) return;

  // Release the held table so others can book it
  await releaseBookingSlot(booking);

  state.reservations = state.reservations.filter(b => b.ref !== ref);
  persistReservations();
  sendCancellationEmail(booking); // fire-and-forget; no-ops until the email Worker URL is set
  showToast('Reservation cancelled');
  goScreen('reservations');
}

// Save the current reservations array to the signed-in user's Firestore doc.
function persistReservations() {
  if (!state.user?.uid) return;
  db.collection('users').doc(state.user.uid).set(
    { reservations: state.reservations }, { merge: true }
  ).catch(e => {
    console.error('Reservation update failed:', e);
    showToast('Update failed — check your connection');
  });
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
