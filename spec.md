# 📊 Wealth Dashboard－前端專案規格文件（Specification）

## 專案概述（Overview）

本專案是一個 **個人 Wealth Dashboard（財富儀表板）**，用來記錄與視覺化：

- 每一筆實際發生的 **收入 / 支出 / 轉帳交易明細（Transactions）**
- **投資 Portfolio / Holdings（資產持倉）**
- 由交易資料即時計算出的時間區間財務總覽（Dashboard / Overview）

本專案的核心目標是：

> **先使用已整理過的資料（JSON 快照）做出一個「真的能用、算得對、好維護」的前端 Dashboard，**  
> 同時確保資料來源 **未來可被替換（Google Sheets / CSV / Database）而不需要重寫 UI 與商業邏輯。**

專案優先順序為：  
**正確性 ＞ 清楚的資料模型 ＞ 可維護性 ＞ 擴充性**  
避免過度工程化與過早自動化。

---

## 1. 技術棧（Tech Stack ｜必須遵守）

- React + Vite
- TypeScript（嚴格型別，避免使用 `any`）
- shadcn/ui（優先使用現成 UI 元件）
- Recharts
- Tailwind CSS
  - 僅用於 layout、spacing、responsive
  - 避免大量自訂顏色與樣式系統
- Oxlint（主要 lint gate）
- Prettier（唯一 formatter）
- Zustand
  - **只有在「跨頁共享狀態真的需要」時才可導入**
  - 否則優先使用 component state / hooks

---

## 2. Lint 與 Formatter 規範

### 職責分工（不可混用）

- **Oxlint**
  - 程式正確性
  - Best practices
  - 未使用變數檢查
  - 型別安全

- **Prettier**
  - 排版與格式化（縮排、引號、換行）

Lint 與 Formatter **不得互相衝突**。

---

### 必須提供的 scripts

```bash
pnpm dev
pnpm build
pnpm lint
pnpm format
```

### Prettier

```json
{
  "trailingComma": "es5",
  "semi": false,
  "tabWidth": 2,
  "singleQuote": true,
  "jsxSingleQuote": true,
  "arrowParens": "avoid",
  "printWidth": 120,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

## 3. 核心架構原則（非常重要）

#### Canonical Schema（單一真實資料模型）

• 專案必須 先定義 Domain Model（Canonical Schema）
• 所有 UI 與計算邏輯只能依賴這套 schema
• 不論資料來自哪裡，都必須先轉換成這套 schema 才能使用

#### 所有 Domain Models 必須同時具備：

• TypeScript 型別定義
• Zod runtime validation

## 4. 資料來源（MVP）

專案目前暫時僅使用 Accounting.json 作為資料來源。

## 5. 頁面與功能

### Dashboard（總覽）

此階段先不實作，僅保留 router 與頁面骨架。

### Transactions（核心頁面）

此頁為 交易明細 + 區間統計分析頁。

Filters（同時影響 Overview 與 Table）
• 日期區間：
• 年份（Year）
• 月份（Month）
• 自定義區間（From / To）

Filter 改變時，Overview 與 Table 必須同步更新。

Overview（即時計算，不存資料）
根據目前 Filter 後的交易資料計算：
• 總收入
• 總支出
• 各 Category 支出：
• 金額
• 佔總支出的百分比

規則：
• Category breakdown 只計算 expense
• Overview 為 derived data，不可存成資料模型

Transaction Table
• Date: YYYY-MM-DD HH:MM:SS
• ItemName
• Category
• Amount（顏色 / 正負）
• Notes

### Portfolio

此階段先不實作，僅保留 router 與頁面骨架。
