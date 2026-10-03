import './style.css';

const bands = ['5.0', '5.5', '6.0', '6.5', '7.0', '7.5', '8.0', '8.5', '9.0'];
const skills = ['Vocabulary', 'Reading', 'Listening', 'Speaking', 'Writing'];
const words = [
  { id: 'abundant', word: 'Abundant', meaning: 'প্রচুর / পর্যাপ্তের চেয়ে বেশি', synonyms: ['Plentiful', 'Ample', 'Copious'], antonyms: ['Scarce', 'Limited'], example: 'The region has abundant natural resources.', category: 'Academic', uk: '', us: '' },
  { id: 'alleviate', word: 'Alleviate', meaning: 'লাঘব করা / কমানো', synonyms: ['Ease', 'Relieve', 'Reduce'], antonyms: ['Worsen', 'Aggravate'], example: 'New policies may alleviate pressure on hospitals.', category: 'Academic', uk: '', us: '' },
  { id: 'coherent', word: 'Coherent', meaning: 'সুসংগত / স্পষ্ট', synonyms: ['Logical', 'Consistent', 'Clear'], antonyms: ['Confused', 'Incoherent'], example: 'A coherent argument is easier to follow.', category: 'Writing', uk: '', us: '' },
  { id: 'deteriorate', word: 'Deteriorate', meaning: 'অবনতি হওয়া', synonyms: ['Decline', 'Worsen', 'Degrade'], antonyms: ['Improve', 'Recover'], example: 'Air quality can deteriorate during winter.', category: 'Environment', uk: '', us: '' },
  { id: 'feasible', word: 'Feasible', meaning: 'সম্ভব / বাস্তবসম্মত', synonyms: ['Practical', 'Viable', 'Achievable'], antonyms: ['Impossible', 'Impractical'], example: 'The proposal is feasible within the budget.', category: 'Academic', uk: '', us: '' },
  { id: 'inevitable', word: 'Inevitable', meaning: 'অনিবার্য', synonyms: ['Unavoidable', 'Certain', 'Inescapable'], antonyms: ['Avoidable', 'Uncertain'], example: 'Some change is inevitable as cities grow.', category: 'Society', uk: '', us: '' }
];

const initialState = {
  user: JSON.parse(localStorage.getItem('ivm-user') || 'null'),
  theme: localStorage.getItem('ivm-theme') || 'light',
  favourites: JSON.parse(localStorage.getItem('ivm-favourites') || '[]'),
  learned: JSON.parse(localStorage.getItem('ivm-learned') || '[]'),
  books: JSON.parse(localStorage.getItem('ivm-books') || '[]'),
  categories: JSON.parse(localStorage.getItem('ivm-categories') || '[]'),
  view: 'Dashboard',
  authView: 'home',
  query: '',
  filter: 'All'
};

const state = initialState;
const app = document.querySelector('#app');
const persist = (key, value) => localStorage.setItem(`ivm-${key}`, JSON.stringify(value));
const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

