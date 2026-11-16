import { mountShell, fetchJson, createElement } from './common.js';

mountShell();

const root = document.querySelector('#article-root');
const params = new URLSearchParams(window.location.search);
const algorithmId = params.get('id');
const tocItems = [
  ['introduction', '演算法介紹'],
  ['core-concept', '核心概念'],
  ['steps', '執行步驟'],
  ['example', '實際範例'],
  ['pseudocode', '虛擬碼'],
  ['complexity', '時間與空間複雜度'],
  ['applications', '優缺點與應用'],
  ['comparisons', '相關演算法比較']
];

function textBlock(tag, className, text) {
  return createElement(tag, className, text);
}

function makeSection(id, number, title) {
  const section = createElement('section', 'content-section');
  section.id = id;
  const heading = createElement('div', 'content-heading');
  heading.append(createElement('span', 'content-number', number), createElement('h2', '', title));
  section.append(heading);
  return section;
}

function makeBulletList(items, className = 'content-list') {
  const list = createElement('ul', className);
  (items || []).forEach((item) => list.append(createElement('li', '', item)));
  return list;
}

function renderBreadcrumb(item) {
  const breadcrumb = createElement('nav', 'breadcrumb');
  breadcrumb.setAttribute('aria-label', '麵包屑導覽');
  const home = createElement('a', '', '首頁');
  home.href = './index.html';
  const separator = createElement('span', 'breadcrumb-separator', '/');
  const category = createElement('a', '', item.categoryName);
  category.href = './index.html#library';
  breadcrumb.append(home, separator, category, createElement('span', 'breadcrumb-separator', '/'), createElement('span', 'breadcrumb-current', item.title));
  return breadcrumb;
}

function renderToc() {
  const aside = createElement('aside', 'article-sidebar');
  const sticky = createElement('div', 'sidebar-sticky');
  sticky.append(createElement('p', 'sidebar-label', 'ON THIS PAGE'));
  const nav = createElement('nav', 'toc-nav');
  nav.setAttribute('aria-label', '本頁章節');
  tocItems.forEach(([id, label], index) => {
    const anchor = createElement('a', 'toc-link', `${String(index + 1).padStart(2, '0')}  ${label}`);
    anchor.href = `#${id}`;
    nav.append(anchor);
  });
  sticky.append(nav);
  const back = createElement('a', 'sidebar-back', '← 返回所有演算法');
  back.href = './index.html#library';
  sticky.append(back);
  aside.append(sticky);
  return aside;
}

