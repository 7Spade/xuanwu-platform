# Domain Lookup Table / 領域對照表

> **Purpose / 用途**
> When adding a new feature, find the row whose **核心問題** best matches what you are solving.
> That row's **Domain** is your implementation target.
> 新增功能時，找到最匹配的**核心問題**對應的**Domain**，即為目標模組。

---

## Quick Reference / 快速對照表

| Domain (`<name>.module`) | 核心問題（Core Problem） | 主要概念（Main Concepts） |
|--------------------------|--------------------------|---------------------------|
| `identity` | **你是誰？如何驗證身份？** | Credential · Session · IdentityProvider · AuthToken · JWTClaims |
| `account` | **你擁有什麼帳戶？帳戶有哪些服務與成員？** | Account · AccountType(personal\|org) · Plan · Subscription · Team · Membership · Handle · Badge |
| `namespace` | **你的路徑在哪裡？URL 如何解析到資源？** | Namespace · Slug · WorkspacePath · SlugAvailability |
| `workspace` | **你在管理什麼專案？專案的範疇與治理？** | Workspace · WBSTask · Issue · ChangeRequest(CR) · QA · Acceptance · Baseline |
| `file` | **你上傳了什麼文件？如何解析與萃取內容？** | File · FileVersion · DocParse · ObjExtract · IntelligenceResult |
| `work` | **你在執行什麼工作項目？進度與依賴關係？** | WorkItem · Milestone · Dependency · Status · Priority · Assignment |
| `fork` | **你想另開一條規劃分支嗎？如何合回主線？** | Fork · ForkDivergence · MergeProposal |
| `workforce` | **誰負責哪些工作？容量與排班如何安排？** | WorkforceSchedule · WorkAllocation · CapacityConstraint |
| `settlement` | **款項如何計算與結算？** | Settlement · AccountsReceivable(AR) · AccountsPayable(AP) |
| `notification` | **誰需要被通知？透過什麼管道？** | NotificationRule · InboxItem · NotificationDispatch · Channel(email\|push\|in-app) |
| `social` | **誰在關注誰？有什麼公開動態？** | SocialEdge · Follow · Star · Watch · Feed · FeedEntry · Discovery |
| `achievement` | **你達成了什麼成就？徽章如何解鎖？** | AchievementRule · Badge · AccountAchievementRecord · BadgeUnlock |
| `collaboration` | **你在討論什麼？誰在線？如何協作編輯？** | Comment · Thread · Reaction · Presence · CoEditSession · MentionList |
| `search` | **如何找到它？支援哪些搜尋範圍與過濾條件？** | SearchIndex · SearchQuery · SearchScope · SearchResultEntry · Suggestion |
| `audit` | **誰做了什麼？何時？是否符合政策規定？** | AuditEntry · PolicyRule · PolicyOutcome · ActorRef · ComplianceReport |

---

## Detailed Routing Guide / 詳細路由指引

### 身份與帳戶層 (Identity & Account Layer)

**`identity`**
- 核心問題：「這個請求是由哪個已驗證的使用者發出的？」
- 適用場景：登入、登出、密碼重設、OAuth Provider 連結、Session 更新、JWT Claims 生成
- 不適用場景：帳戶設定（→ `account`）、角色授權（→ `account` + `audit`）

**`account`**
- 核心問題：「這個帳戶擁有什麼？可以做什麼？有哪些成員？」
- 適用場景：建立個人/組織帳戶、編輯個人資料、訂閱方案管理、建立/管理 Team、邀請成員、徽章展示
- 不適用場景：驗證身份（→ `identity`）、命名空間（→ `namespace`）、徽章規則（→ `achievement`）

---

### 路徑與工作空間層 (Path & Workspace Layer)

**`namespace`**
- 核心問題：「`handle/workspace-slug` 這條路徑指向哪個 Workspace？」
- 適用場景：Slug 保留/釋放、帳戶 Handle 對應命名空間、路徑解析 API
- 不適用場景：Workspace 內容（→ `workspace`）

**`workspace`**
- 核心問題：「這個專案的範疇（WBS/Issue/CR）是什麼？治理流程（QA/Acceptance/Baseline）如何？」
- 適用場景：建立 Workspace、拆分 WBS 任務、建立 Issue、提交 CR、執行 QA 簽核、建立 Baseline
- 不適用場景：工作項目指派（→ `work`）、規劃分支（→ `fork`）、評論（→ `collaboration`）

---

### 執行與協作層 (Execution & Collaboration Layer)

**`work`**
- 核心問題：「這個工作項目的執行狀態/優先序/依賴關係是什麼？」
- 適用場景：建立/更新 WorkItem、設定里程碑、建立依賴關係、指派負責人
- 不適用場景：WBS 規劃（→ `workspace`）、規劃分支（→ `fork`）

