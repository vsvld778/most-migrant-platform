const accountRef = 'DEMO-MOST-RUB-0421';
const familyRate = 0.90;
const familyFee = 100;
const mobileDefault = 500;
const patentDemoAmount = 6000;

const familyProfiles = {
  mom: ['Мама · Бишкек', 'Апам · Бишкек'],
  brother: ['Брат · Ош', 'Агам · Ош'],
};

function metric(label, value, detail = '') {
  return `<section class="panel stack"><span class="sub">${label}</span><strong class="amount">${value}</strong>${detail ? `<p class="sub">${detail}</p>` : ''}</section>`;
}

function row(label, value) {
  return `<div class="row"><span class="row-copy">${label}</span><strong>${value}</strong></div>`;
}

function numberField(name, label, value, min = 0, max = 1000000) {
  return `<label class="field"><span>${label}</span><input class="input" name="${name}" type="number" inputmode="numeric" step="1" min="${min}" max="${max}" value="${value}" required></label>`;
}

function rubles(input, min = 0, max = 1000000) {
  if (typeof input !== 'string' || !input.trim()) return null;
  const n = Number(input);
  return Number.isSafeInteger(n) && n >= min && n <= max ? n : null;
}

function action(name, title, primary = false) {
  return `<button type="button" class="btn ${primary ? 'primary' : 'secondary'}" data-action="${name}">${title}</button>`;
}

function submit(title, primary = true) {
  return `<button type="submit" class="btn ${primary ? 'primary' : 'secondary'}">${title}</button>`;
}

function routeLink(route, title) {
  return `<a class="btn secondary" href="#${route}">${title}</a>`;
}

function salaryView(c) {
  const { t, money } = c;
  const { expected, received, advance } = c.s.salary;
  const difference = expected - received - advance;
  const shifts = c.s.salary.shifts ?? 17;
  const rate = c.s.salary.rate ?? 4000;
  const creditChoices = [
    [60000, t('60 000 ₽ · зарплата на карту', '60 000 ₽ · картага түшкөн айлык')],
    [0, t('Поступление ещё не выбрано', 'Түшкөн акча тандала элек')],
  ];
  return `<div class="stack">
    ${metric(t('К сверке за месяц', 'Ушул айда салыштырыла турган сумма'), money(Math.abs(difference)), difference === 0
      ? t('Выплата и аванс совпали с расчётом.', 'Төлөм менен аванс эсепке туура келди.')
      : difference > 0
        ? t('Меньше ожидаемой суммы с учётом аванса.', 'Авансты кошкондо да күтүлгөн суммадан аз.')
        : t('Получено сверх ожидаемой суммы.', 'Күтүлгөн суммадан көбүрөөк алынды.'))}
    <section class="panel stack"><h2 class="section-title">${t('Расчёт выплаты', 'Айлыкты эсептөө')}</h2>
      <div class="list">${row(t('Ожидаю на руки', 'Колго тийчү сумма'), money(expected))}
      ${row(t('Выбранное зачисление', 'Тандалган түшүм'), money(received))}
      ${row(t('Ранее полученный аванс', 'Мурда алынган аванс'), money(advance))}</div>
      <details><summary>${t('Сверить смены и поступление', 'Сменалар менен түшүмдү салыштыруу')}</summary>
        <form class="stack" data-form="money-salary">
          ${numberField('expected', t('Ожидаемая сумма на руки, ₽', 'Колго тийчү сумма, ₽'), expected)}
          <label class="field"><span>${t('Поступление за этот месяц', 'Ушул айда түшкөн акча')}</span><select class="input" name="credit">${creditChoices.map(([sum,label])=>`<option value="${sum}"${received===sum?' selected':''}>${label}</option>`).join('')}</select></label>
          ${numberField('advance', t('Аванс, в том числе наличными, ₽', 'Аванс, анын ичинде накталай, ₽'), advance)}
          ${submit(t('Сохранить сверку', 'Салыштырууну сактоо'))}
        </form>
        <form class="stack" data-form="money-shifts"><h3 class="section-title">${t('Расчёт по сменам с одинаковой ставкой', 'Бирдей чендеги сменалар боюнча эсеп')}</h3>
          ${numberField('shifts', t('Число смен', 'Сменалардын саны'), shifts, 1, 62)}
          ${numberField('rate', t('За смену на руки, ₽', 'Бир сменага колго тийчү сумма, ₽'), rate, 1)}
          ${submit(t('Применить к расчёту выплаты', 'Айлыктын эсебине колдонуу'), false)}
        </form>
      </details>
    </section>
    ${difference > 0 ? action('money-salary-case', t('Обсудить разницу с центром', 'Айырманы борбор менен талкуулоо'), true) : ''}
    ${routeLink('salary-card', t('Карта и реквизиты для работодателя', 'Карта жана иш берүүчүгө берилчү реквизиттер'))}
  </div>`;
}