function render() {
  document.documentElement.dataset.theme = state.theme;
  if (!state.user) return state.authView === 'signup' ? renderSignup() : renderHome();
  app.innerHTML = `${sidebar()}<main class="workspace"><header class="topbar"><button class="mobile-menu icon-button" data-action="menu" aria-label="Open navigation">☰</button><label class="searchbox"><span>⌕</span><input id="global-search" value="${escapeHtml(state.query)}" placeholder="Search vocabulary, tests, topics..." aria-label="Search IELTS content"><kbd>/</kbd></label><div class="top-actions"><button class="icon-button theme-button" data-action="theme" aria-label="Toggle color theme">${state.theme === 'light' ? '☼' : '☾'}</button><button class="user-chip" data-view="Profile"><span class="avatar">${escapeHtml((state.user.name || 'S').slice(0, 1).toUpperCase())}</span><span>${escapeHtml(state.user.name || 'Learner')}</span></button></div></header><div class="page" id="page-content">${pageContent()}</div><nav class="bottom-nav">${navItems().slice(0, 4).map(navButton).join('')}</nav></main><div class="toast" id="toast" role="status"></div>`;
  app.innerHTML = `${sidebar()}<main class="workspace"><header class="topbar"><button class="mobile-menu icon-button" data-action="menu" aria-label="Open navigation">☰</button><label class="searchbox"><span>⌕</span><input id="global-search" value="${escapeHtml(state.query)}" placeholder="Search vocabulary, tests, topics..." aria-label="Search IELTS content"><kbd>/</kbd></label><div class="top-actions"><button class="icon-button theme-button" data-action="theme" aria-label="Toggle color theme">${state.theme === 'light' ? '☼' : '☾'}</button><button class="user-chip" data-view="Profile"><span class="avatar">${escapeHtml((state.user.name || 'S').slice(0, 1).toUpperCase())}</span><span>${escapeHtml(state.user.name || 'Learner')}</span></button></div></header><div class="page" id="page-content">${pageContent()}</div><nav class="bottom-nav">${navItems().slice(0, 4).map(navButton).join('')}</nav></main><div class="toast" id="toast" role="status"></div>`;
  const now = new Date();
  const heading = app.querySelector('.welcome-row h1');
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';
  if (heading?.firstChild) heading.firstChild.textContent = `${greeting}, ${(state.user.name || 'Learner').trim().split(/\s+/)[0]}`;
  const dateLabel = app.querySelector('.welcome-row .eyebrow');
  if (dateLabel) dateLabel.textContent = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(now).toUpperCase();
  bindEvents();
}

function renderHome() {
  app.innerHTML = `<main class="public-home"><header class="public-header"><a class="brand brand-dark" href="#home"><span class="brand-mark">i.</span><span>IELTS <b>VOCAB</b> MASTER</span></a><div class="public-header-actions"><label class="searchbox public-search"><span>⌕</span><input id="public-search" placeholder="Search IELTS vocabulary..." aria-label="Search vocabulary"><kbd>/</kbd></label><button class="button button-soft" data-action="open-signup">Create account <span>↗</span></button></div></header><section class="public-hero"><div class="hero-copy"><span class="eyebrow">A MORE THOUGHTFUL WAY TO PREPARE</span><h1>Prepare smarter<br>for <em>IELTS.</em></h1><p>Build your vocabulary, strengthen every skill, and make steady progress toward your target band.</p><button class="button button-primary" data-action="public-start">Start learning <span>→</span></button><div class="hero-proof"><span class="proof-avatars"><i>S</i><i>R</i><i>A</i></span><span>Made for your IELTS journey</span><span class="proof-dot">·</span><span>Free to get started</span></div></div><div class="hero-visual" aria-label="Vocabulary practice preview"><div class="visual-paper"><div class="paper-top"><span>WORD OF THE DAY</span><span>01 / 25</span></div><div class="paper-word">Abundant<span>adjective · /əˈbʌn.dənt/</span></div><div class="paper-meaning">প্রচুর / পর্যাপ্তের চেয়ে বেশি</div><div class="paper-rule"></div><div class="paper-example"><small>IN CONTEXT</small><p>“The region has abundant natural resources.”</p></div><div class="paper-tags"><span>PLENTIFUL</span><span>AMPLE</span><span>COPIOUS</span></div><span class="paper-sparkle">✳</span></div><div class="visual-note">One useful word<br>at a time.</div><span class="visual-orbit"></span></div><div class="hero-bottom"><span>01</span><i></i><span>VOCABULARY THAT STICKS</span><span class="hero-bottom-right">ACADEMIC + GENERAL TRAINING</span></div></section><section class="public-offerings"><div class="offering-heading"><div><span class="eyebrow">YOUR PREPARATION, ALL IN ONE PLACE</span><h2>Make every practice count.</h2></div><p>Start with a word. Build a habit.<br>Get ready for the test that matters to you.</p></div><div class="offering-grid"><button class="offering-card offering-vocab" data-action="public-start"><span class="offering-icon">A<span>z</span></span><span class="offering-copy"><b>Vocabulary</b><small>Learn, save and revisit IELTS words.</small></span><span class="offering-arrow">↗</span></button>${['Reading', 'Listening', 'Speaking', 'Writing'].map((skill, index) => `<button class="offering-card" data-action="public-start"><span class="offering-icon offering-icon-${index}">${['▧', '◖', '◉', '≋'][index]}</span><span class="offering-copy"><b>${skill}</b><small>${['Academic & General Training', 'Four focused sections', 'Parts 1, 2 and 3', 'All four task types'][index]}</small></span><span class="offering-arrow">↗</span></button>`).join('')}</div></section><footer class="public-footer"><span>IELTS VOCAB MASTER</span><span>Prepare at your pace.</span></footer></main><div class="toast" id="toast" role="status"></div>`;
  bindEvents();
}

