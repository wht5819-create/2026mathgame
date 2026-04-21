# 2026mathgame — 九九乘法練習

> 📌 專案藍圖（變動慢）。進度日誌請看 Obsidian `2026mathgame/工作筆記.md`。

## 🎯 專案定位

小學中年級九九乘法練習工具。純前端、單頁、無後端、無登入。

目標使用者：家長／老師搭配學生在瀏覽器練習九九乘法，或自用複習速度與正確率。

## 🧱 技術棧

- **框架**：Next.js 16 App Router（Turbopack dev）
- **UI**：React 19 + Tailwind v4（`@import "tailwindcss"`、`@theme inline`）
- **語言**：TypeScript 5，嚴格模式
- **部署**：尚未設定（Vercel 一鍵即可）

## 🗂️ 主要檔案

| 檔案 | 職責 |
|------|------|
| `app/layout.tsx` | Root layout、metadata、Geist 字型、body 最小高度 flex |
| `app/page.tsx` | 整個遊戲（setup / playing / result 三階段）— 目前所有狀態都在這裡 |
| `app/globals.css` | Tailwind 匯入、CSS 變數、深色模式色票 |
| `public/brand/` | 本地品牌檔，已 `.gitignore` 排除，**不要推上公開 repo** |

## 🎮 遊戲流程

```
setup  →  playing  →  result
  ↑                      │
  └──────────────────────┘
       回設定 / 再玩一次
```

- **setup**：選乘數子集（2–9 多選）、題數（10/20/30）
- **playing**：隨機出題、Enter 送出、即時對錯回饋（答對 600ms、答錯 1400ms）、進度條、計時
- **result**：正確數、錯誤數、正確率、總用時、平均每題時間、錯題清單

## 🧭 設計原則

1. **不過度抽象**：目前所有邏輯在單一 component，狀態直接用 `useState`。題目出得快、畫面切得簡單，不需要 Redux / Zustand / Context。
2. **不存任何使用者資料**：純 client state。離開頁面 = 清空。
3. **不引入 backend**：要排行榜、存檔、帳號時再說。現階段刻意不上 Firebase。
4. **響應式優先**：手機直式也要能玩。輸入欄位要 `inputMode="numeric"` 叫出數字鍵盤。
5. **中文優先**：所有文案中文，介面對小學生友善。

## 🚀 未來可能擴充

（以下皆未排期，列這裡是為了避免現在做太多。）

- 倒數計時模式（30 秒內衝幾題）
- 錯題重練（從 result 頁進入只練錯的）
- 題型擴充：除法（九九除法反推）、兩位數 × 一位數
- 音效與動畫（答對 Confetti、連對 combo）
- 家長模式：輸入目標正確率與速度，孩子達標才過關
- PWA 離線可用
- 部署到 Vercel

## 🛠️ 開發指令

```bash
npm run dev     # Turbopack dev，http://localhost:3000
npm run build   # 產生 production build
npm run lint    # ESLint
```

## 🔗 關聯

- GitHub：<https://github.com/wht5819-create/2026mathgame>
- Obsidian 筆記：`2026mathgame/工作筆記.md`
- 本地路徑：`C:\Users\wht58\OneDrive - Digital Kingstone Co.,Ltd\claude專案\2026mathgame`
