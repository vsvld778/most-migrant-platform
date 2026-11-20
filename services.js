const flights = {
  outbound: {
    name: ['Москва → Бишкек', 'Москва → Бишкек'],
    route: ['Москва, Шереметьево → Бишкек, Манас', 'Москва, Шереметьево → Бишкек, Манас'],
    price: 12800,
    time: '09:10 → 16:20'
  },
  inbound: {
    name: ['Бишкек → Москва', 'Бишкек → Москва'],
    route: ['Бишкек, Манас → Москва, Шереметьево', 'Бишкек, Манас → Москва, Шереметьево'],
    price: 13700,
    time: '10:30 → 12:05'
  }
};

const fares = {
  light: {name: ['Ручная кладь до 5 кг', 'Кол жүк 5 кг чейин'], price: 0},
  bag: {name: ['Ручная кладь и багаж до 20 кг', 'Кол жүк жана багаж 20 кг чейин'], price: 2200}
};

const transportOptions = {
  airport: {name: ['Поезд из аэропорта', 'Аэропорттон поезд'], detail: ['Аэропорт → город · одна поездка', 'Аэропорт → шаар · бир сапар'], amount: 650},
  pass500: {name: ['Пополнение проездного', 'Жол картасын толуктоо'], detail: ['Демо-карта • 2041', 'Демо карта • 2041'], amount: 500},
  pass1000: {name: ['Пополнение проездного', 'Жол картасын толуктоо'], detail: ['Демо-карта • 2041', 'Демо карта • 2041'], amount: 1000}
};

const providers = {
  translation: {
    name: ['Перевод документов', 'Документ которуу'], amount: 1200,
    place: ['Бюро переводов · кабинет 4', 'Котормо бюросу · 4-бөлмө'],
    prep: ['Возьмите документ для перевода.', 'Которула турган документти ала келиңиз.']
  },
  clinic: {
    name: ['Приём в клинике', 'Клиникадагы кабыл алуу'], amount: 1800,
    place: ['Клиника · регистратура', 'Клиника · каттоо бөлүмү'],
    prep: ['Список документов уточните у клиники перед визитом.', 'Керектүү документтерди клиникадан алдын ала тактаңыз.']
  },
  course: {
    name: ['Занятие русским языком', 'Орус тили сабагы'], amount: 700,
    place: ['Языковой центр · класс 2', 'Тил борбору · 2-класс'],
    prep: ['Возьмите тетрадь и ручку.', 'Дептер менен калем ала келиңиз.']
  }
};

const slots = ['10:00', '12:30', '15:00', '17:30'];

function localDate(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

function validDate(value, earliest) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < earliest) return false;
  const parsed = new Date(value + 'T12:00:00Z');
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function datePair(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return ['—', '—'];
  const date = new Date(value + 'T12:00:00Z');
  if (!Number.isFinite(date.getTime())) return ['—', '—'];
  return ['ru-RU', 'ky-KG'].map(locale => new Intl.DateTimeFormat(locale, {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
  }).format(date));
}

function option(key, title, c, selected) {
  return '<option value="' + c.esc(key) + '"' + (key === selected ? ' selected' : '') + '>' + c.esc(title) + '</option>';
}

function selectField(label, name, options, c) {
  return '<label class="field">' + c.esc(c.t(...label)) + '<select class="input" name="' + name + '" required>' + options + '</select></label>';
}

function dateField(c, value = localDate(3)) {
  return '<label class="field">' + c.t('Дата', 'Күн') + '<input class="input" type="date" name="serviceDate" min="' + localDate()
    + '" value="' + c.esc(value) + '" required></label>';
}

function action(c, key, label, id, primary = false) {
  return '<button type="button" class="btn ' + (primary ? 'primary' : 'secondary') + '" data-action="service-' + key + '"'
    + (id == null ? '' : ' data-id="' + c.esc(String(id)) + '"') + '>' + c.esc(c.t(...label)) + '</button>';
}

function submitButton(c, label) {
  return '<button class="btn primary" type="submit">' + c.esc(c.t(...label)) + '</button>';
}

function block(title, content, c) {
  return '<section class="panel stack"><h2 class="section-title">' + c.esc(c.t(...title)) + '</h2>' + content + '</section>';
}

