// Stable hash routes also serve as links into the prototype.
export const pages = {
  month:        ['Мой месяц', 'Менин айым', 'calendar'],
  wallet:       ['Кошелёк', 'Капчык', 'wallet'],
  salary:       ['Сверка зарплаты', 'Айлыкты салыштыруу', 'briefcase', 'wallet'],
  'salary-card':['Зарплатная карта', 'Айлык картасы', 'card', 'wallet'],
  family:       ['Перевод семье', 'Үй-бүлөгө которуу', 'send', 'wallet'],
  housing:      ['Жильё и залог', 'Турак жай жана күрөө', 'home', 'wallet'],
  mobile:       ['Мобильная связь', 'Мобилдик байланыш', 'phone', 'wallet'],
  documents:    ['Патент', 'Патент', 'file', 'most'],
  most:         ['Сервисы «Моста»', '«Көпүрө» кызматтары', 'layers'],
  trip:         ['Авиабилеты', 'Авиабилеттер', 'plane', 'most'],
  transport:    ['Городской транспорт', 'Шаардык транспорт', 'bus', 'most'],
  appointments: ['Запись к специалисту', 'Адиске жазылуу', 'clock', 'most'],
  aid:          ['Помощь фонда', 'Фонддун жардамы', 'heart', 'most'],
  history:      ['История операций', 'Операциялардын тарыхы', 'history', 'wallet'],
  review:       ['Проверка платежа', 'Төлөмдү текшерүү', 'shield', 'wallet'],
  receipt:      ['Квитанция', 'Дүмүрчөк', 'receipt', 'history'],
  cases:        ['Мои обращения', 'Кайрылууларым', 'support'],
  'new-case':   ['Новое обращение', 'Жаңы кайрылуу', 'plus', 'cases']
};
export const groups = [
  [['Обзор','Жалпы маалымат'], ['month','wallet','most']],
  [['Доходы и расходы','Киреше жана чыгаша'], ['salary','salary-card','family','housing','mobile','documents']],
  [['Услуги и поддержка','Кызматтар жана колдоо'], ['trip','transport','appointments','aid','cases','new-case']],
  [['Операции','Операциялар'], ['history','review','receipt']]
];
export const tabs = [
  ['month','Месяц','Ай'], ['wallet','Кошелёк','Капчык'], ['most','Сервисы','Кызматтар'], ['cases','Помощь','Жардам']
];