function renderSignup() {
  app.innerHTML = `<main class="auth-shell"><section class="auth-art"><div class="brand brand-light"><span class="brand-mark">i.</span><span>IELTS <b>VOCAB</b> MASTER</span></div><div class="art-copy"><span class="eyebrow">YOUR NEXT BAND STARTS HERE</span><h1>Words open<br>new worlds.</h1><p>A calmer, clearer way to prepare for the IELTS you want.</p><div class="art-orbit"><div class="orbit-word">abundant<span>adjective · plentiful</span></div><i class="orbit-dot dot-a"></i><i class="orbit-dot dot-b"></i><i class="orbit-dot dot-c"></i></div></div><div class="art-footer">Built for your IELTS journey <span>·</span> Bangladesh</div></section><section class="auth-form-wrap"><form id="signup-form" class="auth-form"><div class="brand brand-dark"><span class="brand-mark">i.</span><span>IELTS <b>VOCAB</b> MASTER</span></div><span class="eyebrow">START LEARNING</span><h2>Create your account</h2><p class="muted">A few details, then you’re on your way.</p><label>Full name<input name="name" autocomplete="name" placeholder="e.g. Saidul Islam" required></label><label>Email<input name="email" type="email" autocomplete="email" placeholder="you@example.com" required></label><div class="form-row"><label>Password<input name="password" type="password" minlength="8" autocomplete="new-password" placeholder="At least 8 characters" required></label><label>Confirm password<input name="confirm" type="password" minlength="8" autocomplete="new-password" placeholder="Repeat password" required></label></div><button class="button button-primary button-wide" type="submit">Create account <span>→</span></button><div class="or-rule"><span>OR</span></div><button class="button button-google button-wide" type="button" data-action="google"><b>G</b> Continue with Google</button><p class="auth-legal">By continuing, you agree to our <a href="#terms">Terms</a> and <a href="#privacy">Privacy Policy</a>.</p><p class="auth-note">Already have an account? <button type="button" class="text-button" data-action="demo-login">Open demo dashboard</button></p><p class="prototype-note">Demo prototype: account details stay in this browser only.</p></form></section></main><div class="toast" id="toast" role="status"></div>`;
  bindEvents();
}

function navItems() {
  return ['Dashboard', 'Vocabulary', 'Reading', 'Listening', 'Speaking', 'Writing', 'Favourites', 'Profile', 'Admin'];
}

function sidebar() {
  const links = navItems().map(navButton).join('');
  return `<aside class="sidebar"><a class="brand" href="#home" data-view="Dashboard"><span class="brand-mark">i.</span><span>IELTS <b>VOCAB</b><small>MASTER</small></span></a><div class="nav-caption">YOUR WORKSPACE</div><nav class="side-nav">${links}</nav><div class="sidebar-bottom"><div class="streak"><span class="streak-icon">✳</span><div><b>Keep your streak</b><small>Small steps add up.</small></div><span class="streak-count">${state.user.streak || 0}<small>days</small></span></div><button class="sidebar-profile" data-view="Profile"><span class="avatar">${escapeHtml((state.user.name || 'S').slice(0, 1).toUpperCase())}</span><span><b>${escapeHtml(state.user.name || 'Learner')}</b><small>${escapeHtml(state.user.examType || 'Set up your profile')}</small></span><span class="more">···</span></button></div></aside>`;
}

function navButton(item) {
  const icons = { Dashboard: '◫', Vocabulary: '▤', Reading: '▧', Listening: '◖', Speaking: '◉', Writing: '≋', Favourites: '♡', Profile: '◎', Admin: '⌘' };
  return `<button class="nav-link ${state.view === item ? 'active' : ''}" data-view="${item}"><span class="nav-icon">${icons[item]}</span><span>${item}</span>${item === 'Favourites' && state.favourites.length ? `<small>${state.favourites.length}</small>` : ''}</button>`;
}

