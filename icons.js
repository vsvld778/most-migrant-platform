const paths = {
  home: 'M3 10l9-7 9 7M5 9v12h5v-7h4v7h5V9',
  wallet: 'M20 8V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v11H5a3 3 0 0 1-3-3V6m18 6h-5v5h5m-3-2.5h.01',
  calendar: 'M4 5h16v16H4zM4 10h16M8 3v4m8-4v4m-9 7h3m3 0h3m-9 3h3',
  family: 'M13 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm2 12v-2a5 5 0 0 0-10 0v2m11-14a3 3 0 0 1 0 6m1 2a4 4 0 0 1 3 4v2',
  send: 'm22 2-7 20-4-9-9-4 20-7ZM11 13 22 2',
  card: 'M3 6h18v13H3zM3 10h18M6 15h3',
  coins: 'M14 7c0 2-3 3-6 3S2 9 2 7s3-3 6-3 6 1 6 3Zm-12 0v4c0 2 3 3 6 3m0 4c-3 0-6-1-6-3v-4m20 2c0 2-3 3-6 3s-6-1-6-3 3-3 6-3 6 1 6 3Zm-12 0v4c0 2 3 3 6 3s6-1 6-3v-4',
  bus: 'M5 14V6q0-3 7-3t7 3v11q0 2-2 2H7q-2 0-2-2v-3Zm0-3h14M8 15h.01m8 0h.01M7 19v2m10-2v2',
  plane: 'M12 2c1 0 1.5 1 1.5 2.5v3.8l7.2 5v2.3l-7.2-2.8v4.9l2.4 2v1.7L12 20l-3.9 1.4v-1.7l2.4-2v-4.9l-7.2 2.8v-2.3l7.2-5V4.5C10.5 3 11 2 12 2Z',
  help: 'M21 4H3v14h5v4l5-4h8V4ZM7 9h10m-10 4h6',
  heart: 'M12 21s-9-6.2-9-12A5.2 5.2 0 0 1 12 5.5 5.2 5.2 0 0 1 21 9c0 5.8-9 12-9 12Z',
  layers: 'm12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5',
  file: 'M14 2H5v20h14V7l-5-5Zm0 0v6h5M8 12h8m-8 4h6',
  phone: 'M8 2h8q2 0 2 2v16q0 2-2 2H8q-2 0-2-2V4q0-2 2-2Zm-2 15h12m-6 3h.01',
  shield: 'm12 2 8 3v6c0 5-8 11-8 11S4 16 4 11V5l8-3Zm-4 9 3 3 5-6',
  chevron: 'm9 5 7 7-7 7',
  menu: 'M4 6h16M4 12h16M4 18h16',
  'arrow-right': 'M4 12h16m-6-6 6 6-6 6',
  'arrow-left': 'M20 12H4m6-6-6 6 6 6',
  external: 'M13 4h7v7M20 4l-9 9m-2-8H4v15h15v-5',
  moon: 'M20 14A9 9 0 0 1 10 4 9 9 0 1 0 20 14Z',
  sun: 'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5',
  globe: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM2 12h20M12 2c-6 7-6 13 0 20 6-7 6-13 0-20Z',
  receipt: 'M5 3h14v18l-3-2-4 2-4-2-3 2V3Zm3 5h8m-8 4h8',
  check: 'm5 12 4 4L19 6',
  building: 'M3 21h18M5 21V3h10v18m0-13h4v13M8 7h1m2 0h1m-4 4h1m2 0h1m-4 4h1m2 0h1',
  plus: 'M12 5v14M5 12h14',
  close: 'M5 5l14 14M19 5 5 19',
  clock: 'M12 7v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  network: 'M3 18v2m5-6v6m6-11v11m6-16v16',
  wifi: 'M2 9a16 16 0 0 1 20 0M5.5 12.5a10.5 10.5 0 0 1 13 0m-9.5 3a5 5 0 0 1 6 0M12 19h.01',
  battery: 'M3 7h15q1 0 1 1v8q0 1-1 1H3q-1 0-1-1V8q0-1 1-1Zm18 3v4M5 10v4m3-4v4m3-4v4m3-4v4',
  copy: 'M8 8h12v12H8zM16 4H4v12',
  settings: 'M3 7h7m4 0h7M3 17h11m4 0h3m-7-10a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z',
  history: 'M3 10a9 9 0 1 1 .4 5.5M3 4v6h6m3-3v5l3 2',
  briefcase: 'M3 8h18v12H3zM8 8V4h8v4M3 12q9 5 18 0m-9 1v3',
  target: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Zm-5 0a5 5 0 1 1-10 0 5 5 0 0 1 10 0Zm-5 0h.01',
  user: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-1a8 8 0 0 1 16 0v1',
  ticket: 'M3 6h18v4a2 2 0 0 0 0 4v4H3v-4a2 2 0 0 0 0-4V6Zm12 1v2m0 2v2m0 2v2',
  alert: 'm12 3 10 17H2L12 3Zm0 6v5m0 3h.01',
  activity: 'M2 12h5l3-8 4 16 3-8h5',
  swap: 'M4 7h15m-4-4 4 4-4 4M20 17H5m4-4-4 4 4 4',
  info: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM12 11v6m0-10h.01',
};

const alias = { month:'calendar', support:'help', rent:'home', 'chevron-right':'chevron', back:'arrow-left' };

export function icon(name) {
  const key = Object.hasOwn(alias, name) ? alias[name] : name;
  const path = Object.hasOwn(paths, key) ? paths[key] : paths.info;
  return `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="${path}"></path></svg>`;
}
