const mobileBudget = 500;
const dailyBudget = 6500;
const patentBudget = 6000;

function paidTotal(orders, test) {
  return orders.reduce((total, order) => order.status === 'paid' && test(order) ? total + order.amount : total, 0);
}

function monthlyBudget(s) {
  const orders = s.orders || [];
  const rent = s.housing.paid ? 0 : s.housing.rent;
  const ownMobile = paidTotal(orders, order => order.kind === 'mobile' && order.line !== 'family');
  const mobile = Math.max(0, mobileBudget - ownMobile);
  const daily = Math.max(0, dailyBudget - paidTotal(orders, order => order.kind === 'transport'));
  const patent = s.patent.enabled && !s.patent.paid ? patentBudget : 0;
  const remaining = rent + mobile + daily + patent;
  return {rent, mobile, daily, patent, remaining, free: Math.max(0, s.balance - remaining)};
}

function linkRow(c, route, icon, title, detail, amount = '', gold = false) {
  return '<a class="row" href="#' + route + '"><span class="glyph' + (gold ? ' gold' : '') + '">' + c.icon(icon) + '</span>'
    + '<span class="row-copy"><strong>' + c.esc(title) + '</strong><small>' + c.esc(detail) + '</small></span>'
    + (amount ? '<strong>' + c.esc(amount) + '</strong>' : '') + '</a>';
}

function quick(c, items) {
  return '<nav class="quick" aria-label="' + c.t('Быстрые действия', 'Тез аракеттер') + '">' + items.map(([route, icon, ru, ky]) =>
    '<a href="#' + route + '"><span class="quick-icon">' + c.icon(icon) + '</span><span>' + c.esc(c.t(ru, ky)) + '</span></a>').join('') + '</nav>';
}

function hero(c, label, amount, foot, right, href, icon) {
  return '<section class="hero"><span class="hero-art" aria-hidden="true"></span><div class="hero-top"><span class="hero-label">' + c.esc(label)
    + '</span>' + c.icon(icon) + '</div><strong class="hero-value">' + c.money(amount) + '</strong><div class="hero-foot"><span>'
    + c.esc(foot) + '</span><a href="#' + href + '">' + c.esc(right) + '</a></div></section>';
}

function section(c, title, rows, end = '') {
  return '<section class="panel"><div class="section-head"><h2>' + c.esc(title) + '</h2>' + end + '</div><div class="list">' + rows + '</div></section>';
}

function metric(c, title, value, detail) {
  return '<a class="metric" href="#salary"><span>' + c.esc(title) + '</span><strong>' + c.money(value)
    + '</strong><small>' + c.esc(detail) + '</small></a>';
}

function expenses(c, budget) {
  const {t, money, s} = c;
  const rent = linkRow(c, 'housing', 'home', t('Аренда жилья', 'Турак жай ижарасы'),
    s.housing.paid ? t('Платёж за ноябрь проведён', 'Ноябрь үчүн төлөндү') : t('Платёж за ноябрь', 'Ноябрь айы үчүн төлөм'),
    money(budget.rent), true);
  const mobile = linkRow(c, 'mobile', 'phone', t('Мобильная связь', 'Мобилдик байланыш'),
    budget.mobile ? t('Осталось в плане', 'Пландагы калдык') : t('План пополнения выполнен', 'Толуктоо планы аткарылды'), money(budget.mobile));
  const daily = linkRow(c, 'transport', 'bus', t('Транспорт и другие расходы', 'Унаа жана башка чыгымдар'),
    t('Остаток месячного бюджета', 'Айлык бюджеттин калдыгы'), money(budget.daily));
  const patent = s.patent.enabled ? linkRow(c, 'documents', 'file', t('Патент', 'Патент'),
    s.patent.paid ? t('Квитанция сохранена', 'Дүмүрчөк сакталды') : t('Демо-платёж по документу', 'Документ боюнча демо төлөм'), money(budget.patent)) : '';
  return section(c, t('Расходы по плану', 'Пландалган чыгымдар'), rent + mobile + daily + patent,
    '<span class="sub">' + money(budget.remaining) + '</span>');
}

