const channels = [
  {
    id: 'skills',
    label: 'SKILLS',
    title: 'Skills',
    cards: [
      { label: 'Languages', body: 'TypeScript · JavaScript · Go · Java · Python' },
      { label: 'Frameworks', body: 'React · Next.js · SvelteKit · FastAPI · Spring Boot' },
      { label: 'Data', body: 'PostgreSQL · MongoDB · SQL' },
      { label: 'Cloud', body: 'AWS · AWS CDK · Docker · Kubernetes' },
    ],
  },
  {
    id: 'experience',
    label: 'EXP',
    title: 'Experience',
    cards: [
      {
        label: 'Fidelity',
        meta: 'SWE Intern · 2025',
        body: 'Full-stack tooling on TypeScript, SvelteKit, FastAPI, AWS.',
      },
      {
        label: 'Bridgewater State',
        meta: 'TA · 2025–Current',
        body: 'Programming help, debugging, and problem solving.',
      },
      {
        label: 'Focus',
        body: 'Frontend, backend, and cloud in production.',
      },
      {
        label: 'Stack',
        body: 'REST · Microservices · JWT / OAuth',
      },
    ],
  },
  {
    id: 'education',
    label: 'EDU',
    title: 'Education',
    cards: [
      {
        label: 'Bridgewater State University',
        meta: 'Expected Dec 2026',
        body: 'B.S. Computer Science',
      },
      { label: 'GPA', body: '3.86' },
      { label: 'Honor Society', body: 'Upsilon Pi Epsilon' },
      { label: 'Location', body: 'Bridgewater, MA' },
    ],
  },
  {
    id: 'about',
    label: 'ABOUT',
    title: 'About',
    cards: [
      { label: 'Based in', body: 'Plymouth, MA' },
      {
        label: 'Also',
        body: 'Guitarist & audio engineer — 7+ years performing, recording, and mixing.',
      },
      {
        label: 'GitHub',
        body: 'evanwilson2123',
        href: 'https://github.com/evanwilson2123',
      },
      {
        label: 'LinkedIn',
        body: 'evan-wilson',
        href: 'https://www.linkedin.com/in/evan-wilson-0525102b8/',
      },
    ],
  },
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

const levels = Object.fromEntries(
  channels.map((channel, index) => [channel.id, index === 0 ? 0.75 : 0.08]),
);
let activeId = channels[0].id;

const mixEl = document.getElementById('mix');
const mixLabel = document.getElementById('mix-label');
const mixGrid = document.getElementById('mix-grid');
const channelsEl = document.getElementById('channels');

function renderMix() {
  const channel = channels.find((item) => item.id === activeId) ?? channels[0];
  const level = levels[activeId];
  const live = level > 0.12;

  mixEl.style.opacity = live ? '1' : '0.35';
  mixEl.classList.toggle('is-live', live);
  mixLabel.textContent = live ? channel.title : 'Standby';
  mixGrid.innerHTML = '';

  channel.cards.forEach((card) => {
    const el =
      card.href && live
        ? Object.assign(document.createElement('a'), {
            href: card.href,
            target: '_blank',
            rel: 'noreferrer',
            className: 'board__card board__card--link',
          })
        : Object.assign(document.createElement('div'), {
            className: 'board__card',
          });

    el.innerHTML =
      `<span class="board__card-label">${card.label}</span>` +
      (card.meta ? `<span class="board__card-meta">${card.meta}</span>` : '') +
      `<span class="board__card-body">${card.body}</span>`;

    mixGrid.appendChild(el);
  });
}

function setLevel(id, value) {
  levels[id] = value;
  if (value > 0.2) activeId = id;
  updateChannel(id);
  renderMix();
  syncSelected();
}

function updateChannel(id) {
  const article = channelsEl.querySelector(`[data-id="${id}"]`);
  if (!article) return;
  const level = levels[id];
  const fill = article.querySelector('.fader__fill');
  const thumb = article.querySelector('.fader__thumb');
  const mute = article.querySelector('.channel__mute');
  fill.style.height = `${level * 100}%`;
  thumb.style.bottom = `calc(${level * 100}% - 12px)`;
  mute.classList.toggle('is-on', level < 0.05);
}

function syncSelected() {
  channelsEl.querySelectorAll('.channel').forEach((el) => {
    el.classList.toggle('is-selected', el.dataset.id === activeId);
  });
}

function bindFader(track, id) {
  let dragging = false;

  const setFromClientY = (clientY) => {
    const rect = track.getBoundingClientRect();
    setLevel(id, clamp(1 - (clientY - rect.top) / rect.height, 0, 1));
  };

  track.addEventListener('pointerdown', (event) => {
    dragging = true;
    track.setPointerCapture(event.pointerId);
    setFromClientY(event.clientY);
  });
  track.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    setFromClientY(event.clientY);
  });
  track.addEventListener('pointerup', () => {
    dragging = false;
  });
  track.addEventListener('pointercancel', () => {
    dragging = false;
  });
}

function createChannel(channel) {
  const article = document.createElement('article');
  article.className = 'channel';
  article.dataset.id = channel.id;

  article.innerHTML = `
    <button type="button" class="channel__name">${channel.label}</button>
    <div class="vu" aria-hidden="true"><div class="vu__needle"></div></div>
    <div class="fader" aria-label="${channel.label} fader">
      <div class="fader__fill"></div>
      <div class="fader__thumb"></div>
    </div>
    <button type="button" class="channel__mute" aria-label="Mute ${channel.label}">M</button>
  `;

  article.querySelector('.channel__name').addEventListener('click', () => {
    activeId = channel.id;
    levels[channel.id] = Math.max(levels[channel.id], 0.7);
    updateChannel(channel.id);
    renderMix();
    syncSelected();
  });

  article.querySelector('.channel__mute').addEventListener('click', () => {
    setLevel(channel.id, levels[channel.id] < 0.05 ? 0.7 : 0);
  });

  bindFader(article.querySelector('.fader'), channel.id);
  channelsEl.appendChild(article);
  updateChannel(channel.id);
}

channels.forEach(createChannel);

channelsEl.insertAdjacentHTML(
  'beforeend',
  `
  <aside class="master" aria-label="Master level">
    <span class="master__label">MASTER</span>
    <div class="master__meters" aria-hidden="true">
      <div class="master__bar"><span style="height: 89%"></span></div>
      <div class="master__bar"><span style="height: 87%"></span></div>
    </div>
    <strong class="master__level">−1 dB</strong>
  </aside>
`,
);

renderMix();
syncSelected();