function cardView(c) {
  const { t } = c;
  return `<div class="stack"><section class="panel stack" aria-label="${t('Демонстрационная карта', 'Демо карта')}">
    <div class="split"><strong>Migrant Wallet</strong><strong>МИР</strong></div>
    <strong class="amount">•••• 0421</strong>
    <p class="sub">${t('Рублёвый счёт для зарплаты · демо', 'Айлык үчүн рубль эсеби · демо')}</p>
    </section><section class="panel stack"><h2 class="section-title">${t('Реквизиты для работодателя', 'Иш берүүчүгө реквизиттер')}</h2>
      <div class="list">${row(t('Счёт', 'Эсеп'), accountRef)}${row(t('Валюта', 'Валюта'), 'RUB')}</div>
      <p class="sub">${t('Это условные реквизиты для проверки сценария передачи в бухгалтерию.', 'Бул бухгалтерияга реквизиттерди берүү жолун текшерүү үчүн шарттуу маалымат.')}</p>
      ${action('money-copy-card', t('Скопировать демореквизиты', 'Демо реквизиттерди көчүрүү'), true)}
    </section>${routeLink('salary', t('Перейти к сверке зарплаты', 'Айлыкты салыштырууга өтүү'))}</div>`;
}

function housingView(c) {
  const { t, money } = c;
  const h = c.s.housing;
  const remaining = Math.max(0, h.deposit - h.returned);
  return `<div class="stack">
    ${metric(t('Аренда за месяц', 'Айлык ижара акысы'), money(h.rent), h.paid
      ? t('Оплачено в демо. Квитанция доступна в истории.', 'Демодо төлөндү. Дүмүрчөк тарыхта сакталды.')
      : t('Комната в Москве · до 25 ноября', 'Москвадагы бөлмө · 25-ноябрга чейин'))}
    <section class="panel stack"><h2 class="section-title">${t('Платёж по договору', 'Келишим боюнча төлөм')}</h2>
      <div class="list">${row(t('Получатель по договору', 'Келишимдеги алуучу'), t('Ольга К. · демо', 'Ольга К. · демо'))}
      ${row(t('Период', 'Мезгил'), t('Ноябрь', 'Ноябрь'))}</div>
      ${h.paid ? routeLink('history', t('Посмотреть операции', 'Операцияларды көрүү')) : action('money-pay-rent', t('Проверить платёж за жильё', 'Ижара төлөмүн текшерүү'), true)}
    </section>
    <section class="panel stack"><h2 class="section-title">${t('Возврат залога', 'Күрөөнүн кайтарылышы')}</h2>
      <div class="list">${row(t('Внесено при заселении', 'Киргенде төлөнгөн'), money(h.deposit))}
      ${row(t('Уже вернули', 'Кайтарылды'), money(h.returned))}
      ${row(t('Осталось вернуть', 'Кайтарылышы керек'), money(remaining))}</div>
      ${remaining ? `<form class="stack" data-form="money-deposit">
        ${numberField('amount', t('Отметить полученную сумму, ₽', 'Алынган сумманы белгилөө, ₽'), Math.min(5000,remaining), 1, remaining)}
        <p class="sub">${t('Отметьте деньги, полученные вне кошелька. Запись сохранится в деле о жилье.', 'Капчыктан тышкары алынган акчаны белгилеңиз. Маалымат турак жай ишинде сакталат.')}</p>
        ${submit(t('Записать возврат', 'Кайтарылган акчаны жазуу'), false)}</form>` : ''}
    </section>${remaining ? action('money-housing-case', t('Обсудить залог с центром', 'Күрөөнү борбор менен талкуулоо')) : ''}
  </div>`;
}