function formSection(label, form, orders, c) {
  if (!orders.length) return block(label, form, c);
  return '<details class="panel"><summary class="section-title">' + c.esc(c.t(...label)) + '</summary><div class="stack">' + form + '</div></details>';
}

function values(c, pairs) {
  return '<dl class="summary">' + pairs.map(([label, value]) => '<div class="row"><dt>' + c.esc(c.t(...label))
    + '</dt><dd>' + c.esc(String(value)) + '</dd></div>').join('') + '</dl>';
}

function orderList(kind, c) {
  return (c.s.orders || []).filter(order => order.kind === kind);
}

function codeFor(id, prefix) {
  const suffix = String(id).replace(/[^a-z0-9]/gi, '').slice(-8).toUpperCase();
  return prefix + '-' + suffix;
}

function bookingSummary(c, id) {
  return action(c, 'receipt', ['Открыть операцию', 'Операцияны ачуу'], id);
}

function paidState(order, c) {
  if (order.status === 'refunded') return c.t('Оплата возвращена', 'Төлөм кайтарылды');
  if (order.status === 'paid') return c.t('Оплачено', 'Төлөндү');
  return c.t('Проверьте статус операции', 'Операциянын абалын текшериңиз');
}

function tripOrder(order, c) {
  const flight = flights[order.direction];
  const fare = fares[order.fare];
  if (!flight || !fare) return bookingSummary(c, order.id);
  const issued = order.status === 'paid' && order.fulfillment === 'done';
  const state = order.status === 'refunded' ? ['Заказ отменён', 'Буйрутма жокко чыгарылды']
    : issued ? ['Билет выписан', 'Билет берилди'] : ['Ожидаем билет', 'Билет күтүлүүдө'];
  const fields = [
    [['Маршрут', 'Багыт'], c.t(...flight.route)], [['Вылет', 'Учуу күнү'], c.t(...datePair(order.serviceDate))],
    [['Местное время', 'Жергиликтүү убакыт'], flight.time], [['Тариф', 'Тариф'], c.t(...fare.name)],
    [['Оплата', 'Төлөм'], paidState(order, c) + ' · ' + c.money(order.amount)]
  ];
  if (issued) fields.push([['Номер демо-билета', 'Демо билеттин номери'], order.booking]);
  const controls = order.status === 'paid' && order.fulfillment === 'pending'
    ? action(c, 'issue', ['Получить демо-билет', 'Демо билетти алуу'], order.id, true) : '';
  return block(state, values(c, fields) + '<div class="actions">' + controls + bookingSummary(c, order.id) + '</div>', c);
}

function tripPage(c) {
  const orders = orderList('trip', c);
  const directions = Object.entries(flights).map(([key, flight]) => option(key, c.t(...flight.name) + ' · ' + c.money(flight.price), c)).join('');
  const luggage = Object.entries(fares).map(([key, fare]) => option(key, c.t(...fare.name) + (fare.price ? ' · +' + c.money(fare.price) : ''), c)).join('');
  const form = '<form class="stack" data-form="service-trip">'
    + selectField(['Направление', 'Багыт'], 'direction', directions, c) + dateField(c)
    + selectField(['Багаж', 'Жүк'], 'fare', luggage, c)
    + '<p class="sub">' + c.t('Один взрослый пассажир. Расписание и цены демонстрационные.', 'Бир чоң киши үчүн. Жадыбал жана баалар үлгү катары берилген.') + '</p>'
    + submitButton(c, ['Проверить заказ', 'Буйрутманы текшерүү']) + '</form>';
  return '<div class="stack">' + orders.map(order => tripOrder(order, c)).join('') + formSection(['Найти билет', 'Билет издөө'], form, orders, c) + '</div>';
}

