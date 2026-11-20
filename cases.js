const generalTopic = ['Вопрос в центр поддержки', 'Колдоо борборуна суроо'];

const stages = [
  ['Создано', 'Түзүлдү'],
  ['В работе', 'Каралууда'],
  ['Есть ответ', 'Жооп келди'],
  ['Завершено', 'Аяктады']
];

const nextSteps = [
  ['Следующий шаг — назначить куратора, который рассмотрит ваш вопрос.', 'Кийинки кадам — сурооңузду карай турган адисти дайындоо.'],
  ['Куратор сверяет описание и приложенные материалы. Следующий шаг — ответ центра.', 'Адис түшүндүрмөнү жана тиркелген материалдарды салыштырат. Кийинки кадам — борбордун жообу.'],
  ['Демо-ответ куратора: материалы рассмотрены. Вы можете сохранить обращение в истории как завершённое.', 'Адистин үлгү жообу: материалдар каралды. Кайрылууну аяктап, тарыхта сактай аласыз.'],
  ['Материалы и история обращения доступны на этом устройстве.', 'Кайрылуунун материалдары жана тарыхы ушул түзмөктө сакталат.']
];

const stepActions = [
  ['Демо · назначить куратора', 'Демо · адис дайындоо'],
  ['Демо · получить ответ', 'Демо · жооп алуу'],
  ['Завершить обращение', 'Кайрылууну аяктоо']
];

function genericDraft() {
  return { topic: generalTopic, source: 'cases', evidence: [] };
}

function localId() {
  return globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
}

function label(pair, c) {
  return c.esc(Array.isArray(pair) ? c.t(pair[0], pair[1] ?? pair[0]) : String(pair ?? ''));
}

function localTime(value, c) {
  return new Intl.DateTimeFormat(c.t('ru-RU', 'ky-KG'), {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  }).format(new Date(value));
}

function activeCases(c) {
  return c.s.cases ?? (c.s.cases = []);
}

function newCase(c) {
  const draft = c.s.caseDraft ?? (c.s.caseDraft = genericDraft());
  if (!draft.formId) draft.formId = localId();
  const evidence = Array.isArray(draft.evidence) ? draft.evidence : [];
  const choices = evidence.map((item, index) => `
    <label class="check-row">
      <input type="checkbox" name="material" value="${index}">
      <span>${label(item, c)}</span>
    </label>`).join('');
  return `<form class="stack" data-form="case-create">
    <input type="hidden" name="formId" value="${c.esc(draft.formId)}">
    <section class="panel stack">
      <p class="sub">${c.t('Тема обращения', 'Кайрылуунун темасы')}</p>
      <h2 class="section-title">${label(draft.topic ?? generalTopic, c)}</h2>
      <label class="field">
        ${c.t('Что произошло?', 'Эмне болду?')}
        <textarea class="input" name="message" maxlength="700" rows="3"
          ${draft.source === 'cases' ? 'required' : ''}
          placeholder="${c.t('Опишите ситуацию на вымышленном примере', 'Ойдон чыгарылган мисал менен жагдайды сүрөттөңүз')}"></textarea>
      </label>
    </section>
    ${choices ? `<section class="panel stack">
        <fieldset class="stack"><legend class="section-title">${c.t('Что приложить', 'Тиркемелер')}</legend>
          <p class="sub">${c.t('Отметьте только те материалы, которые хотите включить в обращение.', 'Кайрылууга кошкуңуз келген материалдарды гана белгилеңиз.')}</p>
          ${choices}
        </fieldset>
      </section>` : ''}
    <section class="panel stack">
      <p class="sub">${c.t('Демо-обращение сохранится на этом устройстве.', 'Демо кайрылуу ушул түзмөктө сакталат.')}</p>
      <label class="check-row">
        <input type="checkbox" name="consent" value="yes" required>
        <span>${c.t('Подтверждаю состав обращения и выбранные материалы', 'Кайрылуунун мазмунун жана тандалган материалдарды ырастайм')}</span>
      </label>
      <button class="btn primary" type="submit">${c.t('Создать демо-обращение', 'Демо кайрылуу түзүү')}</button>
    </section>
  </form>`;
}