**`fork`**
- 核心問題：「我想在不影響主工作空間的情況下，探索另一套規劃方案。」
- 適用場景：Fork 一個 Workspace、在 Fork 上變更規劃、提出 MergeProposal 合回主線
- 不適用場景：正式 CR（→ `workspace`）

**`collaboration`**
- 核心問題：「我想對這個工件留下評論、標記人員，或即時協作編輯。」
- 適用場景：在 Issue/WorkItem/File 上留言、@mention、回應 Emoji、即時在場、協同編輯
- 不適用場景：正式審查流程（→ `workspace` CR/QA）、通知派送（→ `notification`）

---

### 跨領域服務層 (Cross-Cutting Services)

**`search`**
- 核心問題：「使用者輸入關鍵字，要找哪個工件？」
- 適用場景：全文搜尋、語意搜尋、自動補全、跨模組索引更新
- 不適用場景：過濾/排序（在各 source module 的 query 中處理）

**`audit`**
- 核心問題：「這個操作是否符合政策？操作記錄是什麼？」
- 適用場景：稽核日誌查詢、政策規則管理、合規報告匯出、政策違規偵測
- 不適用場景：功能授權（→ `account` 的 MemberRole）

**`notification`**
- 核心問題：「這個事件要通知哪些人？透過什麼管道？」
- 適用場景：訂閱通知偏好、查看收件匣、推播/Email 派送設定
- 不適用場景：觸發通知的業務邏輯（由各 source module 發布 Domain Event，`notification` 訂閱並派送）

---

### 社交與成就層 (Social & Achievement Layer)

**`social`**
- 核心問題：「誰在關注這個帳戶或工作空間？有什麼公開動態？」
- 適用場景：Follow/Unfollow、Star/Unstar、Watch、個人首頁 Feed、探索/推薦
- 不適用場景：帳戶資料（→ `account`）

**`achievement`**
- 核心問題：「這個帳戶達成了什麼成就？哪些徽章應該解鎖？」
- 適用場景：定義成就規則、評估規則、解鎖徽章、查詢帳戶成就記錄
- 不適用場景：徽章展示（→ `account` 的 AccountProfile）

---

### 基礎設施層 (Infrastructure Layer)

**`file`**
- 核心問題：「這個文件的內容是什麼？如何解析並萃取結構化資訊？」
- 適用場景：上傳/版本化/刪除檔案、觸發文件解析、AI 萃取摘要/嵌入向量

**`workforce`**
- 核心問題：「誰（帳戶/成員）在哪段時間負責哪些工作？容量是否充足？」
- 適用場景：建立排班計畫、指派工作量、容量約束管理

**`settlement`**
- 核心問題：「這次服務/交付的款項如何計算與記帳？」
- 適用場景：建立 AR/AP 記錄、執行結算、查詢帳款明細

---

## Decision Flowchart / 決策流程

```
新功能屬於哪個 Domain？

1. 這功能涉及「登入、登出、Token、Provider」嗎？
   → identity

2. 這功能涉及「帳戶設定、訂閱、Team、成員管理、個人資料、徽章展示」嗎？
   → account

3. 這功能涉及「URL 路徑解析、Slug 保留」嗎？
   → namespace

4. 這功能涉及「建立專案、WBS、Issue、CR、QA、Baseline」嗎？
   → workspace

5. 這功能涉及「WorkItem 執行、Milestone、依賴關係」嗎？
   → work

6. 這功能涉及「規劃分支、Fork、MergeProposal」嗎？
   → fork

7. 這功能涉及「評論、@mention、在場、協同編輯」嗎？
   → collaboration

8. 這功能涉及「全文搜尋、語意搜尋、自動補全」嗎？
   → search

9. 這功能涉及「稽核日誌、政策規則、合規報告」嗎？
   → audit

10. 這功能涉及「通知偏好、收件匣、推播/Email」嗎？
    → notification

11. 這功能涉及「Follow/Star/Watch、公開動態 Feed」嗎？
    → social

12. 這功能涉及「成就規則評估、徽章解鎖」嗎？
    → achievement

13. 這功能涉及「文件上傳、解析、AI 萃取」嗎？
    → file

14. 這功能涉及「人員排班、工作量分配、容量管理」嗎？
    → workforce

15. 這功能涉及「款項計算、結算、AR/AP」嗎？
    → settlement
```

---

> 最後更新：feat: add collaboration/search/audit modules, delete org.module (15 modules total)
> 對應 Serena 記憶：`project/architecture.md`