function transportPage(c) {
  const orders = orderList('transport', c);
  const options = Object.entries(transportOptions).map(([key, service]) => option(key, c.t(...service.name) + ' · ' + c.money(service.amount), c)).join('');
  const form = '<form class="stack" data-form="service-transport">' + selectField(['Выберите услугу', 'Кызматты тандаңыз'], 'product', options, c)
    + '<p class="sub">' + c.t('Демонстрационный маршрут и проездной в Москве.', 'Москвадагы демо багыт жана жол картасы.') + '</p>'
    + submitButton(c, ['Проверить сумму', 'Сумманы текшерүү']) + '</form>';
  const history = orders.map(order => {
    const product = transportOptions[order.product];
    if (!product) return bookingSummary(c, order.id);
    const rows = [[['Услуга', 'Кызмат'], c.t(...product.detail)], [['Сумма', 'Сумма'], c.money(order.amount)], [['Оплата', 'Төлөм'], paidState(order, c)]];
    if (order.status === 'paid') rows.push([['Подтверждение', 'Ырастоо'], codeFor(order.id, 'DEMO')]);
    return block(product.name, values(c, rows) + bookingSummary(c, order.id), c);
  }).join('');
  return '<div class="stack">' + history + formSection(['Городской транспорт', 'Шаардык транспорт'], form, orders, c) + '</div>';
}

function timeSelect(c, selected) {
  return selectField(['Время по Москве', 'Москва убактысы'], 'slot', slots.map(slot => option(slot, slot, c, selected)).join(''), c);
}

function calendarSlot(c, fields, skipId = null) {
  const date = fields.get('serviceDate');
  const slot = fields.get('slot');
  if (!validDate(date, localDate()) || !slots.includes(slot)) {
    c.toast(c.t('Выберите доступную дату и время.', 'Жеткиликтүү күндү жана убакытты тандаңыз.'));
    return null;
  }
  const when = Date.parse(date + 'T' + slot + ':00+03:00');
  if (when <= Date.now()) {
    c.toast(c.t('Это время уже прошло. Выберите другой приём.', 'Бул убакыт өтүп кетти. Башка убакытты тандаңыз.'));
    return null;
  }
  const clash = orderList('appointment', c).some(order => order.status === 'paid' && order.id !== skipId && order.serviceDate === date && order.slot === slot);
  if (clash) {
    c.toast(c.t('На это время уже есть запись.', 'Бул убакытка жазылуу бар.'));
    return null;
  }
  return {serviceDate: date, slot};
}

function appointmentDetail(date, slot, provider) {
  return datePair(date).map((formatted, i) => formatted + ' · ' + slot + ' · ' + provider.place[i]);
}

function appointmentOrder(order, c) {
  const provider = providers[order.provider];
  if (!provider) return bookingSummary(c, order.id);
  const active = order.status === 'paid';
  const confirmed = active && order.fulfillment === 'done';
  const state = !active ? ['Запись отменена', 'Жазылуу жокко чыгарылды'] : confirmed ? ['Приём подтверждён', 'Кабыл алуу ырасталды'] : ['Ожидаем подтверждения времени', 'Убакыттын ырасталышын күтүүдөбүз'];
  const rows = [[['Услуга', 'Кызмат'], c.t(...provider.name)], [['Дата и время', 'Күн жана убакыт'], c.t(...datePair(order.serviceDate)) + ' · ' + order.slot],
    [['Место', 'Жер'], c.t(...provider.place)], [['Оплата', 'Төлөм'], paidState(order, c) + ' · ' + c.money(order.amount)]];
  if (confirmed) rows.push([['Код записи', 'Жазылуунун коду'], order.booking]);
  const controls = active && order.fulfillment === 'pending' ? action(c, 'appointment-confirm', ['Подтвердить запись в демо', 'Демодо жазылууну ырастоо'], order.id, true) : '';
  const reschedule = confirmed ? '<details><summary>' + c.t('Перенести приём', 'Кабыл алууну жылдыруу') + '</summary><form class="stack" data-form="service-reschedule" data-id="' + c.esc(String(order.id)) + '">'
    + dateField(c, order.serviceDate >= localDate() ? order.serviceDate : localDate(1)) + timeSelect(c, order.slot) + submitButton(c, ['Запросить новое время', 'Жаңы убакытты суроо']) + '</form></details>' : '';
  const prep = confirmed ? '<p class="notice">' + c.esc(c.t(...provider.prep)) + '</p>' : '';
  return block(state, values(c, rows) + prep + reschedule + '<div class="actions">' + controls + bookingSummary(c, order.id) + '</div>', c);
}