function familyView(c) {
  const { t, money } = c;
  const last = c.s.familyLast ?? c.s.orders.find(order => order.kind === 'family') ?? {};
  const amount = rubles(String(last.principal ?? 10000),1) ?? 10000;
  return `<div class="stack">
    <section class="panel stack"><h2 class="section-title">${t('Перевод в Кыргызстан', 'Кыргызстанга которуу')}</h2>
      <form class="stack" data-form="money-family">
        <label class="field"><span>${t('Сохранённый получатель', 'Сакталган алуучу')}</span><select class="input" name="person">${Object.entries(familyProfiles).map(([value,name])=>`<option value="${value}"${last.person===value?' selected':''}>${t(...name)}</option>`).join('')}</select></label>
        ${numberField('amount', t('Отправить, ₽', 'Жөнөтүлүүчү сумма, ₽'), amount, 1)}
        <div class="list">${row(t('Способ получения', 'Алуу ыкмасы'), t('На счёт в сомах', 'Сом эсебине'))}
        ${row(t('Демо-курс', 'Демо курс'), '1 RUB = 0,90 KGS')}
        ${row(t('Комиссия сверху', 'Үстөк комиссия'), money(familyFee))}</div>
        ${submit(t('Рассчитать перевод', 'Которууну эсептөө'))}
      </form></section>
      <p class="notice">${t('Перед подтверждением вы увидите сумму списания и сколько сомов получит семья.', 'Ырастоодон мурун эсептен канча алынарын жана үй-бүлө канча сом аларын көрөсүз.')}</p>
    </div>`;
}

function documentsView(c) {
  const { t, money } = c;
  const p = c.s.patent;
  if (!p.enabled) return `<div class="stack"><section class="panel stack"><h2 class="section-title">${t('Платёж по патенту', 'Патент боюнча төлөм')}</h2>
    <p>${t('Добавьте эту задачу в свой план, если работаете по трудовому патенту в России.', 'Россияда эмгек патенти менен иштесеңиз, бул тапшырманы планыңызга кошуңуз.')}</p>
    ${action('money-enable-patent', t('Я работаю по патенту', 'Мен патент менен иштейм'), true)}</section>
    ${routeLink('month', t('К плану расходов', 'Чыгымдар планына'))}</div>`;
  return `<div class="stack">
    ${metric(t('Авансовый платёж по патенту', 'Патент боюнча аванстык төлөм'), money(patentDemoAmount), t('Пример суммы для демонстрации', 'Демо үчүн сумманын мисалы'))}
    <section class="panel stack"><h2 class="section-title">${t('Документ и сроки', 'Документ жана мөөнөттөр')}</h2>
      <div class="list">${row(t('Регион примера', 'Мисалдагы аймак'), t('Москва', 'Москва'))}
      ${row(t('Пример периода', 'Мисалдагы мезгил'), t('Декабрь', 'Декабрь'))}
      ${row(t('Платёж', 'Төлөм'), p.paid?t('Квитанция сохранена', 'Дүмүрчөк сакталды'):t('Запланирован', 'Пландаштырылды'))}
      ${row(t('Статус патента', 'Патенттин абалы'), t('Требует отдельной проверки', 'Өзүнчө текшерүү керек'))}</div>
      <p class="sub">${t('Для реальной оплаты сверяют сумму, период и реквизиты по платёжному документу.', 'Чыныгы төлөм үчүн сумманы, мезгилди жана реквизиттерди төлөм документинен текшерүү керек.')}</p>
      ${p.paid?routeLink('history', t('Открыть квитанции', 'Дүмүрчөктөрдү ачуу')):action('money-pay-patent', t('Проверить демоплатёж', 'Демо төлөмдү текшерүү'), true)}
      ${action('money-disable-patent', t('Убрать задачу из моего плана', 'Тапшырманы планымдан алып салуу'))}
    </section></div>`;
}