function pageContent() {
  const pages = { Dashboard: dashboard, Vocabulary: vocabularyPage, Favourites: favouritesPage, Profile: profilePage, Admin: adminPage, Reading: () => skillPage('Reading'), Listening: () => skillPage('Listening'), Speaking: () => skillPage('Speaking'), Writing: () => skillPage('Writing') };
  return (pages[state.view] || dashboard)();
}

function dashboard() {
  const firstName = escapeHtml((state.user.name || 'Learner').trim().split(/\s+/)[0]);
  const progress = state.user.progress || { Vocabulary: 68, Reading: 42, Listening: 35, Speaking: 28, Writing: 20 };
  return `<section class="welcome-row"><div><span class="eyebrow">SATURDAY, OCTOBER 3</span><h1>Good morning, ${firstName}<span class="wave">✳</span></h1><p class="muted">A little practice today goes a long way.</p></div><button class="button button-primary" data-action="start-learning">Start learning <span>→</span></button></section><section class="dashboard-top"><div class="target-panel"><div class="target-copy"><span class="eyebrow">YOUR TARGET</span><h2>Band <strong>${escapeHtml(state.user.targetBand || '7.0')}</strong></h2><p>${escapeHtml(state.user.examType || 'Academic')} IELTS</p><button class="text-button" data-view="Profile">Update goal <span>↗</span></button></div><div class="target-art" aria-hidden="true"><span class="target-ring ring-one"></span><span class="target-ring ring-two"></span><span class="target-ring ring-three"></span><span class="target-star">✳</span></div></div><div class="review-panel"><div class="review-icon">↻</div><div><span class="eyebrow">SMART REVIEW</span><h3>${Math.max(0, 32 - state.learned.length)} words to revisit</h3><p class="muted">Keep new words fresh in your memory.</p></div><button class="circle-arrow" data-view="Vocabulary" aria-label="Start revision">↗</button></div></section><section class="progress-section"><div class="section-heading"><div><span class="eyebrow">YOUR JOURNEY</span><h2>Your progress</h2></div><button class="text-button" data-view="Profile">See all <span>→</span></button></div><div class="progress-grid">${skills.map((skill, index) => `<div class="progress-item"><div class="progress-top"><span class="progress-icon icon-${index}">${['▤', '▧', '◖', '◉', '≋'][index]}</span><span>${skill}</span><strong>${progress[skill] || 0}%</strong></div><div class="progress-track"><i style="width:${progress[skill] || 0}%"></i></div></div>`).join('')}</div></section><section class="learning-section"><div class="section-heading"><div><span class="eyebrow">A GOOD PLACE TO BEGIN</span><h2>Today’s learning</h2></div><span class="today-date">25–35 min</span></div><div class="learning-grid"><button class="learning-card vocab-card" data-view="Vocabulary"><span class="learning-symbol">A<span>z</span></span><span class="learning-card-copy"><b>25 vocabulary words</b><small>Build a sharper word bank</small></span><span class="card-arrow">↗</span></button><button class="learning-card" data-view="Reading"><span class="learning-symbol symbol-reading">▧</span><span class="learning-card-copy"><b>1 reading test</b><small>Academic · timed practice</small></span><span class="card-arrow">↗</span></button><button class="learning-card" data-view="Listening"><span class="learning-symbol symbol-listen">◖</span><span class="learning-card-copy"><b>1 listening test</b><small>Train your listening ear</small></span><span class="card-arrow">↗</span></button><button class="learning-card" data-view="Speaking"><span class="learning-symbol symbol-speak">◉</span><span class="learning-card-copy"><b>5 speaking questions</b><small>Find your words out loud</small></span><span class="card-arrow">↗</span></button></div><p class="prototype-note dashboard-note">Your activity here is saved on this device in this prototype.</p></section>`;
}

