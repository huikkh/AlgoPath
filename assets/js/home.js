import { mountShell, fetchJson, createElement } from './common.js';

mountShell();

const state = { algorithms: [], category: 'all', query: '' };
const grid = document.querySelector('#algorithm-grid');
const filters = document.querySelector('#category-filters');
const searchInput = document.querySelector('#algorithm-search');
const resultCount = document.querySelector('#result-count');
const emptyState = document.querySelector('#empty-state');
const resetButton = document.querySelector('#reset-filters');

const categoryIcons = {
  'graph-traversal': '↗',
  'shortest-path': '⌁',
  'minimum-spanning-tree': '⌘'
};

function renderFilters() {
  const categories = [...new Map(state.algorithms.map((item) => [item.category, item.categoryName])).entries()];
  filters.replaceChildren();

  const allButton = createFilterButton('all', '全部內容', state.algorithms.length);
  filters.append(allButton);

  categories.forEach(([id, name]) => {
    const count = state.algorithms.filter((item) => item.category === id).length;
    filters.append(createFilterButton(id, name, count));
  });
}

function createFilterButton(id, label, count) {
  const button = createElement('button', `filter-chip${state.category === id ? ' is-active' : ''}`);
  button.type = 'button';
  button.dataset.category = id;
  button.setAttribute('aria-pressed', String(state.category === id));
  button.append(document.createTextNode(`${label} `));
  const badge = createElement('span', '', String(count));
  if (id === 'all') badge.id = 'all-count';
  button.append(badge);
  button.addEventListener('click', () => {
    state.category = id;
    updateView();
  });
  return button;
}

function createCard(item, index) {
  const link = createElement('a', 'algorithm-card');
  link.href = `./algorithm.html?id=${encodeURIComponent(item.id)}`;
  link.setAttribute('aria-label', `閱讀 ${item.title} 教學`);

  const top = createElement('div', 'card-topline');
  const icon = createElement('span', `card-icon card-icon-${index % 4}`, categoryIcons[item.category] || '◇');
  icon.setAttribute('aria-hidden', 'true');
  const category = createElement('span', 'card-category', item.categoryName);
  top.append(icon, category);

  const title = createElement('h3', 'card-title', item.title);
  const english = createElement('p', 'card-english', item.englishTitle);
  const summary = createElement('p', 'card-summary', item.summary);

  const bottom = createElement('div', 'card-bottom');
  const difficulty = createElement('span', `difficulty difficulty-${item.difficulty === '初級' ? 'easy' : item.difficulty === '高級' ? 'hard' : 'medium'}`, item.difficulty);
  const tags = createElement('span', 'card-tags', (item.tags || []).slice(0, 2).join(' · '));
  const arrow = createElement('span', 'card-arrow', '↗');
  arrow.setAttribute('aria-hidden', 'true');
  bottom.append(difficulty, tags, arrow);

  link.append(top, title, english, summary, bottom);
  return link;
}

function getFilteredAlgorithms() {
  const query = state.query.trim().toLocaleLowerCase();
  return state.algorithms.filter((item) => {
    const matchesCategory = state.category === 'all' || item.category === state.category;
    const searchable = [item.title, item.englishTitle, item.summary, item.categoryName, ...(item.tags || [])]
      .join(' ').toLocaleLowerCase();
    return matchesCategory && (!query || searchable.includes(query));
  });
}

function updateView() {
  const results = getFilteredAlgorithms();
  grid.replaceChildren();
  filters.querySelectorAll('.filter-chip').forEach((button) => {
    const active = button.dataset.category === state.category;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });

  results.forEach((item) => {
    const originalIndex = state.algorithms.findIndex((entry) => entry.id === item.id);
    grid.append(createCard(item, originalIndex));
  });

  emptyState.hidden = results.length > 0;
  grid.hidden = results.length === 0;
  resultCount.textContent = `顯示 ${results.length} / ${state.algorithms.length} 篇教學`;
}

searchInput.addEventListener('input', (event) => {
  state.query = event.target.value;
  updateView();
});

resetButton.addEventListener('click', () => {
  state.category = 'all';
  state.query = '';
  searchInput.value = '';
  updateView();
  searchInput.focus();
});

document.addEventListener('keydown', (event) => {
  const target = event.target;
  const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target.isContentEditable;
  if (event.key === '/' && !isTyping) {
    event.preventDefault();
    searchInput.focus();
  }
  if (event.key === 'Escape' && target === searchInput) {
    searchInput.value = '';
    state.query = '';
    updateView();
  }
});

try {
  state.algorithms = await fetchJson('./data/algorithms.json');
  renderFilters();
  document.querySelector('#metric-count').textContent = String(state.algorithms.length).padStart(2, '0');
  document.querySelector('#all-count').textContent = String(state.algorithms.length);
  updateView();
} catch (error) {
  grid.replaceChildren();
  const message = createElement('div', 'load-error', `教學內容載入失敗：${error.message}`);
  grid.append(message);
  resultCount.textContent = '暫時無法載入';
  console.error(error);
}