function mobileView(c) {
  const { t } = c;
  return `<div class="stack"><section class="panel stack"><h2 class="section-title">${t('Пополнить связь', 'Байланыш акысын толуктоо')}</h2>
    <form class="stack" data-form="money-mobile">
      <label class="field"><span>${t('Номер телефона', 'Телефон номери')}</span><select class="input" name="line">
        <option value="me">${t('Мой номер · •• 18', 'Менин номерим · •• 18')}</option>
        <option value="family">${t('Семейный номер · •• 43', 'Үй-бүлөнүн номери · •• 43')}</option>
      </select></label>
      ${numberField('amount',t('Сумма, ₽','Сумма, ₽'), mobileDefault,1,15000)}
      ${submit(t('Проверить пополнение', 'Толуктоону текшерүү'))}
    </form></section>${c.s.mobilePaid?routeLink('history', t('Ранее оплаченные пополнения', 'Мурун төлөнгөн толуктоолор')):''}</div>`;
}

const views = {
  salary:salaryView, 'salary-card':cardView, housing:housingView,
  family:familyView, documents:documentsView, mobile:mobileView,
};

export function renderMoney(route, c) {
  return Object.hasOwn(views, route) ? views[route](c) : null;
}

function saveChange(c, ru, ky) {
  c.save();
  c.render();
  c.toast(c.t(ru,ky));
}

function selectedEvidence(c, type) {
  const m = c.money;
  if (type === 'salary') {
    const { expected, received, advance } = c.s.salary;
    const evidence = [
      [`Ожидаемая выплата · ${m(expected)}`, `Күтүлгөн айлык · ${m(expected)}`],
      [`Учтённый аванс · ${m(advance)}`, `Эске алынган аванс · ${m(advance)}`],
    ];
    if (received>0) evidence.push([`Выбранное зачисление · ${m(received)}`,`Тандалган түшүм · ${m(received)}`]);
    return {source:'salary',topic:['Расхождение по зарплате','Айлыктын эсебиндеги айырма'],evidence};
  }
  const h = c.s.housing;
  const evidence = [
    [`Залог по договору · ${m(h.deposit)}`, `Келишимдеги күрөө · ${m(h.deposit)}`],
    [`Возвращено · ${m(h.returned)}`, `Кайтарылды · ${m(h.returned)}`],
  ];
  if (h.paid) evidence.push([`Оплата жилья · ${m(h.rent)}`, `Турак жай үчүн төлөм · ${m(h.rent)}`]);
  return {source:'housing',topic:['Возврат залога','Күрөөнү кайтаруу'],evidence};
}