function vocabularyPage() {
  const search = state.query.trim().toLowerCase();
  const filtered = words.filter((word) => {
    const content = [word.word, word.meaning, word.category, ...word.synonyms].join(' ').toLowerCase();
    const categoryMatch = state.filter === 'All' || state.filter === 'Learned' || word.category === state.filter;
    const learnedMatch = state.filter !== 'Learned' || state.learned.includes(word.id);
    return (!search || content.includes(search)) && categoryMatch && learnedMatch;
  });
  return `<section class="page-title-row"><div><span class="eyebrow">YOUR WORD BANK</span><h1>Vocabulary</h1><p class="muted">Collect useful words. Make them yours.</p></div><button class="button button-soft" data-action="toggle-learned-filter">${state.filter === 'Learned' ? 'Show all words' : `✓ ${state.learned.length} learned`}</button></section><div class="filterbar"><label class="filter-select">Book <select id="book-filter"><option>All Books</option>${state.books.map((book) => `<option>${escapeHtml(book)}</option>`).join('')}</select></label><label class="filter-select">Test <select><option>All Tests</option><option>Test 1</option><option>Test 2</option></select></label><label class="filter-select">Difficulty <select><option>All levels</option><option>Intermediate</option><option>Advanced</option></select></label><label class="filter-select">Category <select id="category-filter"><option>All</option>${[...new Set(words.map((word) => word.category))].map((category) => `<option ${state.filter === category ? 'selected' : ''}>${escapeHtml(category)}</option>`).join('')}</select></label></div>${filtered.length ? `<div class="word-grid">${filtered.map(wordCard).join('')}</div>` : `<div class="empty-state"><span>⌕</span><h3>No words found</h3><p>Try another word or clear your search.</p></div>`}<p class="prototype-note dashboard-note">Sample vocabulary for the prototype. Audio clips can be added through a future admin content system.</p>`;
}

function wordCard(word) {
  const fav = state.favourites.includes(word.id);
  const learned = state.learned.includes(word.id);
  return `<article class="word-card"><div class="word-card-top"><button class="icon-button favorite-button ${fav ? 'is-favourite' : ''}" data-word-action="favorite" data-id="${word.id}" aria-label="${fav ? 'Remove favourite' : 'Add favourite'}">${fav ? '♥' : '♡'}</button><div class="pronunciation"><button data-word-action="speak-uk" data-id="${word.id}" title="Listen to UK pronunciation">UK <span>◖</span></button><button data-word-action="speak-us" data-id="${word.id}" title="Listen to US pronunciation">US <span>◖</span></button></div></div><span class="word-category">${escapeHtml(word.category)}</span><h2>${escapeHtml(word.word)}</h2><p class="word-meaning">${escapeHtml(word.meaning)}</p><div class="word-detail"><b>Synonyms</b><p>${word.synonyms.map(escapeHtml).join(' <i>·</i> ')}</p></div><div class="word-detail"><b>Antonyms</b><p>${word.antonyms.map(escapeHtml).join(' <i>·</i> ')}</p></div><div class="word-example"><b>Example</b><p>${escapeHtml(word.example)}</p></div><button class="learn-button ${learned ? 'learned' : ''}" data-word-action="learned" data-id="${word.id}">${learned ? '✓ Learned' : 'Mark as learned'}</button></article>`;
}

function favouritesPage() {
  const favWords = words.filter((word) => state.favourites.includes(word.id));
  return `<section class="page-title-row"><div><span class="eyebrow">SAVED FOR LATER</span><h1>Favourites</h1><p class="muted">Your personal collection of useful words.</p></div><span class="saved-count">${favWords.length} saved</span></section>${favWords.length ? `<div class="word-grid">${favWords.map(wordCard).join('')}</div>` : `<div class="empty-state"><span>♡</span><h3>Your list is waiting</h3><p>Tap the heart on any vocabulary word to save it here.</p><button class="button button-soft" data-view="Vocabulary">Explore vocabulary <span>→</span></button></div>`}`;
}