function month(c) {
  const {s, t, money} = c;
  const plan = monthlyBudget(s);
  const salary = s.salary;
  const received = salary.received + salary.advance;
  const difference = salary.expected - received;
  const salaryCase = (s.cases || []).find(rec => rec.source === 'salary' && rec.events?.at(-1)?.stage < 3);
  const caseRow = salaryCase ? linkRow(c, 'cases', 'help', t('Обращение по зарплате', 'Айлык боюнча кайрылуу'),
    t('Посмотреть ответ и следующий шаг', 'Жоопту жана кийинки кадамды көрүү')) : '';
  const verify = difference !== 0 ? linkRow(c, 'salary', 'briefcase', t('Сверить зарплату', 'Айлыкты салыштыруу'),
    difference > 0 ? t('До ожидаемой выплаты', 'Күтүлгөн төлөмгө жетпеген сумма') : t('Сверх ожидаемой выплаты', 'Күтүлгөн төлөмдөн ашкан сумма'),
    money(Math.abs(difference)), true) : '';
  const income = '<div class="section-head"><h2>' + t('Доход за месяц', 'Айлык киреше') + '</h2><a href="#salary">' + t('К расчёту', 'Эсепти ачуу') + '</a></div>'
    + '<div class="month-metrics">' + metric(c, t('Ожидаю на руки', 'Колго тийчү сумма'), salary.expected, t('По условиям работы', 'Иштин шарттары боюнча'))
    + metric(c, t('Получено', 'Алынды'), received, t('Включая аванс ', 'Анын ичинде аванс ') + money(salary.advance)) + '</div>';
  return hero(c, t('Бюджет на перевод семье', 'Үй-бүлөгө которууга бөлүнгөн акча'), plan.free,
    t('Включая комиссию', 'Комиссияны кошкондо'), t('Баланс ', 'Калдык ') + money(s.balance), 'wallet', 'wallet')
    + quick(c, [['family','send','Перевести','Которуу'],['housing','home','Жильё','Турак жай'],['trip','plane','В дорогу','Сапар'],['cases','help','Помощь','Жардам']])
    + income + '<div class="stack">' + (verify || caseRow ? section(c, t('Требует внимания', 'Көңүл буруңуз'), verify + caseRow) : '')
    + expenses(c, plan) + '</div>';
}

function wallet(c) {
  const {s, t} = c;
  const plan = monthlyBudget(s);
  const accounts = linkRow(c, 'salary-card', 'card', t('Моя карта «Мир»', 'Менин «Мир» картам'), t('Реквизиты для зарплаты · •• 0421', 'Айлык үчүн реквизиттер · •• 0421'))
    + linkRow(c, 'salary', 'briefcase', t('Работа и выплаты', 'Иш жана төлөмдөр'), t('Сверить зарплату со сменами', 'Айлыкты сменалар менен салыштыруу'))
    + linkRow(c, 'history', 'clock', t('История операций', 'Операциялар тарыхы'), t('Квитанции, статусы и возвраты', 'Дүмүрчөктөр, абал жана кайтарымдар'));
  const payments = linkRow(c, 'mobile', 'phone', t('Мобильная связь', 'Мобилдик байланыш'), t('Пополнить свой или семейный номер', 'Өзүңүздүн же үй-бүлөңүздүн номерин толуктоо'))
    + linkRow(c, 'documents', 'file', t('Документы и сроки', 'Документтер жана мөөнөттөр'), t('Патент и подтверждения оплаты', 'Патент жана төлөм ырастоолору'))
    + linkRow(c, 'transport', 'bus', t('Городской транспорт', 'Шаардык транспорт'), t('Билет из аэропорта или проездной', 'Аэропорттон билет же жол картасы'));
  return hero(c, t('Демо-баланс', 'Демо калдык'), s.balance, t('Карта «Мир» · •• 0421', '«Мир» картасы · •• 0421'), t('Реквизиты', 'Реквизиттер'), 'salary-card', 'card')
    + quick(c, [['family','send','Перевести','Которуу'],['housing','home','Аренда','Ижара'],['mobile','phone','Связь','Байланыш'],['history','clock','История','Тарых']])
    + '<div class="stack">' + section(c, t('Счёт и операции', 'Эсеп жана операциялар'), accounts)
    + section(c, t('Платежи', 'Төлөмдөр'), payments)
    + section(c, t('Мой месяц', 'Менин айым'), linkRow(c, 'month', 'calendar', t('Осталось по плану', 'План боюнча калды'), t('Предстоящие расходы', 'Алдыдагы чыгымдар'), c.money(plan.remaining), true)) + '</div>';
}