export function moneyAction(actionName, el, c) {
  const { s,t } = c;
  switch(actionName) {
    case 'money-salary-case':
      c.caseDraft(selectedEvidence(c,'salary'));
      return true;
    case 'money-housing-case':
      c.caseDraft(selectedEvidence(c,'housing'));
      return true;
    case 'money-copy-card': {
      const text = t('Демореквизиты','Демо реквизиттер') + ' · ' + accountRef + ' · RUB';
      const fallback = () => c.toast(text);
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).then(()=>c.toast(t('Демореквизиты скопированы','Демо реквизиттер көчүрүлдү'))).catch(fallback);
      } else fallback();
      return true;
    }
    case 'money-pay-rent':
      if (!s.housing.paid) c.order({kind:'rent',title:['Аренда жилья','Турак жай ижарасы'],detail:['Ольга К. · ноябрь','Ольга К. · ноябрь'],amount:s.housing.rent,back:'housing'});
      return true;
    case 'money-enable-patent':
    case 'money-disable-patent':
      s.patent.enabled = actionName==='money-enable-patent';
      saveChange(c,'План обновлён','План жаңыртылды');
      return true;
    case 'money-pay-patent':
      if (s.patent.enabled && !s.patent.paid) c.order({kind:'patent',title:['Платёж по патенту','Патент боюнча төлөм'],detail:['Демо · декабрь · Москва','Демо · декабрь · Москва'],amount:patentDemoAmount,back:'documents'});
      return true;
    default:
      return false;
  }
}

export function moneySubmit(actionName, form, c) {
  if (!['money-salary','money-shifts','money-deposit','money-family','money-mobile'].includes(actionName)) return false;
  const { s,t } = c;
  const fields = new FormData(form);
  const invalid = () => c.toast(t('Проверьте сумму и выбранные данные.','Сумманы жана тандалган маалыматты текшериңиз.'));
  switch(actionName) {
    case 'money-salary': {
      const expected=rubles(fields.get('expected')), advance=rubles(fields.get('advance')), received=rubles(fields.get('credit'));
      if (expected===null || advance===null || ![60000,0].includes(received)) invalid();
      else {
        Object.assign(s.salary,{expected,advance,received});
        saveChange(c,'Сверка сохранена','Салыштыруу сакталды');
      }
      break;
    }
    case 'money-shifts': {
      const shifts=rubles(fields.get('shifts'),1,62), rate=rubles(fields.get('rate'),1);
      if (shifts===null || rate===null || shifts*rate>1000000) invalid();
      else {
        Object.assign(s.salary,{shifts,rate,expected:shifts*rate});
        saveChange(c,'Смена и ставка учтены в расчёте','Сменалар жана чен эсепке алынды');
      }
      break;
    }
    case 'money-deposit': {
      const amount=rubles(fields.get('amount'),1,s.housing.deposit-s.housing.returned);
      if (amount===null) invalid();
      else {
        s.housing.returned += amount;
        saveChange(c,'Возврат записан в деле о жилье','Кайтарылган сумма турак жай ишине жазылды');
      }
      break;
    }
    case 'money-family': {
      const person=fields.get('person'), principal=rubles(fields.get('amount'),1);
      if (principal===null || !Object.hasOwn(familyProfiles,person)) invalid();
      else {
        const recipient = familyProfiles[person];
        const proceeds = (principal*familyRate).toLocaleString('ru-RU',{maximumFractionDigits:2});
        c.order({
          kind:'family',title:['Перевод семье','Үй-бүлөгө которуу'],
          detail:[`${recipient[0]} · ${c.money(principal)} + ${c.money(familyFee)} комиссии · 1 RUB = 0,90 KGS · к получению ${proceeds} KGS`,`${recipient[1]} · ${c.money(principal)} + ${c.money(familyFee)} комиссия · 1 RUB = 0,90 KGS · алынуучу сумма ${proceeds} KGS`],
          amount:principal+familyFee, principal, fee:familyFee, rate:familyRate, receivedCurrency:'KGS', received:Math.round(principal*90)/100, person, back:'family',
        });
      }
      break;
    }
    case 'money-mobile': {
      const line=fields.get('line'), amount=rubles(fields.get('amount'),1,15000);
      if (amount===null || !['me','family'].includes(line)) invalid();
      else c.order({kind:'mobile',title:['Мобильная связь','Мобилдик байланыш'],detail:line==='me'?['Мой номер · •• 18','Менин номерим · •• 18']:['Семейный номер · •• 43','Үй-бүлөнүн номери · •• 43'],amount,line,back:'mobile'});
      break;
    }
  }
  return true;
}
