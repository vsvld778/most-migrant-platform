import { pages, groups, tabs } from './routes.js';
import { icon } from './icons.js';
import { renderDashboard } from './dashboard.js';
import { renderMoney, moneyAction, moneySubmit } from './money.js';
import { renderServices, serviceAction, serviceSubmit } from './services.js';
import { renderLedger, ledgerAction, beginOrder, openReceipt } from './ledger.js';
import { renderCases, casesAction, casesSubmit } from './cases.js';

const stateKey = 'most.platform.demo.v1';
const prefsKey = 'most.platform.prefs.v1';
const root = document.documentElement;
const screen = document.querySelector('#screen');
let lang = root.lang;
let theme = root.dataset.theme;
let lastRoute;
let toastTimer;
let serialized = '';
let s;
const t = (ru, ky) => lang === 'ky' ? ky : ru;
const b = pair => t(...pair);
const num = n => new Intl.NumberFormat(t('ru-RU','ky-KG'), {maximumFractionDigits:2}).format(n);
const money = n => num(n) + '\u00a0₽';
const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const label = route => b(pages[route]);
function initialState() {
  return {balance:60000, salary:{expected:68000,received:60000,advance:5000}, housing:{rent:18000,deposit:18000,returned:0,paid:false},
    patent:{enabled:false,paid:false}, mobilePaid:false, orders:[], cases:[], caseDraft:null, aid:null, draft:null, receiptId:null};
}
function readStorage(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}
function refreshState() {
  const raw = readStorage(stateKey);
  if (raw && raw !== serialized) {
    try {
      const saved = JSON.parse(raw);
      if (Array.isArray(saved.orders) && Array.isArray(saved.cases) && Number.isFinite(saved.balance)) {
        s = Object.assign(initialState(), saved);
        serialized = raw;
      }
    } catch { /* Use the existing demo if local storage is unavailable. */ }
  }
  if (!s) s = initialState();
}
function save() {
  const next = JSON.stringify(s);
  if (next === serialized) return;
  try { localStorage.setItem(stateKey, next); serialized = next; }
  catch { toast(t('Изменения доступны до закрытия страницы','Өзгөрүүлөр барак жабылганга чейин жеткиликтүү')); }
}
function savePrefs() {
  try { localStorage.setItem(prefsKey, JSON.stringify({lang,theme})); } catch {}
}
function toast(message) {
  const node = document.querySelector('#toast');
  node.textContent = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { node.textContent = ''; }, 3200);
}
function currentRoute() {
  const key = location.hash.slice(1);
  return Object.hasOwn(pages, key) ? key : 'month';
}
function go(route) {
  if (!Object.hasOwn(pages,route)) route = 'month';
  if (location.hash !== '#' + route) location.hash = route;
  else render();
}
function startCase(draft) {
  s.caseDraft = {...draft};
  save();
  go('new-case');
}
const c = {get s() { return s; }, t,b,num,money,esc,icon,go,save,render,toast,
  caseDraft:startCase, order:data => beginOrder(data,c), receipt:id => openReceipt(id,c)};
