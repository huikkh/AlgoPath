# AlgoPath — 演算法學習指南

AlgoPath 是一個以繁體中文呈現的演算法教學網站，協助資工學生透過概念解說、執行步驟、圖形範例、虛擬碼與複雜度分析，理解常見演算法的運作方式。

## 網站功能

- **分類瀏覽：** 依圖形搜尋、最短路徑、最小生成樹三大主題探索內容。
- **即時搜尋：** 搜尋演算法中英文名稱、簡介、分類與標籤。
- **共用教學頁：** 所有演算法使用 `algorithm.html?id=...` 載入，不必為每篇教學複製 HTML。
- **圖形示意：** 依 JSON 中的節點與邊資料產生 SVG 圖形。
- **步驟導覽：** 以互動控制項逐步閱讀範例推演。
- **虛擬碼複製：** 可複製教學中的虛擬碼。
- **響應式版面：** 支援桌面、平板與手機。

## 目前教學內容

| 分類 | 演算法 |
|---|---|
| 圖形搜尋 | BFS、DFS |
| 最短路徑 | Dijkstra、Bellman-Ford、Floyd-Warshall |
| 最小生成樹 | Prim、Kruskal |

## 專案結構

```text
AlgoPath/
├── AGENTS.md
├── README.md
├── index.html
├── algorithm.html
├── assets/
│   ├── css/style.css
│   └── js/
│       ├── common.js
│       ├── home.js
│       └── algorithm.js
└── data/
    ├── algorithms.json
    └── algorithms/
        ├── bfs.json
        ├── dfs.json
        ├── dijkstra.json
        ├── bellman-ford.json
        ├── floyd-warshall.json
        ├── prim.json
        └── kruskal.json
```

## 本機執行

由於網站透過 `fetch()` 讀取 JSON，請使用本機靜態伺服器，不要直接以 `file://` 開啟 HTML。

```bash
python -m http.server 8000
```

接著在瀏覽器開啟：<http://localhost:8000>

## 新增演算法

1. 閱讀根目錄的 `AGENTS.md`，理解專案規則。
2. 在 `data/algorithms/` 新增 `<algorithm-id>.json`，欄位格式比照現有教學。
3. 在 `data/algorithms.json` 加入索引資料，確認 ID、分類與檔案路徑正確。
4. 確認比較項目的 `algorithmId` 指向存在的教學。
5. 以本機伺服器測試首頁搜尋、分類、教學頁、圖形範例與手機版版面。

一般新增教學不需要建立新的 HTML 或 JavaScript 檔案。

## GitHub Pages 部署

1. 建立 GitHub Repository，將本專案所有檔案推送至預設分支。
2. 進入 Repository 的 **Settings → Pages**。
3. 在 **Build and deployment** 中選擇 **Deploy from a branch**。
4. 選擇主要分支（例如 `main`）及 `/(root)`，儲存設定。
5. 等待 GitHub Pages 部署完成後，開啟 Pages 提供的網址，確認首頁及詳細教學頁都能正常載入。

> **公開網站網址：** 部署完成後，請將 GitHub Pages 提供的實際網址填在這裡。

## 開發規範

完整的 AI 開發規則請參閱 [`AGENTS.md`](./AGENTS.md)。任何 AI 助理新增或修改內容前，都應先閱讀該文件，並遵守既有資料格式、視覺設計與測試流程。

## 參考資料

演算法內容以自行整理的繁體中文說明呈現，並於各教學頁提供 CP-Algorithms 延伸閱讀連結。參考連結以各篇 JSON 的 `references` 欄位為準。