function profilePage() {
  return `<section class="page-title-row"><div><span class="eyebrow">YOUR ACCOUNT</span><h1>Profile & settings</h1><p class="muted">Keep your goals and preferences up to date.</p></div></section><form id="profile-form" class="settings-form"><div class="settings-block"><div><span class="eyebrow">IELTS PREPARATION</span><h2>Your learning goal</h2><p class="muted">You can change this whenever your plans change.</p></div><div class="settings-fields"><label>Test type<select name="examType"><option ${state.user.examType === 'Academic' ? 'selected' : ''}>Academic</option><option ${state.user.examType === 'General Training' ? 'selected' : ''}>General Training</option></select></label><label>Target band<select name="targetBand">${bands.map((band) => `<option ${String(state.user.targetBand || '7.0') === band ? 'selected' : ''}>${band}</option>`).join('')}</select></label></div></div><div class="settings-block"><div><span class="eyebrow">APPEARANCE</span><h2>Display theme</h2><p class="muted">Your choice is remembered on this device.</p></div><div class="theme-options"><button type="button" class="theme-option ${state.theme === 'light' ? 'selected' : ''}" data-action="set-light"><span>☼</span> Light</button><button type="button" class="theme-option ${state.theme === 'dark' ? 'selected' : ''}" data-action="set-dark"><span>☾</span> Dark</button></div></div><div class="settings-actions"><button class="button button-primary" type="submit">Save changes <span>→</span></button><button class="text-button" type="button" data-action="sign-out">Sign out</button></div><p class="prototype-note">This prototype stores profile preferences in browser storage, not a cloud account.</p></form>`;
}

function skillPage(skill) {
  const isWriting = skill === 'Writing';
  const options = isWriting ? ['Academic Task 1', 'Academic Task 2', 'General Training Task 1', 'General Training Task 2'] : skill === 'Reading' ? ['Academic', 'General Training'] : skill === 'Speaking' ? ['Part 1', 'Part 2 · Cue cards', 'Part 3'] : ['Section 1', 'Section 2', 'Section 3', 'Section 4'];
  return `<section class="page-title-row"><div><span class="eyebrow">PRACTICE YOUR SKILLS</span><h1>${skill}</h1><p class="muted">${skill === 'Reading' ? 'Build focus and confidence with IELTS-style passages.' : skill === 'Writing' ? 'Find a clear structure for every task type.' : skill === 'Listening' ? 'Listen with purpose, one section at a time.' : 'Explore ideas and make your answers your own.'}</p></div></section><div class="skill-tabs">${options.map((option, index) => `<button class="skill-tab ${index === 0 ? 'selected' : ''}" data-action="skill-tab">${escapeHtml(option)} <span>↗</span></button>`).join('')}</div><section class="empty-content"><div class="empty-illustration"><span class="empty-sun">✳</span><span class="empty-book">${skill === 'Listening' ? '◖' : skill === 'Speaking' ? '◉' : '▤'}</span></div><span class="eyebrow">YOUR NEXT PRACTICE</span><h2>${skill} content is ready to grow</h2><p>Connect a content library to add tests, questions, explanations and free or premium access.</p><button class="button button-soft" data-view="Dashboard">Back to dashboard</button></section>`;
}

function adminPage() {
  return `<section class="page-title-row"><div><span class="eyebrow">CONTENT WORKSPACE · DEMO</span><h1>Admin overview</h1><p class="muted">A preview of content management. This screen is not access-controlled.</p></div><span class="admin-label">LOCAL DEMO</span></section><div class="admin-grid"><section class="admin-panel"><div class="section-heading"><div><span class="eyebrow">CONTENT</span><h2>Books</h2></div><span class="count-pill">${state.books.length}</span></div><form id="book-form" class="inline-form"><input name="book" placeholder="e.g. Cambridge 20" required aria-label="Book name"><button class="button button-primary" type="submit">+ Add book</button></form><div class="admin-list">${state.books.length ? state.books.map((book) => `<div><span>${escapeHtml(book)}</span><button class="icon-button" data-remove-book="${escapeHtml(book)}" aria-label="Remove ${escapeHtml(book)}">×</button></div>`).join('') : '<p class="muted">No books added yet. Create a book to populate the content library.</p>'}</div></section><section class="admin-panel"><div class="section-heading"><div><span class="eyebrow">VOCABULARY</span><h2>Categories</h2></div><span class="count-pill">${state.categories.length}</span></div><form id="category-form" class="inline-form"><input name="category" placeholder="e.g. Cambridge 20" required aria-label="Category name"><button class="button button-primary" type="submit">+ Add category</button></form><div class="admin-list">${state.categories.length ? state.categories.map((category) => `<div><span>${escapeHtml(category)}</span><button class="icon-button" data-remove-category="${escapeHtml(category)}" aria-label="Remove ${escapeHtml(category)}">×</button></div>`).join('') : '<p class="muted">Flexible categories can be added here.</p>'}</div></section><section class="admin-panel plans-panel"><div class="section-heading"><div><span class="eyebrow">PREMIUM</span><h2>Plans</h2></div><span class="access-pill">Payments disabled</span></div><p class="muted">Plan pricing and payment methods must come from a trusted backend. No subscription status can be changed from this demo.</p><div class="plan-durations">${['1 month', '3 months', '6 months', '12 months'].map((duration) => `<span>${duration}</span>`).join('')}</div></section></div>`;
}

