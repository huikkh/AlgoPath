const HEADER_MARKUP = `
  <header class="site-header">
    <div class="header-inner wrap">
      <a class="brand" href="./index.html" aria-label="AlgoPath 首頁">
        <span class="brand-symbol" aria-hidden="true"><span></span><span></span><span></span></span>
        <span class="brand-name">AlgoPath<span class="brand-period">.</span><small>ALGORITHM LEARNING GUIDE</small></span>
      </a>
      <nav class="main-nav" aria-label="主要導覽">
        <a href="./index.html#library">探索演算法</a>
        <a href="./index.html#about">關於網站</a>
      </nav>
      <a class="header-cta" href="./index.html#library">開始學習 <span aria-hidden="true">↗</span></a>
    </div>
  </header>`;

const FOOTER_MARKUP = `
  <footer class="site-footer">
    <div class="wrap footer-inner">
      <a class="brand footer-brand" href="./index.html" aria-label="AlgoPath 首頁">
        <span class="brand-symbol" aria-hidden="true"><span></span><span></span><span></span></span>
        <span class="brand-name">AlgoPath<span class="brand-period">.</span><small>LEARN WITH CLARITY</small></span>
      </a>
      <p>把複雜的概念，整理成清楚的學習路徑。</p>
      <span class="footer-copy">© <span data-current-year></span> AlgoPath</span>
    </div>
  </footer>`;

export function mountShell() {
  document.querySelectorAll('[data-site-header]').forEach((slot) => {
    slot.innerHTML = HEADER_MARKUP;
  });
  document.querySelectorAll('[data-site-footer]').forEach((slot) => {
    slot.innerHTML = FOOTER_MARKUP;
  });
  document.querySelectorAll('[data-current-year]').forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });
}

export async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`無法載入資料（${response.status}）：${path}`);
  }
  return response.json();
}

export function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined && text !== null) element.textContent = text;
  return element;
}

export function formatCategory(category) {
  return category || '其他主題';
}
