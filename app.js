
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
  currentScreen : 'home',
  prevScreen    : null,
  selectedRestaurant : null,
  selectedDate  : null,
  selectedTime  : null,
  selectedSeating: null,
  guestCount    : 2,
  favourites    : JSON.parse(localStorage.getItem('dn_favs')  || '[]'),
  favourites    : [],
  pendingSaveRestaurantId: null,
  reservations  : JSON.parse(localStorage.getItem('dn_reservations') || '[]'),
  searchFilter  : 'All',
  user          : JSON.parse(localStorage.getItem('dn_user')  || 'null'),
};

// ── Boot ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  state.user = normaliseSessionUser(state.user);
  syncSavedRestaurantsFromUser();
  renderSearchResults();
  renderHome();
  goScreen('home');   // always start on home — auth happens post-booking
});

// ── Navigation ────────────────────────────────────────────────────────────────
function goScreen(id) {
  document.getElementById('screen-' + state.currentScreen)?.classList.remove('active');
  document.getElementById('screen-' + id)?.classList.add('active');
  state.prevScreen    = state.currentScreen;
  state.currentScreen = id;

  // bottom nav highlight
  document.querySelectorAll('.bottomnav button').forEach(b => b.classList.remove('active'));
  const navBtn = document.getElementById('nav-' + id);
  if (navBtn) navBtn.classList.add('active');

  // hide nav for auth + booking screens (on desktop it stays as sidebar)
  const hideNav = [...AUTH_SCREENS, ...BOOKING_SCREENS, 'edit-profile'].includes(id);
  if (window.innerWidth < 1200) {
    document.getElementById('bottomnav').style.display = hideNav ? 'none' : 'flex';
  }

  // per-screen init
  if (id === 'home')         renderHome();
  if (id === 'reservations') renderReservations();
  if (id === 'saved')        renderSavedRestaurants();
  if (id === 'profile')      renderProfile();
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

// ── Tiny local backend for users + saved restaurants ─────────────────────────
// These helpers keep account data and saved restaurants in localStorage now, and
// preserve a separate admin-friendly collection for a future admin dashboard/API.
function getUsers() {
  return JSON.parse(localStorage.getItem('dn_users') || '[]').map(normaliseUser);
}

function saveUsers(users) {
  localStorage.setItem('dn_users', JSON.stringify(users.map(normaliseUser)));
}

function normaliseUser(user) {
  if (!user) return null;
  const savedRestaurants = Array.isArray(user.savedRestaurants)
    ? user.savedRestaurants
    : JSON.parse(localStorage.getItem('dn_favs') || '[]');
  return {
    ...user,
    savedRestaurants,
  };
}