function caseDetails(record, c) {
  const stage = record.events.at(-1).stage;
  const materialList = record.evidence.map(item => `<li>${label(item, c)}</li>`).join('');
  const events = record.events.map(event => `
    <div class="row"><span class="row-copy">${label(stages[event.stage], c)}</span>
      <small class="sub">${c.esc(localTime(event.at, c))}</small>
    </div>`).join('');
  return `<div class="stack">
    <button class="btn secondary" type="button" data-action="case-all">${c.t('Все обращения', 'Бардык кайрылуулар')}</button>
    <section class="panel stack">
      <div class="section-head"><span class="sub">${c.t('Обращение', 'Кайрылуу')} № ${record.number}</span><span class="pill">${label(stages[stage], c)}</span></div>
      <h2 class="section-title">${label(record.topic, c)}</h2>
      ${record.message ? `<p>${c.esc(record.message)}</p>` : ''}
      <p class="notice">${label(nextSteps[stage], c)}</p>
      ${stepActions[stage] ? `<button class="btn primary" type="button" data-action="case-next" data-case-id="${c.esc(record.id)}" data-stage="${stage}">${label(stepActions[stage], c)}</button>` : ''}
    </section>
    <section class="panel stack"><h2 class="section-title">${c.t('Материалы обращения', 'Кайрылуунун материалдары')}</h2>
      ${materialList ? `<ul class="stack">${materialList}</ul>` : `<p class="sub">${c.t('Материалы не прикреплены.', 'Материалдар тиркелген жок.')}</p>`}
    </section>
    <section class="panel stack"><h2 class="section-title">${c.t('История обращения', 'Кайрылуунун тарыхы')}</h2>
      <div class="list">${events}</div>
    </section>
  </div>`;
}

function inbox(c) {
  const records = activeCases(c);
  const record = records.find(item => item.id === c.s.viewCaseId);
  if (record) return caseDetails(record, c);
  const rows = records.map(item => `<button class="row" type="button" data-action="case-view" data-case-id="${c.esc(item.id)}">
    <span class="row-copy"><strong>${label(item.topic, c)}</strong><small class="sub">№ ${item.number} · ${c.esc(localTime(item.events[0].at, c))}</small></span>
    <span class="pill">${label(stages[item.events.at(-1).stage], c)}</span>
  </button>`).join('');
  return `<div class="stack">
    <section class="panel stack"><h2 class="section-title">${c.t('Мои обращения', 'Менин кайрылууларым')}</h2>
      ${rows ? `<div class="list">${rows}</div>` : `<p class="sub">${c.t('Здесь появятся ваши обращения по зарплате, жилью и платежам.', 'Айлык акы, турак жай жана төлөмдөр боюнча кайрылууларыңыз бул жерде көрсөтүлөт.')}</p>`}
      <button class="btn primary" type="button" data-action="case-new">${c.t('Новое обращение', 'Жаңы кайрылуу')}</button>
    </section>
  </div>`;
}

export function renderCases(route, c) {
  if (route === 'cases') return inbox(c);
  if (route === 'new-case') return newCase(c);
  return null;
}

export function casesAction(action, el, c) {
  if (action === 'case-new') {
    c.caseDraft(genericDraft());
    return true;
  }
  if (!['case-all', 'case-view', 'case-next'].includes(action)) return false;
  if (action === 'case-all') {
    c.s.viewCaseId = '';
  } else {
    const record = activeCases(c).find(item => item.id === el.dataset.caseId);
    if (!record) return true;
    if (action === 'case-next') {
      const current = record.events.at(-1).stage;
      if (String(current) !== el.dataset.stage || current >= stages.length - 1) return true;
      record.events.push({ stage: current + 1, at: Date.now() });
    }
    c.s.viewCaseId = record.id;
  }
  c.save();
  c.render();
  return true;
}

export function casesSubmit(action, form, c) {
  if (action !== 'case-create') return false;
  const data = new FormData(form);
  const draft = c.s.caseDraft;
  if (!draft || !draft.formId || data.get('formId') !== draft.formId) return true;
  if (data.get('consent') !== 'yes') {
    c.toast(c.t('Подтвердите состав обращения.', 'Кайрылуунун мазмунун ырастаңыз.'));
    return true;
  }
  const message = String(data.get('message') ?? '').trim().slice(0, 700);
  if (draft.source === 'cases' && !message) {
    c.toast(c.t('Добавьте описание ситуации.', 'Жагдайды сүрөттөп бериңиз.'));
    return true;
  }
  const checked = new Set(data.getAll('material'));
  const selected = (draft.evidence ?? []).filter((_, index) => checked.has(String(index)));
  const records = activeCases(c);
  const record = {
    id: localId(),
    number: String(records.length + 1).padStart(4, '0'),
    topic: draft.topic ?? generalTopic,
    source: draft.source,
    message,
    evidence: selected,
    events: [{ stage: 0, at: Date.now() }]
  };
  records.unshift(record);
  c.s.viewCaseId = record.id;
  c.s.caseDraft = null;
  c.save();
  c.go('cases');
  return true;
}
