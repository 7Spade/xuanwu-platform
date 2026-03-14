# MCP: playwright

## 基本資訊

| 項目 | 值 |
|------|----|
| Server key | `playwright` |
| Package | `@playwright/mcp@latest` (npm) |
| Runtime | `npx` |
| Docs | https://playwright.dev |

## 功能特性

- **真實瀏覽器渲染**：執行 JavaScript，發現 curl 無法偵測的執行時錯誤
- **可存取性快照**：`playwright-browser_snapshot` 返回 ARIA 樹，適合可靠的元素互動
- **視覺驗證**：截圖確認 UI 渲染結果
- **多瀏覽器支援**：Chrome/Chromium、Firefox、WebKit、Edge
- **網路監控**：追蹤頁面發出的 API 請求
- **對話框處理**：處理 alert/confirm/prompt 對話框
- **檔案上傳**：支援檔案上傳操作
- **多分頁管理**：列出、切換、開啟、關閉 browser tabs

## 工具列表

### 導航與頁面狀態
| 工具 | 用途 |
|------|------|
| `playwright-browser_navigate` | 導航到 URL |
| `playwright-browser_navigate_back` | 返回上一頁 |
| `playwright-browser_snapshot` | 取得可存取性快照（互動前必呼叫） |
| `playwright-browser_take_screenshot` | 截圖（全頁或元素） |
| `playwright-browser_wait_for` | 等待文字出現/消失或指定秒數 |

### 互動
| 工具 | 用途 |
|------|------|
| `playwright-browser_click` | 點擊元素（左/右/中鍵，支援雙擊） |
| `playwright-browser_type` | 輸入文字（支援逐字輸入觸發事件） |
| `playwright-browser_fill_form` | 一次填寫多個表單欄位 |
| `playwright-browser_select_option` | 選擇下拉選項 |
| `playwright-browser_hover` | 懸停在元素上 |
| `playwright-browser_drag` | 拖放操作 |
| `playwright-browser_press_key` | 按下鍵盤按鍵 |

### 診斷
| 工具 | 用途 |
|------|------|
| `playwright-browser_console_messages` | 取得 console 訊息（error/warning/info/debug） |
| `playwright-browser_network_requests` | 取得網路請求記錄 |
| `playwright-browser_evaluate` | 執行 JavaScript（頁面或元素） |

### 管理
| 工具 | 用途 |
|------|------|
| `playwright-browser_tabs` | 管理瀏覽器分頁（list/new/close/select） |
| `playwright-browser_resize` | 調整瀏覽器視窗大小 |
| `playwright-browser_close` | 關閉瀏覽器 |
| `playwright-browser_handle_dialog` | 處理對話框（accept/dismiss） |
| `playwright-browser_file_upload` | 上傳檔案 |
| `playwright-browser_install` | 安裝瀏覽器（若未安裝時使用） |
| `playwright-browser_run_code` | 執行 Playwright 程式碼片段 |

## 應用場景

### 1. Next.js 頁面驗證（本專案重點）
```
playwright-browser_navigate("http://localhost:9002")
playwright-browser_snapshot()                          // 取得頁面結構
playwright-browser_console_messages(level="error")    // 檢查執行時錯誤
playwright-browser_take_screenshot(type="png")        // 視覺確認
```

### 2. UI 互動測試
```
// 測試表單提交
playwright-browser_fill_form([{name: "Email", ref: "...", type: "textbox", value: "test@example.com"}])
playwright-browser_click(ref="submit-button")
playwright-browser_wait_for(text="Success")
```

### 3. Hydration 問題偵測
```
// curl 無法偵測，playwright 可以
playwright-browser_navigate("http://localhost:9002/dashboard")
playwright-browser_console_messages(level="error")
→ 找到 "Hydration failed because..." 錯誤
```

## 與 next-devtools 的分工

| 使用 playwright | 使用 next-devtools |
|----------------|-------------------|
| 瀏覽器操作和截圖 | Next.js 伺服器診斷 |
| 客戶端 JavaScript 錯誤 | 編譯錯誤和路由資訊 |
| UI 渲染驗證 | Build status 和 cache 管理 |
| E2E 使用者流程 | 執行時 metadata 分析 |

## 注意事項

- 每次導航後必須呼叫 `playwright-browser_snapshot` 才能取得最新的 ref
- 使用最近一次 snapshot 的 ref，不要用舊的 ref 互動
- Next.js 專案優先使用 `next-devtools` 診斷，playwright 作為行為和視覺驗證