function activeTab(route) {
  if (route === 'new-case') return 'cases';
  if (route === 'receipt' || route === 'history' || route === 'review') return 'wallet';
  return pages[route][3] || route;
}
function renderChrome(route) {
  root.lang = lang;
  root.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]').content = theme === 'light' ? '#f4f6ef' : '#0d201d';
  const brandName = t('Мост поддержки','Колдоо көпүрөсү');
  const logo = '<img src="./icon.webp" width="34" height="34" alt="">';
  document.querySelector('.desk-logo').innerHTML = logo+'<span><strong>'+brandName+'</strong><small>Migrant Wallet · iPhone 18 Pro Max</small></span>';
  document.querySelector('.brand').innerHTML = logo+'<span><strong>'+brandName+'</strong><small>Migrant Wallet</small></span>';
  const openLink = document.querySelector('.desk-open');
  openLink.href = '?view=mobile#'+route;
  openLink.innerHTML = icon('external')+t('Открыть без рамки','Алкаксыз ачуу');
  const tocTitle = t('Экраны приложения','Колдонмонун экрандары');
  document.querySelector('.toc h2').textContent = tocTitle;
  document.querySelector('.toc-toggle').innerHTML = tocTitle +icon('menu');
  const active = key => key === route ? ' aria-current="page"' : '';
  const catalog = document.querySelector('#catalog');
  catalog.setAttribute('aria-label',tocTitle);
  catalog.innerHTML = groups.map(([title,items]) => '<section><h3>'+b(title)+'</h3>'+items.map(key =>
    '<a href="#'+key+'"'+active(key)+'>'+icon(pages[key][2])+'<span>'+label(key)+'</span></a>').join('')+'</section>').join('');
  const themeLabel = theme === 'dark' ? t('Включить светлую тему','Жарык теманы күйгүзүү') : t('Включить тёмную тему','Караңгы теманы күйгүзүү');
  const langLabel = t('Переключить на кыргызский · Кыргызча','Орус тилине которуу · Русский');
  document.querySelector('.head-actions').innerHTML = '<button type="button" data-action="theme" aria-label="'+themeLabel+'" title="'+themeLabel+'">'+icon(theme === 'dark'?'sun':'moon')+'</button>'+
    '<button type="button" data-action="lang" aria-label="'+langLabel+'" title="'+langLabel+'">'+t('КЫР','РУС')+'</button>';
  const nav = document.querySelector('.tabs');
  nav.setAttribute('aria-label',t('Основная навигация','Негизги багыттоо'));
  nav.innerHTML = tabs.map(([key,ru,ky]) => '<a href="#'+key+'"'+(activeTab(route)===key?' aria-current="page"':'')+'>'+icon(pages[key][2])+'<span>'+t(ru,ky)+'</span></a>').join('');
}
function heading(route) {
  const parent = route === 'review' ? s.draft?.back || 'wallet' : pages[route][3];
  const back = parent ? '<a class="back" href="#'+parent+'">'+icon('arrow-left')+label(parent)+'</a>' : '';
  const period = route === 'month' ? '<span class="eyebrow">'+t('Ноябрь 2026','Ноябрь 2026')+'</span>' : '';
  return '<header class="page-head">'+back+period+'<h1>'+label(route)+'</h1></header>';
}
function render() {
  const route = currentRoute();
  const moved = lastRoute !== route;
  const top = screen.scrollTop;
  document.body.dataset.route = route;
  document.title = label(route)+' · '+t('Мост поддержки','Колдоо көпүрөсү');
  renderChrome(route);
  const content = renderDashboard(route,c) || renderMoney(route,c) || renderServices(route,c) || renderCases(route,c) || renderLedger(route,c);
  screen.innerHTML = heading(route)+content;
  if (route === 'new-case') save();
  if (moved) {
    document.querySelector('.toc').classList.remove('open');
    document.querySelector('.toc-toggle').setAttribute('aria-expanded','false');
    if (lastRoute) screen.focus({preventScroll:true});
  }
  screen.scrollTop = moved ? 0 : top;
  lastRoute = route;
}
function changeLanguage() {
  const inputs = [...screen.querySelectorAll('input:not([type=hidden]), select, textarea')].map(el => [el.name,el.type,el.value,el.checked]);
  const open = [...screen.querySelectorAll('details')].map(el => el.open);
  lang = t('ky','ru');
  savePrefs();
  render();
  screen.querySelectorAll('input:not([type=hidden]), select, textarea').forEach((el,i) => {
    const snapshot = inputs[i];
    if (snapshot?.[0] !== el.name || snapshot[1] !== el.type) return;
    if (el.type === 'checkbox' || el.type === 'radio') el.checked = snapshot[3];
    else el.value = snapshot[2];
  });
  screen.querySelectorAll('details').forEach((el,i) => { el.open = !!open[i]; });
}
function mutate(handler) {
  const run = () => { refreshState(); handler(); };
  // Serialize local ledger changes even when the desktop and phone views are in separate tabs.
  if (navigator.locks) navigator.locks.request(stateKey,run).catch(console.error);
  else run();
}
document.addEventListener('click', event => {
  const link = event.target.closest('a[href="#cases"]');
  if (link && s.viewCaseId) { s.viewCaseId = ''; save(); if (currentRoute() === 'cases') render(); }
  const button = event.target.closest('button[data-action]');
  if (!button || button.disabled) return;
  const action = button.dataset.action;
  if (action === 'toc') {
    const open = document.querySelector('.toc').classList.toggle('open');
    button.setAttribute('aria-expanded',String(open));
  } else if (action === 'lang') changeLanguage();
  else if (action === 'theme') {
    theme = theme === 'dark' ? 'light' : 'dark';
    savePrefs();
    renderChrome(currentRoute());
  } else mutate(() => moneyAction(action,button,c) || serviceAction(action,button,c) || casesAction(action,button,c) || ledgerAction(action,button,c));
});
document.addEventListener('submit', event => {
  const form = event.target.closest('form[data-form]');
  if (!form) return;
  event.preventDefault();
  const name = form.dataset.form;
  mutate(() => moneySubmit(name,form,c) || serviceSubmit(name,form,c) || casesSubmit(name,form,c));
});
window.addEventListener('storage', event => {
  if (event.key === stateKey && event.newValue !== serialized) { refreshState(); render(); }
  if (event.key === prefsKey && event.newValue) {
    try { const prefs = JSON.parse(event.newValue); lang = prefs.lang === 'ky'?'ky':'ru'; theme = prefs.theme === 'light'?'light':'dark'; render(); } catch {}
  }
});
window.addEventListener('hashchange', render);
document.querySelector('.status-icons').innerHTML = icon('network')+icon('wifi')+icon('battery');
refreshState();
render();
