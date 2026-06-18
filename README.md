# Claude 開發者論壇 2026 · 高雄展覽館場地提案

一個純靜態、支援繁中／English／日本語三語切換的單頁網站，用於向官方提案 **2026 年 12 月、約 1,000 人規模的 Claude 開發者論壇** 以高雄展覽館為主辦場地。內容涵蓋空間介紹、設備、費用方案（含台幣／美金）、議程配置與交通住宿。

## 專案結構

```
.
├── index.html              # 頁面結構
├── css/
│   └── styles.css          # 全站樣式
├── js/
│   ├── i18n.js             # 三語系字典（繁中／EN／日本語）
│   └── main.js             # 語言切換 + 大會堂圖片輪播
├── images/                 # 所有照片與平面圖（見 images/README.md）
├── .github/workflows/
│   └── deploy.yml          # push 到 main 自動部署 GitHub Pages
├── .nojekyll               # 告訴 Pages 不要用 Jekyll 處理
└── README.md
```

## 本機預覽

純靜態網站，任選一種方式：

```bash
# 方式一：Python 內建伺服器
python3 -m http.server 8000
# 開啟 http://localhost:8000

# 方式二：直接用瀏覽器開啟 index.html
open index.html
```

> 建議用本機伺服器預覽，Google 地圖 iframe 與相對路徑載入較穩定。

## 部署到 GitHub Pages（自動）

本專案已內建 GitHub Actions 工作流程，**只要 push 到 `main` 分支就會自動部署**：

1. 在 GitHub 建立 repo 並推送：
   ```bash
   git init
   git add .
   git commit -m "Initial commit: 高雄展覽館場地提案網站"
   git branch -M main
   git remote add origin https://github.com/<你的帳號>/<repo 名稱>.git
   git push -u origin main
   ```
2. 到 repo 的 **Settings → Pages → Build and deployment**，將 **Source** 設為 **GitHub Actions**。
3. 之後每次 `git push`，`.github/workflows/deploy.yml` 會自動建置並發佈，網址為
   `https://<你的帳號>.github.io/<repo 名稱>/`。

也可在 **Actions** 分頁手動觸發（workflow_dispatch）。

## 多語系維護

所有文案集中在 `js/i18n.js`，每個區段以 `data-i18n`（純文字）或 `data-i18n-html`（含 `<b>` 等標籤）屬性對應字典 key。新增文字時，三個語言（`zh` / `en` / `ja`）都要補上同名 key。

## 費用說明

- 明細表為場地**未稅**原始報價；方案總價一律**外加 5% 營業稅**。
- 同時以新台幣與美金呈現，美金以匯率約 **1 USD ≈ 32.5 TWD** 換算（僅供參考，可於 `index.html` 與 `js/i18n.js` 調整）。
- 所有金額為依現有資料整理之估算，非正式報價。

## 照片來源

- 場勘照片：現場拍攝。
- 301 大會堂輪播照片：高雄展覽館官方網站 [kecc.com.tw](https://www.kecc.com.tw/)，作為提案參考用途；正式對外發佈前建議向場地方確認授權。