function renderGraph(graph) {
  const wrapper = createElement('div', 'graph-card');
  const top = createElement('div', 'graph-card-header');
  top.append(createElement('span', 'graph-card-label', 'GRAPH STRUCTURE'), createElement('span', 'graph-card-note', graph.directed ? '有向圖' : '無向圖'));
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 520 300');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', `${graph.directed ? '有向' : '無向'}圖，包含節點 ${graph.nodes.join('、')}`);
  const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
  title.textContent = '範例圖形結構';
  svg.append(title);

  const positions = getNodePositions(graph.nodes);
  const markerId = `arrow-${Math.random().toString(36).slice(2, 9)}`;
  if (graph.directed) {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', markerId);
    marker.setAttribute('markerWidth', '8');
    marker.setAttribute('markerHeight', '8');
    marker.setAttribute('refX', '6');
    marker.setAttribute('refY', '3');
    marker.setAttribute('orient', 'auto');
    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    arrow.setAttribute('d', 'M0,0 L0,6 L6,3 z');
    arrow.setAttribute('fill', '#8b9ab3');
    marker.append(arrow);
    defs.append(marker);
    svg.append(defs);
  }

  (graph.edges || []).forEach((edge) => {
    const from = positions.get(edge.from);
    const to = positions.get(edge.to);
    if (!from || !to) return;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.hypot(dx, dy) || 1;
    const ux = dx / length;
    const uy = dy / length;
    const startOffset = 23;
    const endOffset = graph.directed ? 29 : 23;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', String(from.x + ux * startOffset));
    line.setAttribute('y1', String(from.y + uy * startOffset));
    line.setAttribute('x2', String(to.x - ux * endOffset));
    line.setAttribute('y2', String(to.y - uy * endOffset));
    line.setAttribute('class', 'graph-edge');
    if (graph.directed) line.setAttribute('marker-end', `url(#${markerId})`);
    svg.append(line);

    if (edge.weight !== undefined) {
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', String((from.x + to.x) / 2 + (dy === 0 ? 0 : 5)));
      label.setAttribute('y', String((from.y + to.y) / 2 - (dx === 0 ? 0 : 5)));
      label.setAttribute('class', 'graph-edge-weight');
      label.textContent = String(edge.weight);
      svg.append(label);
    }
  });

  graph.nodes.forEach((node) => {
    const point = positions.get(node);
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', String(point.x));
    circle.setAttribute('cy', String(point.y));
    circle.setAttribute('r', '22');
    circle.setAttribute('class', 'graph-node');
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', String(point.x));
    label.setAttribute('y', String(point.y + 4));
    label.setAttribute('class', 'graph-node-label');
    label.textContent = node;
    group.append(circle, label);
    svg.append(group);
  });

  const legend = createElement('div', 'graph-legend', graph.directed ? '箭頭表示邊的方向' : '線段表示節點之間的連接');
  wrapper.append(top, svg, legend);
  return wrapper;
}

function getNodePositions(nodes) {
  const count = nodes.length;
  const presets = {
    1: [[260, 150]],
    2: [[150, 150], [370, 150]],
    3: [[260, 60], [115, 235], [405, 235]],
    4: [[115, 80], [405, 80], [405, 220], [115, 220]],
    5: [[260, 45], [445, 150], [330, 255], [190, 255], [75, 150]],
    6: [[75, 150], [165, 65], [355, 65], [445, 150], [355, 235], [165, 235]]
  };
  const coords = presets[count] || Array.from({ length: count }, (_, index) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * index) / count;
    return [260 + 180 * Math.cos(angle), 150 + 105 * Math.sin(angle)];
  });
  // Keep larger graphs inside the SVG canvas.
  const values = count > 6 ? coords.map(([x, y]) => [Math.max(55, Math.min(465, x)), Math.max(45, Math.min(255, y))]) : coords;
  return new Map(nodes.map((node, index) => [node, { x: values[index][0], y: values[index][1] }]));
}

function renderWalkthrough(walkthrough) {
  const panel = createElement('div', 'walkthrough-panel');
  const heading = createElement('div', 'walkthrough-heading');
  heading.append(createElement('div', 'walkthrough-kicker', 'STEP-BY-STEP'), createElement('span', 'walkthrough-total', `${walkthrough.length} 個步驟`));
  const progress = createElement('div', 'walkthrough-progress');
  const progressBar = createElement('span', 'walkthrough-progress-fill');
  progress.append(progressBar);
  const body = createElement('div', 'walkthrough-body');
  const stepNumber = createElement('span', 'walkthrough-step-number');
  const title = createElement('h3', 'walkthrough-step-title');
  const description = createElement('p', 'walkthrough-step-description');
  const state = createElement('div', 'walkthrough-state');
  body.append(stepNumber, title, description, state);
  const controls = createElement('div', 'walkthrough-controls');
  const previous = createElement('button', 'button button-secondary', '← 上一步');
  previous.type = 'button';
  const next = createElement('button', 'button button-primary', '下一步 →');
  next.type = 'button';
  controls.append(previous, next);
  panel.append(heading, progress, body, controls);

  let current = 0;
  const update = () => {
    const item = walkthrough[current];
    stepNumber.textContent = `STEP ${String(item.step).padStart(2, '0')} / ${String(walkthrough.length).padStart(2, '0')}`;
    title.textContent = item.title;
    description.textContent = item.description;
    state.textContent = item.state || '';
    state.hidden = !item.state;
    previous.disabled = current === 0;
    next.disabled = current === walkthrough.length - 1;
    next.textContent = current === walkthrough.length - 1 ? '已到最後一步' : '下一步 →';
    progressBar.style.width = `${((current + 1) / walkthrough.length) * 100}%`;
  };
  previous.addEventListener('click', () => { if (current > 0) { current -= 1; update(); } });
  next.addEventListener('click', () => { if (current < walkthrough.length - 1) { current += 1; update(); } });
  update();
  return panel;
}