function appointmentsPage(c) {
  const orders = orderList('appointment', c);
  const choices = Object.entries(providers).map(([key, provider]) => option(key, c.t(...provider.name) + ' · ' + c.money(provider.amount), c)).join('');
  const form = '<form class="stack" data-form="service-appointment">' + selectField(['Специалист', 'Адис'], 'provider', choices, c) + dateField(c, localDate(1))
    + timeSelect(c) + submitButton(c, ['Проверить запись', 'Жазылууну текшерүү']) + '</form>';
  return '<div class="stack">' + orders.map(order => appointmentOrder(order, c)).join('')
    + formSection(['Выбрать услугу', 'Кызматты тандоо'], form, orders, c)
    + block(['Помощь центра', 'Борбордун жардамы'], action(c, 'free-help', ['Бесплатное обращение', 'Акысыз кайрылуу'], null), c) + '</div>';
}

function aidPage(c) {
  const aid = c.s.aid;
  if (!aid) {
    return block(['Две ночи в общежитии', 'Жатаканада эки түн'],
      '<p>' + c.t('Запросите место для одного человека. После одобрения центра здесь появится талон для заселения.', 'Бир кишиге орун сураңыз. Борбор макулдук бергенде бул жерде жайгашуу талону пайда болот.') + '</p>'
      + '<form class="stack" data-form="service-aid">' + dateField(c, localDate(1)) + submitButton(c, ['Подать демо-заявку', 'Демо өтүнмө берүү']) + '</form>', c);
  }
  const applied = aid.status === 'requested';
  const redeemed = aid.status === 'redeemed';
  const title = applied ? ['Заявка на рассмотрении', 'Өтүнмө каралууда'] : redeemed ? ['Заселение подтверждено', 'Жайгашуу ырасталды'] : ['Талон на заселение', 'Жайгашуу талону'];
  const rows = [[['Заезд', 'Кирүү күнү'], c.t(...datePair(aid.serviceDate))], [['Продолжительность', 'Мөөнөт'], c.t('Две ночи', 'Эки түн')]];
  if (!applied) {
    rows.push([['Место', 'Жай'], c.t('Демо-общежитие «Мост»', '«Мост» демо жатаканасы')], [['Адрес в прототипе', 'Прототиптеги дарек'], c.t('Учебный квартал, дом 4', 'Окуу кварталы, 4-үй')]);
    if (!redeemed) rows.push([['Код заселения', 'Жайгашуу коду'], aid.code]);
  }
  const control = applied ? action(c, 'aid-approve', ['Смоделировать одобрение центра', 'Борбордун макулдугун демодо көрсөтүү'], aid.id, true)
    : redeemed ? '' : action(c, 'aid-redeem', ['Проверить погашение талона', 'Талонду колдонууну демодо текшерүү'], aid.id, true);
  const description = applied
    ? c.t('Ответ центра можно воспроизвести в этом демо.', 'Бул демодо борбордун жообун көрсөтсө болот.')
    : redeemed ? c.t('Талон использован на две ночи. Денежный баланс кошелька сохранён.', 'Талон эки түнгө колдонулду. Капчыктагы акча калдыгы сакталды.')
      : c.t('Покажите этот код администратору при заселении. Один талон покрывает обе ночи.', 'Жайгашканда бул кодду администраторго көрсөтүңүз. Бир талон эки түнгө жетет.');
  return block(title, values(c, rows) + '<p class="notice">' + description + '</p>' + control, c);
}

export function renderServices(route, c) {
  const renderer = {trip: tripPage, transport: transportPage, appointments: appointmentsPage, aid: aidPage}[route];
  return typeof renderer === 'function' ? renderer(c) : null;
}

function findOrder(c, id) {
  return (c.s.orders || []).find(order => String(order.id) === String(id));
}

function saveChanges(c, message) {
  c.save();
  c.render();
  if (message) c.toast(c.t(...message));
}

