const origins = {rent:'housing', family:'family', patent:'documents', mobile:'mobile', trip:'trip', transport:'transport', appointment:'appointments'};
const deferred = kind => kind === 'trip' || kind === 'appointment';
const sourceName = ['Демо-карта «Мир» •• 0421', '«Мир» демо-картасы •• 0421'];
let refundFor = null;
let quoteTimer;
const quoteDuration = 10 * 60 * 1000;

function cents(amount) {
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount < 0) return null;
  const n = Math.round(amount * 100);
  return Number.isSafeInteger(n) && Math.abs(amount * 100 - n) < 0.00001 ? n : null;
}

function validPair(pair) {
  return Array.isArray(pair) && pair.length === 2 && pair.every(text => typeof text === 'string' && text.trim());
}

function validDraft(data) {
  return data && Object.hasOwn(origins,data.kind) && data.back === origins[data.kind] && cents(data.amount) > 0 &&
    validPair(data.title) && validPair(data.detail);
}

function paidPeriod(kind,s) {
  return (kind === 'rent' && s.housing.paid) || (kind === 'patent' && s.patent.paid);
}

function message(c,ru,ky) {
  c.toast(c.t(ru,ky));
}

function uniqueId(s) {
  let id;
  do {
    const bytes = crypto.getRandomValues(new Uint32Array(2));
    id = 'MW-' + Array.from(bytes, n => n.toString(36).padStart(7,'0')).join('').toUpperCase();
  } while (s.orders.some(o => o.id === id) || s.draft?.id === id);
  return id;
}

export function beginOrder(data,c) {
  const {s} = c;
  if (!validDraft(data)) {
    message(c,'Проверьте данные платежа','Төлөмдүн маалыматын текшериңиз');
    return false;
  }
  if (paidPeriod(data.kind,s)) {
    message(c,'Этот период уже оплачен','Бул мезгил үчүн төлөнгөн');
    return false;
  }
  s.draft = {...data, id:uniqueId(s)};
  if (data.kind === 'family') s.draft.quoteExpiresAt = Date.now() + quoteDuration;
  refundFor = null;
  c.save();
  c.go('review');
  return true;
}

export function openReceipt(id,c) {
  if (!c.s.orders.some(o => o.id === id)) return false;
  refundFor = null;
  c.s.receiptId = id;
  c.save();
  c.go('receipt');
  return true;
}

function link(route,label,primary=false) {
  return '<a class="btn ' + (primary?'primary':'secondary') + '" href="#'+route+'">'+label+'</a>';
}

function action(c,name,id,label,primary=false,disabled=false) {
  return '<button type="button" class="btn ' + (primary?'primary':'secondary') + '" data-action="ledger-'+name+'" data-id="'+c.esc(id)+'"'+(disabled?' disabled':'')+'>'+label+'</button>';
}

function row(label,value) {
  return '<div class="summary-row"><span class="sub">'+label+'</span><strong>'+value+'</strong></div>';
}