function renderComparison(comparison, indexMap) {
  const list = createElement('div', 'comparison-list');
  (comparison || []).forEach((item) => {
    const card = createElement('article', 'comparison-card');
    const target = indexMap.get(item.algorithmId);
    const title = createElement('h3', '', target ? target.title : item.algorithmId);
    const description = createElement('p', '', item.description);
    card.append(title, description);
    if (target) {
      const link = createElement('a', 'inline-link', '閱讀相關教學 →');
      link.href = `./algorithm.html?id=${encodeURIComponent(target.id)}`;
      card.append(link);
    }
    list.append(card);
  });
  return list;
}

function renderReferences(references) {
  const list = createElement('ul', 'reference-list');
  (references || []).forEach((reference) => {
    const item = createElement('li');
    const link = createElement('a', 'inline-link', reference.title);
    link.href = reference.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    item.append(link);
    list.append(item);
  });
  return list;
}

function renderArticle(indexItem, data, indexMap) {
  document.title = `${indexItem.title}｜AlgoPath`;
  root.replaceChildren();
  root.append(renderBreadcrumb(indexItem));

  const header = createElement('header', 'article-hero');
  const meta = createElement('div', 'article-meta');
  meta.append(createElement('span', 'article-category', indexItem.categoryName), createElement('span', `difficulty difficulty-${indexItem.difficulty === '初級' ? 'easy' : indexItem.difficulty === '高級' ? 'hard' : 'medium'}`, indexItem.difficulty));
  header.append(meta, createElement('h1', 'article-title', indexItem.title), createElement('p', 'article-english', indexItem.englishTitle), createElement('p', 'article-summary', indexItem.summary));
  root.append(header);

  const layout = createElement('div', 'article-layout');
  const content = createElement('div', 'article-content');

  const intro = makeSection('introduction', '01', '演算法介紹');
  intro.append(textBlock('p', 'lead-paragraph', data.introduction));
  content.append(intro);

  const concept = makeSection('core-concept', '02', '核心概念');
  concept.append(textBlock('p', 'body-paragraph', data.coreConcept));
  content.append(concept);

  const steps = makeSection('steps', '03', '執行步驟');
  const stepList = createElement('div', 'step-list');
  (data.steps || []).forEach((step, index) => {
    const item = createElement('article', 'step-item');
    item.append(createElement('span', 'step-index', String(index + 1).padStart(2, '0')), createElement('div', 'step-copy'));
    item.lastChild.append(createElement('h3', '', step.title), createElement('p', '', step.description));
    stepList.append(item);
  });
  steps.append(stepList);
  content.append(steps);

  const example = makeSection('example', '04', '實際範例');
  example.append(textBlock('p', 'body-paragraph', data.example.description));
  if (data.example.graph) example.append(renderGraph(data.example.graph));
  if (data.example.walkthrough?.length) example.append(renderWalkthrough(data.example.walkthrough));
  if (data.example.result) {
    const result = createElement('div', 'result-callout');
    result.append(createElement('span', 'result-icon', '✓'), createElement('div', 'result-copy'));
    result.lastChild.append(createElement('strong', '', '範例結果'), createElement('p', '', data.example.result));
    example.append(result);
  }
  content.append(example);

  const pseudocode = makeSection('pseudocode', '05', '虛擬碼');
  const codeHeader = createElement('div', 'code-header');
  codeHeader.append(createElement('span', '', 'PSEUDOCODE'), createElement('span', 'code-language', '語言中立表示'));
  const pre = createElement('pre', 'code-block');
  const code = createElement('code', '', data.pseudocode);
  pre.append(code);
  const copyButton = createElement('button', 'copy-button', '複製程式碼');
  copyButton.type = 'button';
  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(data.pseudocode);
      copyButton.textContent = '已複製 ✓';
      window.setTimeout(() => { copyButton.textContent = '複製程式碼'; }, 1600);
    } catch {
      copyButton.textContent = '請手動選取';
    }
  });
  codeHeader.append(copyButton);
  pseudocode.append(codeHeader, pre);
  content.append(pseudocode);

  const complexity = makeSection('complexity', '06', '時間與空間複雜度');
  const complexityGrid = createElement('div', 'complexity-grid');
  const timeCard = createElement('div', 'complexity-card');
  timeCard.append(createElement('span', 'complexity-label', 'TIME COMPLEXITY'), createElement('strong', '', data.complexity.time), createElement('span', 'complexity-caption', '時間複雜度'));
  const spaceCard = createElement('div', 'complexity-card');
  spaceCard.append(createElement('span', 'complexity-label', 'SPACE COMPLEXITY'), createElement('strong', '', data.complexity.space), createElement('span', 'complexity-caption', '額外空間複雜度'));
  complexityGrid.append(timeCard, spaceCard);
  complexity.append(complexityGrid, textBlock('p', 'complexity-note', data.complexity.notes));
  content.append(complexity);

  const applications = makeSection('applications', '07', '優缺點與應用');
  const detailColumns = createElement('div', 'detail-columns');
  const pros = createElement('div', 'detail-column detail-pros');
  pros.append(createElement('h3', '', '優點'), makeBulletList(data.pros));
  const cons = createElement('div', 'detail-column detail-cons');
  cons.append(createElement('h3', '', '限制'), makeBulletList(data.cons));
  detailColumns.append(pros, cons);
  applications.append(detailColumns, createElement('h3', 'subsection-title', '常見應用'), makeBulletList(data.applications, 'application-list'));
  content.append(applications);

  const comparisons = makeSection('comparisons', '08', '相關演算法比較');
  comparisons.append(renderComparison(data.comparisons, indexMap));
  if (data.references?.length) {
    comparisons.append(createElement('h3', 'subsection-title reference-heading', '延伸閱讀'), renderReferences(data.references));
  }
  content.append(comparisons);

  layout.append(renderToc(), content);
  root.append(layout);

  const footerNav = createElement('div', 'article-footer-nav');
  const backLink = createElement('a', 'button button-secondary', '← 回到演算法列表');
  backLink.href = './index.html#library';
  footerNav.append(backLink);
  root.append(footerNav);
}

async function showError(message) {
  root.replaceChildren();
  const panel = createElement('section', 'article-error');
  panel.append(createElement('span', 'error-mark', '!'), createElement('h1', '', '無法載入這篇教學'), createElement('p', '', message));
  const link = createElement('a', 'button button-primary', '返回演算法列表');
  link.href = './index.html#library';
  panel.append(link);
  root.append(panel);
}

if (!algorithmId) {
  await showError('網址缺少演算法 ID。請從首頁選擇一篇教學，或返回演算法列表。');
} else {
  try {
    const algorithms = await fetchJson('./data/algorithms.json');
    const indexItem = algorithms.find((item) => item.id === algorithmId);
    if (!indexItem) throw new Error('找不到這個演算法，請確認網址中的 ID 是否正確。');
    const data = await fetchJson(indexItem.file);
    if (data.id !== indexItem.id) throw new Error('教學資料 ID 與索引不一致，請聯絡網站維護者。');
    const indexMap = new Map(algorithms.map((item) => [item.id, item]));
    renderArticle(indexItem, data, indexMap);
  } catch (error) {
    console.error(error);
    await showError(error.message || '資料載入時發生未知錯誤。');
  }
}