function toast(message) {
  const element = document.querySelector('#toast');
  if (!element) return;
  element.textContent = message;
  element.classList.add('show');
  window.clearTimeout(toast.timeout);
  toast.timeout = window.setTimeout(() => element.classList.remove('show'), 2600);
}

function bindEvents() {
  document.querySelectorAll('[data-action="open-signup"], [data-action="public-start"]').forEach((button) => button.addEventListener('click', () => { state.authView = 'signup'; render(); }));
  document.querySelector('#public-search')?.addEventListener('keydown', (event) => { if (event.key === 'Enter') { state.query = event.currentTarget.value; state.authView = 'signup'; render(); toast('Create a free account to explore vocabulary.'); } });
  document.querySelectorAll('[data-view]').forEach((button) => button.addEventListener('click', () => { state.view = button.dataset.view; state.query = ''; render(); window.scrollTo(0, 0); }));
  document.querySelector('[data-action="theme"]')?.addEventListener('click', () => setTheme(state.theme === 'light' ? 'dark' : 'light'));
  document.querySelector('[data-action="set-light"]')?.addEventListener('click', () => setTheme('light'));
  document.querySelector('[data-action="set-dark"]')?.addEventListener('click', () => setTheme('dark'));
  document.querySelector('[data-action="menu"]')?.addEventListener('click', () => document.querySelector('.sidebar')?.classList.toggle('open'));
  document.querySelector('[data-action="google"]')?.addEventListener('click', () => toast('Google sign-in becomes available after Firebase setup.'));
  document.querySelector('[data-action="demo-login"]')?.addEventListener('click', () => { state.user = { name: 'Saidul Islam', email: 'saidul@example.com', examType: 'Academic', targetBand: '7.5', progress: { Vocabulary: 68, Reading: 42, Listening: 35, Speaking: 28, Writing: 20 }, streak: 4 }; persist('user', state.user); state.view = 'Dashboard'; render(); });
  document.querySelector('[data-action="sign-out"]')?.addEventListener('click', () => { localStorage.removeItem('ivm-user'); state.user = null; render(); });
  document.querySelector('[data-action="start-learning"]')?.addEventListener('click', () => { state.view = 'Vocabulary'; render(); });
  document.querySelector('[data-action="toggle-learned-filter"]')?.addEventListener('click', (event) => { state.filter = state.filter === 'Learned' ? 'All' : 'Learned'; render(); });
  document.querySelectorAll('[data-action="skill-tab"]').forEach((button) => button.addEventListener('click', () => { document.querySelectorAll('[data-action="skill-tab"]').forEach((tab) => tab.classList.remove('selected')); button.classList.add('selected'); }));
  document.querySelector('#global-search')?.addEventListener('input', (event) => { state.query = event.target.value; if (state.query && state.view !== 'Vocabulary') state.view = 'Vocabulary'; render(); const input = document.querySelector('#global-search'); input?.focus(); input?.setSelectionRange(state.query.length, state.query.length); });
  document.querySelector('#category-filter')?.addEventListener('change', (event) => { state.filter = event.target.value; render(); });
  document.querySelectorAll('[data-word-action]').forEach((button) => button.addEventListener('click', () => handleWordAction(button.dataset.wordAction, button.dataset.id)));
  document.querySelector('#signup-form')?.addEventListener('submit', (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); if (form.get('password') !== form.get('confirm')) return toast('Passwords do not match.'); if (String(form.get('password')).length < 8) return toast('Use at least 8 characters for your password.'); state.pendingUser = { name: String(form.get('name')).trim(), email: String(form.get('email')).trim() }; renderSetup(); });
  document.querySelector('#profile-form')?.addEventListener('submit', (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); state.user = { ...state.user, examType: form.get('examType'), targetBand: form.get('targetBand') }; persist('user', state.user); render(); toast('Your learning goal is saved.'); });
  document.querySelector('#setup-form')?.addEventListener('submit', (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); state.user = { ...state.pendingUser, examType: form.get('examType'), targetBand: form.get('targetBand'), progress: { Vocabulary: 0, Reading: 0, Listening: 0, Speaking: 0, Writing: 0 }, streak: 0 }; persist('user', state.user); state.view = 'Dashboard'; render(); });
  document.querySelector('#book-form')?.addEventListener('submit', (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); const book = String(form.get('book')).trim(); if (!state.books.includes(book)) state.books.push(book); persist('books', state.books); render(); toast(`${book} added.`); });
  document.querySelector('#category-form')?.addEventListener('submit', (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); const category = String(form.get('category')).trim(); if (!state.categories.includes(category)) state.categories.push(category); persist('categories', state.categories); render(); toast(`${category} added.`); });
  document.querySelectorAll('[data-remove-book]').forEach((button) => button.addEventListener('click', () => { state.books = state.books.filter((book) => book !== button.dataset.removeBook); persist('books', state.books); render(); }));
  document.querySelectorAll('[data-remove-category]').forEach((button) => button.addEventListener('click', () => { state.categories = state.categories.filter((category) => category !== button.dataset.removeCategory); persist('categories', state.categories); render(); }));
  window.addEventListener('keydown', handleShortcut, { once: true });
}