function date(c,iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : new Intl.DateTimeFormat(c.t('ru-RU','ky-KG'), {day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(d);
}

function empty(c,title,detail,route,label) {
  return '<section class="panel stack"><h2 class="section-title">'+c.b(title)+'</h2><p class="sub">'+c.b(detail)+'</p>'+link(route,c.b(label),true)+'</section>';
}

function familyDetails(o,c) {
  if (o.kind !== 'family' || !Number.isFinite(o.received)) return '';
  const format = new Intl.NumberFormat(c.t('ru-RU','ky-KG'),{maximumFractionDigits:2});
  const received = format.format(o.received);
  return '<div class="list">'+row(c.t('Сумма перевода','Которуунун суммасы'),c.money(o.principal))+
    row(c.t('Комиссия','Комиссия'),c.money(o.fee))+
    row(c.t('Курс обмена','Алмашуу курсу'),'1 RUB = '+format.format(o.rate)+' KGS')+
    row(o.status === 'paid' ? c.t('Получателю зачислено','Алуучуга түштү') : c.t('Семья получит','Үй-бүлө алат'),received+' KGS')+'</div>';
}

function expiredQuote(o) {
  return o.kind === 'family' && (!Number.isFinite(o.quoteExpiresAt) || Date.now() >= o.quoteExpiresAt);
}

function orderSummary(o,c) {
  const recipient = o.kind === 'family' && Number.isFinite(o.received) ? c.b(o.detail).split(' · ').slice(0,2).join(' · ') : c.b(o.detail);
  return '<section class="panel stack"><h2 class="section-title">'+c.esc(c.b(o.title))+'</h2><p class="sub">'+c.esc(recipient)+'</p>'+familyDetails(o,c)+'</section>';
}

function review(c) {
  const o = c.s.draft, {t,money} = c;
  if (!validDraft(o) || !o.id) return empty(c,['Выберите платёж','Төлөмдү тандаңыз'],['Начните с услуги или перевода. Здесь вы сможете проверить сумму перед оплатой.','Адегенде кызматты же которууну тандаңыз. Андан соң бул жерден сумманы текшере аласыз.'],'home',['На главную','Башкы бетке']);
  const available = cents(c.s.balance);
  const enough = available !== null && available >= cents(o.amount);
  const expired = expiredQuote(o);
  const quote = o.kind === 'family' ? '<div class="panel" role="status">'+(expired
    ? t('Срок курса истёк. Рассчитайте перевод ещё раз','Курстун мөөнөтү бүттү. Которууну кайра эсептеңиз')
    : t('Курс закреплён на 10 минут, до ','Курс 10 мүнөткө бекитилди, аяктоо убактысы — ')+date(c,o.quoteExpiresAt))+'.</div>' : '';
  if (typeof window !== 'undefined') {
    clearTimeout(quoteTimer);
    if (o.kind === 'family' && !expired) quoteTimer = setTimeout(() => {
      if (location.hash === '#review' && c.s.draft?.id === o.id) c.render();
    }, Math.max(1,o.quoteExpiresAt-Date.now()+1));
  }
  return '<div class="stack">'+orderSummary(o,c)+quote+'<section class="panel stack"><h2 class="section-title">'+t('Откуда спишем','Акча кайдан алынат')+'</h2>'+
    '<strong>'+c.b(sourceName)+'</strong>'+row(t('Доступно','Жеткиликтүү'),money(c.s.balance))+
    row(t('К списанию','Эсептен алынат'),money(o.amount))+
    (enough?row(t('Остаток после платежа','Төлөмдөн кийинки калдык'),money((available-cents(o.amount))/100)):
    '<p role="status" class="sub">'+t('Недостаточно средств. Не хватает ','Каражат жетишсиз. Жетпеген сумма — ')+money((cents(o.amount)-(available??0))/100)+'.</p>')+'</section>'+
    action(c,'confirm',o.id,t('Подтвердить оплату','Төлөмдү ырастоо'),true,!enough || expired)+
    link(o.back,expired ? t('Пересчитать перевод','Которууну кайра эсептөө') : t('Вернуться к услуге','Кызматка кайтуу'),expired)+'</div>';
}

function delivery(o,c) {
  if (o.status === 'refunded') return c.t('Заказ отменён','Буйрутма жокко чыгарылды');
  if (o.kind === 'trip') return o.fulfillment === 'pending' ? c.t('Ожидаем выпуска билета','Билеттин берилишин күтүүдөбүз') : c.t('Демо-билет выписан','Демо билет берилди');
  if (o.kind === 'appointment') return o.fulfillment === 'pending' ? c.t('Ожидаем подтверждения времени','Убакыттын ырасталышын күтүүдөбүз') : c.t('Время приёма подтверждено','Кабыл алуу убактысы ырасталды');
  const text = {rent:['Аренда за период оплачена','Бул мезгилдин ижара акысы төлөндү'],patent:['Квитанция сохранена','Дүмүрчөк сакталды'],family:['Деньги зачислены получателю','Акча алуучуга түштү'],mobile:['Баланс телефона пополнен','Телефондун балансы толукталды'],transport:['Проездной добавлен','Жол билети кошулду']};
  return c.b(text[o.kind]||['Выполнено','Аткарылды']);
}

function status(o,c) {
  return o.status === 'refunded' ? c.t('Возвращено','Кайтарылды') : c.t('Оплачено','Төлөндү');
}

function cancellable(o) {
  return o && o.status === 'paid' && deferred(o.kind);
}

function copyOptions(o,c) {
  const {t} = c;
  const check = (key,label) => '<label class="check-row"><input type="checkbox" name="'+key+'" checked><span>'+label+'</span></label>';
  return '<details class="panel"><summary>'+t('Копия квитанции','Дүмүрчөктүн көчүрмөсү')+'</summary><div class="stack"><p class="sub">'+
    t('В копии будут статусы оплаты и услуги. Выберите дополнительные сведения.','Көчүрмөдө төлөмдүн жана кызматтын абалы көрсөтүлөт. Кошумча маалыматты тандаңыз.')+'</p><fieldset>'+
    check('amount',t('Сумма','Сумма'))+check('reference',t('Номер квитанции','Дүмүрчөктүн номери'))+check('date',t('Дата и время','Күнү жана убактысы'))+'</fieldset>'+
    action(c,'copy',o.id,t('Скопировать квитанцию','Дүмүрчөктү көчүрүү'))+
    '<div data-copy-fallback hidden><label class="field"><span>'+t('Текст для ручного копирования','Кол менен көчүрүү үчүн текст')+'</span><textarea readonly></textarea></label></div></div></details>';
}

async function copyReceipt(o,c,el) {
  const panel = el.closest('details'), {t} = c;
  const selected = key => panel.querySelector('input[name="'+key+'"]').checked;
  const lines = [t('Демо-квитанция · Migrant Wallet','Демо дүмүрчөк · Migrant Wallet')];
  if (selected('reference')) lines.push(o.id);
  if (selected('date')) lines.push(date(c,o.date));
  if (selected('amount')) lines.push(c.money(o.amount));
  lines.push(t('Платёж — ','Төлөм — ')+status(o,c),t('Услуга — ','Кызмат — ')+delivery(o,c));
  const plain = lines.join('\n'), fallback = panel.querySelector('[data-copy-fallback]');
  try {
    await navigator.clipboard.writeText(plain);
    fallback.hidden = true;
    message(c,'Квитанция скопирована','Дүмүрчөк көчүрүлдү');
  } catch {
    fallback.hidden = false;
    const field = fallback.querySelector('textarea');
    field.value = plain;
    field.focus();
    field.select();
    message(c,'Выделенный текст можно скопировать','Белгиленген текстти көчүрө аласыз');
  }
}

function receipt(c) {
  const {t,money} = c;
  const o = c.s.orders.find(x=>x.id === c.s.receiptId);
  if (!o) return empty(c,['Откройте квитанцию','Дүмүрчөктү ачыңыз'],['Квитанция появляется после оплаты. Уже совершённые операции доступны в истории.','Дүмүрчөк төлөмдөн кийин пайда болот. Бүткөн операцияларды тарыхтан көрө аласыз.'],'history',['Открыть историю','Тарыхты ачуу']);
  const refund = cancellable(o) ? (refundFor === o.id ?
    '<section class="panel stack"><h2 class="section-title">'+t('Отменить заказ?','Буйрутма жокко чыгарылсынбы?')+'</h2><p>'+t('На демо-карту вернётся ','Демо-картага кайтарылуучу сумма — ')+money(o.amount)+'.</p>'+
    action(c,'refund-confirm',o.id,t('Подтвердить отмену','Жокко чыгарууну ырастоо'),true)+action(c,'refund-close',o.id,t('Сохранить заказ','Буйрутманы калтыруу'))+'</section>':
    action(c,'refund-request',o.id,t('Отменить заказ и вернуть деньги','Буйрутманы жокко чыгарып, акчаны кайтаруу'))):'';
  return '<div class="stack"><section class="panel stack"><span class="pill">'+status(o,c)+'</span><strong class="amount">'+money(o.amount)+'</strong><p class="sub">'+date(c,o.date)+'</p></section>'+orderSummary(o,c)+
    '<section class="panel stack"><h2 class="section-title">'+t('Детали операции','Операциянын маалыматы')+'</h2><div class="list">'+
    row(t('Номер','Номер'),c.esc(o.id))+row(t('Карта','Карта'),c.b(sourceName))+
    row(t('Платёж','Төлөм'),status(o,c))+row(t('Услуга','Кызмат'),delivery(o,c))+
    (o.refundedAt?row(t('Возврат','Кайтарылган убакыт'),date(c,o.refundedAt)):'')+'</div></section>'+
    link(origins[o.kind]||'home',t('Перейти к услуге','Кызматка өтүү'),true)+refund+
    copyOptions(o,c)+action(c,'case',o.id,t('Вопрос по операции','Операция боюнча суроо'))+link('history',t('Все операции','Бардык операциялар'))+'</div>';
}

function history(c) {
  const {t,s} = c;
  if (!s.orders.length) return empty(c,['Операций пока нет','Азырынча операциялар жок'],['После первого платежа здесь появится его квитанция.','Биринчи төлөмдөн кийин анын дүмүрчөгү ушул жерде көрүнөт.'],'home',['Выбрать услугу','Кызматты тандоо']);
  return '<div class="panel stack">'+[...s.orders].sort((a,b)=>Date.parse(b.date)-Date.parse(a.date)).map(o=>
    '<button type="button" class="row" data-action="ledger-receipt" data-id="'+c.esc(o.id)+'"><span class="row-copy"><strong>'+c.esc(c.b(o.title))+'</strong><small class="sub">'+date(c,o.date)+' · '+status(o,c)+'</small></span><strong>'+c.money(o.amount)+'</strong></button>').join('')+'</div>';
}

export function renderLedger(route,c) {
  if (route === 'review') return review(c);
  if (route === 'receipt') return receipt(c);
  if (route === 'history') return history(c);
  return '';
}

function confirm(id,c) {
  const {s} = c, draft = s.draft;
  if (!draft || draft.id !== id) return;
  if (s.orders.some(order => order.id === id)) {
    s.draft = null;
    openReceipt(id,c);
    return;
  }
  if (!validDraft(draft)) return;
  if (expiredQuote(draft)) {
    message(c,'Срок курса истёк. Пересчитайте перевод.','Курстун мөөнөтү бүттү. Которууну кайра эсептеңиз.');
    c.render();
    return;
  }
  if (paidPeriod(draft.kind,s)) {
    s.draft = null;
    c.save();
    c.go(draft.back);
    message(c,'Этот период уже оплачен','Бул мезгил үчүн төлөнгөн');
    return;
  }
  const balance = cents(s.balance), amount = cents(draft.amount);
  if (balance === null || amount > balance) {
    message(c,'Недостаточно средств','Каражат жетишсиз');
    c.render();
    return;
  }
  const o = {...draft,status:'paid',fulfillment:deferred(draft.kind)?'pending':'done',date:new Date().toISOString()};
  s.balance = (balance - amount)/100;
  s.orders.unshift(o);
  if (o.kind === 'rent') s.housing.paid = true;
  if (o.kind === 'patent') s.patent.paid = true;
  if (o.kind === 'mobile') s.mobilePaid = true;
  s.draft = null;
  openReceipt(id,c);
}

export function ledgerAction(name,el,c) {
  if (!name.startsWith('ledger-')) return false;
  const id = el.dataset.id, {s} = c;
  if (name === 'ledger-confirm') { confirm(id,c); return true; }
  if (name === 'ledger-receipt') { openReceipt(id,c); return true; }
  const o = s.orders.find(x => x.id === id);
  if (!o || s.receiptId !== id) return true;
  switch (name) {
    case 'ledger-copy':
      void copyReceipt(o,c,el);
      break;
    case 'ledger-refund-request':
      if (cancellable(o)) { refundFor = id; c.render(); }
      break;
    case 'ledger-refund-close':
      refundFor = null;
      c.render();
      break;
    case 'ledger-refund-confirm': {
      if (!cancellable(o) || refundFor !== id) break;
      const balance = cents(s.balance), amount = cents(o.amount);
      if (balance === null || amount === null || !Number.isSafeInteger(balance + amount)) break;
      s.balance = (balance + amount)/100;
      Object.assign(o,{status:'refunded',fulfillment:'cancelled',refundedAt:new Date().toISOString()});
      refundFor = null;
      c.save();
      c.render();
      message(c,'Возврат зачислен на демо-карту','Кайтарылган акча демо-картага түштү');
      break;
    }
    case 'ledger-case':
      c.caseDraft({topic:['Вопрос по операции','Операция боюнча суроо'],source:'receipt',evidence:[
        ['Квитанция '+o.id,'Дүмүрчөк '+o.id],[...o.title],
        ['Сумма: '+o.amount.toLocaleString('ru-RU')+' ₽','Сумма: '+o.amount.toLocaleString('ky-KG')+' ₽']
      ]});
      break;
    default: return false;
  }
  return true;
}