export function serviceAction(actionName, el, c) {
  if (actionName === 'service-receipt') {
    const order = findOrder(c, el.dataset.id);
    if (order) c.receipt(order.id);
    return true;
  }
  if (actionName === 'service-free-help') {
    c.caseDraft({topic: ['Вопрос по записи к специалисту', 'Адиске жазылуу боюнча суроо'], source: 'appointments', evidence: []});
    return true;
  }
  if (actionName === 'service-issue' || actionName === 'service-appointment-confirm') {
    const order = findOrder(c, el.dataset.id);
    const flight = actionName === 'service-issue';
    if (!order || order.kind !== (flight ? 'trip' : 'appointment') || order.status !== 'paid' || order.fulfillment !== 'pending') return true;
    order.booking = codeFor(order.id, flight ? 'DEMO-TKT' : 'DEMO-VIS');
    order.fulfillment = 'done';
    saveChanges(c, flight ? ['Демо-билет выписан', 'Демо билет берилди'] : ['Время приёма подтверждено', 'Кабыл алуу убактысы ырасталды']);
    return true;
  }
  if (actionName === 'service-aid-approve' || actionName === 'service-aid-redeem') {
    const aid = c.s.aid;
    if (!aid || aid.id !== el.dataset.id) return true;
    if (actionName === 'service-aid-approve' && aid.status === 'requested') {
      aid.status = 'approved';
      aid.code = codeFor(aid.id, 'DEMO');
      saveChanges(c, ['Демо-талон выдан', 'Демо талон берилди']);
    } else if (actionName === 'service-aid-redeem' && aid.status === 'approved') {
      aid.status = 'redeemed';
      saveChanges(c, ['Талон использован', 'Талон колдонулду']);
    }
    return true;
  }
  return false;
}

export function serviceSubmit(actionName, form, c) {
  if (!['service-trip', 'service-transport', 'service-appointment', 'service-reschedule', 'service-aid'].includes(actionName)) return false;
  const fields = new FormData(form);
  const date = fields.get('serviceDate');
  if (actionName === 'service-trip') {
    const direction = fields.get('direction'), fare = fields.get('fare');
    if (!Object.hasOwn(flights, direction) || !Object.hasOwn(fares, fare) || !validDate(date, localDate())) {
      c.toast(c.t('Проверьте направление, дату и тариф.', 'Багытты, күндү жана тарифти текшериңиз.'));
      return true;
    }
    const flight = flights[direction], baggage = fares[fare];
    const dateLabels = datePair(date);
    c.order({kind: 'trip', back: 'trip', title: ['Авиабилет · ' + flight.name[0], 'Авиабилет · ' + flight.name[1]],
      detail: baggage.name.map((name, i) => dateLabels[i] + ' · ' + name), direction, fare, serviceDate: date, amount: flight.price + baggage.price});
  } else if (actionName === 'service-transport') {
    const key = fields.get('product');
    if (!Object.hasOwn(transportOptions, key)) return true;
    const product = transportOptions[key];
    c.order({kind: 'transport', back: 'transport', product: key, title: [...product.name], detail: [...product.detail], amount: product.amount});
  } else if (actionName === 'service-appointment') {
    const key = fields.get('provider');
    if (!Object.hasOwn(providers, key)) return true;
    const booking = calendarSlot(c, fields);
    if (!booking) return true;
    const provider = providers[key];
    c.order({kind: 'appointment', back: 'appointments', provider: key, ...booking, title: [...provider.name], detail: appointmentDetail(booking.serviceDate, booking.slot, provider), amount: provider.amount});
  } else if (actionName === 'service-reschedule') {
    const order = findOrder(c, form.dataset.id);
    if (!order || order.kind !== 'appointment' || order.status !== 'paid' || order.fulfillment !== 'done') return true;
    const booking = calendarSlot(c, fields, order.id);
    if (!booking) return true;
    if (booking.serviceDate === order.serviceDate && booking.slot === order.slot) {
      c.toast(c.t('Выберите другой день или время.', 'Башка күндү же убакытты тандаңыз.'));
      return true;
    }
    Object.assign(order, booking, {fulfillment: 'pending', booking: '', detail: appointmentDetail(booking.serviceDate, booking.slot, providers[order.provider])});
    saveChanges(c, ['Новое время отправлено на подтверждение', 'Жаңы убакыт ырастоого жөнөтүлдү']);
  } else if (actionName === 'service-aid' && !c.s.aid) {
    if (!validDate(date, localDate())) { c.toast(c.t('Проверьте дату заезда.', 'Кирүү күнүн текшериңиз.')); return true; }
    c.s.aid = {id: crypto.randomUUID(), status: 'requested', serviceDate: date};
    saveChanges(c, ['Демо-заявка создана', 'Демо өтүнмө түзүлдү']);
  }
  return true;
}