function most(c) {
  const {s, t} = c;
  const open = (s.cases || []).filter(rec => rec.events?.at(-1)?.stage < 3).length;
  const aidState = {requested: ['На рассмотрении центра', 'Борбор карап жатат'], approved: ['Талон на заселение готов', 'Жайгашуу талону даяр'], redeemed: ['Заселение подтверждено', 'Жайгашуу ырасталды']};
  const aidHint = s.aid && Object.hasOwn(aidState, s.aid.status) ? t(...aidState[s.aid.status]) : t('Запросить две ночи в общежитии', 'Жатаканада эки түнгө орун суроо');
  const support = linkRow(c, 'cases', 'help', t('Мои обращения', 'Менин кайрылууларым'),
    open ? t('Открытые обращения · ', 'Ачык кайрылуулар · ') + open : t('Вопрос о зарплате, жилье или оплате', 'Айлык, турак жай же төлөм жөнүндө суроо'))
    + linkRow(c, 'appointments', 'calendar', t('Запись к специалисту', 'Адиске жазылуу'), t('Переводчик, клиника, языковой курс', 'Котормочу, клиника, тил курсу'))
    + linkRow(c, 'aid', 'heart', t('Адресная помощь', 'Даректүү жардам'), aidHint, '', true);
  const living = linkRow(c, 'salary', 'briefcase', t('Работа и выплаты', 'Иш жана төлөмдөр'), t('Смены, аванс и зарплата', 'Сменалар, аванс жана айлык'))
    + linkRow(c, 'housing', 'home', t('Жильё и залог', 'Турак жай жана күрөө'), t('Договор, платежи, возврат залога', 'Келишим, төлөмдөр, күрөөнү кайтаруу'))
    + linkRow(c, 'documents', 'file', t('Документы и сроки', 'Документтер жана мөөнөттөр'), t('Проверить платёж по документу', 'Документ боюнча төлөмдү текшерүү'))
    + linkRow(c, 'family', 'family', t('Моя семья', 'Менин үй-бүлөм'), t('Перевод близким в Кыргызстан', 'Кыргызстандагы жакындарга которуу'));
  const travel = linkRow(c, 'trip', 'plane', t('Авиабилет', 'Авиабилет'), t('Москва и Бишкек', 'Москва жана Бишкек'))
    + linkRow(c, 'transport', 'bus', t('Дорога до города', 'Шаарга чейин'), t('Аэропорт и городской транспорт', 'Аэропорт жана шаардык транспорт'));
  return '<div class="stack">' + section(c, t('Помощь рядом', 'Жакын жердеги жардам'), support) + section(c, t('Повседневные дела', 'Күнүмдүк иштер'), living)
    + section(c, t('Маршрут переезда', 'Көчүү багыты'), travel) + '</div>';
}

export function renderDashboard(route, c) {
  if (route === 'month' || route === 'home') return month(c);
  if (route === 'wallet') return wallet(c);
  if (route === 'most') return most(c);
  return null;
}