function renderSetup() {
  app.innerHTML = `<main class="setup-shell"><div class="setup-card"><a class="brand brand-dark" href="#"><span class="brand-mark">i.</span><span>IELTS <b>VOCAB</b> MASTER</span></a><div class="setup-progress"><i></i><span>YOUR PROFILE · 1 OF 1</span></div><span class="eyebrow">LET’S MAKE A PLAN</span><h1>Welcome to IELTS<br>Vocab Master</h1><p class="muted">A couple of choices help us make your practice more relevant.</p><form id="setup-form"><fieldset><legend>What IELTS test are you preparing for?</legend><label class="choice-card"><input type="radio" name="examType" value="Academic" checked><span class="choice-dot"></span><span><b>Academic</b><small>For higher education or professional registration</small></span><span class="choice-check">✓</span></label><label class="choice-card"><input type="radio" name="examType" value="General Training"><span class="choice-dot"></span><span><b>General Training</b><small>For work, training or migration</small></span><span class="choice-check">✓</span></label></fieldset><label class="band-label">Your target band<select name="targetBand">${bands.map((band) => `<option ${band === '7.0' ? 'selected' : ''}>${band}</option>`).join('')}</select></label><button class="button button-primary button-wide" type="submit">Continue <span>→</span></button></form><p class="setup-foot">You can update these choices later in your profile.</p></div></main>`;
  bindEvents();
}

function setTheme(theme) {
  state.theme = theme;
  localStorage.setItem('ivm-theme', theme);
  render();
}

function handleWordAction(action, id) {
  if (action === 'favorite') {
    state.favourites = state.favourites.includes(id) ? state.favourites.filter((item) => item !== id) : [...state.favourites, id];
    persist('favourites', state.favourites);
    render();
  } else if (action === 'learned') {
    state.learned = state.learned.includes(id) ? state.learned.filter((item) => item !== id) : [...state.learned, id];
    persist('learned', state.learned);
    render();
  } else {
    const word = words.find((item) => item.id === id);
    if (!word || !('speechSynthesis' in window)) return toast('Audio pronunciation is not available in this browser.');
    const utterance = new SpeechSynthesisUtterance(word.word);
    utterance.lang = action === 'speak-uk' ? 'en-GB' : 'en-US';
    window.speechSynthesis.speak(utterance);
  }
}

function handleShortcut(event) {
  if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) { event.preventDefault(); document.querySelector('#global-search')?.focus(); }
  window.addEventListener('keydown', handleShortcut, { once: true });
}

render();