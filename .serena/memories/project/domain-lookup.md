# Domain Lookup Table / 領域對照表

> **Purpose / 用途**  
> This file has three jobs:  
> 1. **Route** — find the right Domain for any new feature  
> 2. **Decide** — answer the 20 architectural questions that determine Domain boundary, Aggregate, Event design, Service boundary, and Data ownership  
> 3. **Merge / Split** — rules for when to combine or separate Domains  
>
> 新增功能時，先用三個核心問題路由，再用 20 個架構判斷問題精確定位邊界。

---

## ① Quick Reference / 快速對照表

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

## ② 三個最重要的架構問題（先問這三個）

在深入 20 個問題之前，先回答這三個問題來快速定位領域：

```
問題 1：這是在描述「誰」？
  → 涉及身份 / 認證 / 帳戶本身
  → 指向 identity 或 account

問題 2：這是在描述「誰擁有什麼」？
  → 涉及所有權、服務訂閱、成員關係、資源路徑
  → 指向 account 或 namespace

問題 3：這是在描述「一起做什麼」？
  → 涉及協作、流程、執行、搜尋、通知
  → 指向 workspace / work / fork / collaboration / search / notification / social / achievement
```

若三個問題仍無法確定，繼續使用下方 20 個問題精確判斷。

---

## ③ 20 個架構判斷問題

### 一、Domain 邊界判斷（Q1–Q9）

**Q1: 這是在描述「誰」嗎？**
> 如果功能的核心主詞是「一個人、一個使用者、一個帳戶身份」

| 是 | 否 |
|---|---|
| → **identity**（認證身份：你是誰）<br>→ **account**（帳戶主體：你有什麼） | 繼續下一個問題 |

*範例：「登入流程」→ identity；「帳戶 Handle 顯示名稱」→ account*

---

**Q2: 這是在描述「誰擁有服務或資源」嗎？**
> 功能的核心是訂閱、方案、容量、成員資格、資源路徑

| 是 | 否 |
|---|---|
| → **account**（Plan / Subscription / Team / Membership）<br>→ **namespace**（Handle → URL path ownership）<br>→ **settlement**（計費金額的歸屬） | 繼續 |

*範例：「查看我的訂閱方案」→ account；「解析 /user/my-ws 路徑」→ namespace*

---

**Q3: 這是在描述「人一起做什麼事情」嗎？**
> 功能涉及多人協作、流程推進、互動行為

| 是 | 否 |
|---|---|
| → **collaboration**（評論 / 在場 / 協同編輯）<br>→ **workspace**（CR / QA / Baseline 流程）<br>→ **work**（WorkItem 指派與執行） | 繼續 |

*範例：「在 Issue 上留言」→ collaboration；「提交 CR 審核」→ workspace*

---

**Q4: 這是在描述「資料或資源本身」嗎？**
> 功能的核心是某個工件（文件、工作項目、分支、命名空間）的生命周期管理

| 是 | 否 |
|---|---|
| → **file**（文件 / 版本 / 內容萃取）<br>→ **work**（WorkItem / Milestone）<br>→ **fork**（Fork / MergeProposal）<br>→ **namespace**（Slug reservation） | 繼續 |

*範例：「上傳並解析 PDF」→ file；「建立規劃分支」→ fork*

---

**Q5: 這是在描述「流程或執行」嗎？**
> 功能推進某個有狀態的業務流程（審核、排班、結算）

| 是 | 否 |
|---|---|
| → **workspace**（WBS / Issue / CR / QA / Acceptance / Baseline）<br>→ **workforce**（排班 / 容量規劃）<br>→ **settlement**（款項計算 / 結算執行） | 繼續 |

*範例：「執行 QA 簽核」→ workspace；「確認付款」→ settlement*

---

**Q6: 這是在描述「通知或訊息」嗎？**
> 功能的目標是傳遞事件通知給使用者

| 是 | 否 |
|---|---|
| → **notification**（收件匣 / 推播 / Email 偏好） | 繼續 |

> ⚠️ 注意：**觸發通知的業務邏輯不屬於 notification**。由 source module 發布 Domain Event，notification 訂閱後派送。

*範例：「查看未讀通知」→ notification；「PR 被 merged 時通知相關人」→ workspace 發事件，notification 派送*

---

**Q7: 這是在描述「搜尋或查詢能力」嗎？**
> 功能是讓使用者找到分散在各 Domain 的工件

| 是 | 否 |
|---|---|
| → **search**（全文 / 語意搜尋 / 自動補全 / 跨 BC 索引） | 繼續 |

> ⚠️ 過濾/排序屬於各 source module 的 query；search 只處理跨 BC 統一搜尋。

---

**Q8: 這是在描述「安全或監控」嗎？**
> 功能涉及操作紀錄、政策執行、合規性

| 是 | 否 |
|---|---|
| → **audit**（稽核日誌 / PolicyRule / ComplianceReport） | 繼續 |

> ⚠️ 角色授權（MemberRole）屬於 **account**；audit 只記錄「發生了什麼、是否合規」。

---

**Q9: 這是在描述「金錢或計費」嗎？**
> 功能涉及款項計算、AR/AP 記帳、結算

| 是 | 否 |
|---|---|
| → **settlement** | 繼續 → 回到 Q1 或考慮 social / achievement |

---

### 二、Aggregate 判斷（Q10–Q12）

用來決定一個概念是「Aggregate Root」還是「子聚合 / Value Object」。

**Q10: 這個資料是否有唯一生命周期？**
> 它可以被獨立建立、讀取、刪除嗎？

| 是 | 否 |
|---|---|
| 這是一個 **Aggregate Root**（有自己的 Repository） | 這是子實體或 Value Object，附屬於某個 Aggregate |

*範例：WorkItem 有獨立生命周期 → Aggregate Root；WorkItem 的 StatusHistory 依附於 WorkItem → 子實體*

---

**Q11: 是否有「一致性邊界」？**
> 哪些資料必須在同一個事務中保持一致？

| 說明 | 結論 |
|---|---|
| 兩個概念必須在同一個事務中更新 | 它們應在同一個 Aggregate 內 |
| 兩個概念可以非同步最終一致 | 它們是不同的 Aggregate（用 Domain Event 同步） |

*範例：WorkItem 與其 SubTask 若需原子更新 → 同一 Aggregate；WorkItem 與 AuditEntry → 不同 Aggregate，透過 Event 同步*

---

**Q12: 是否需要原子更新？**
> 這個操作必須全部成功或全部失敗（ACID）？

| 是 | 否 |
|---|---|
| 放進同一個 Aggregate Root，由 Domain Service 協調 | 考慮 Saga / Event-driven eventual consistency |

---

### 三、事件設計判斷（Q13–Q14）

**Q13: 這個行為是否會影響其他 Domain？**
> 某個 Domain 的操作完成後，其他 Domain 需要做出反應嗎？

| 是 | 否 |
|---|---|
| 在 source Domain 發布 **Domain Event**（如 `WorkItemCompleted`）；target Domain 訂閱並異步處理 | 操作結果只在本 Domain 內使用，不需要事件 |

*範例：`WorkItemCompleted` → notification 訂閱派送通知；`BadgeUnlocked` → account 訂閱更新 AccountBadge 展示*

---

**Q14: 這個行為是否需要異步處理？**
> 操作完成後，後續工作可以在背景執行（不阻塞使用者）？

| 是 | 否 |
|---|---|
| 使用 Domain Event + EventBus（位於 `src/infrastructure/`） | 同步執行，在 Application Layer Use Case 中完成 |

> EventBus 是 Infrastructure，不是 Domain Module。事件定義在 source module 的 `domain.*/_events.ts`。

---

### 四、服務邊界判斷（Q15–Q17）

**Q15: 這個功能是否依賴多個 Domain？**
> 實作時需要從多個 Domain 讀取資料或呼叫多個 Domain 的 Use Case？

| 是 | 否 |
|---|---|
| → **Application Service**（在調用端的 Application Layer 組合多個 Domain 的 Use Case） | → 在單一 Domain 的 Use Case 內實作 |

*範例：「建立 Workspace 並自動保留 Slug」→ Application Service 呼叫 workspace + namespace 兩個模組*

---

**Q16: 這個功能是否只是資料存取（CRUD）？**
> 沒有業務規則，只是讀取或儲存資料？

| 是 | 否 |
|---|---|
| → **Repository Layer**（`infra.firestore/_repository.ts`） | → Use Case（包含業務邏輯） |

---

**Q17: 這個功能是否是外部系統整合？**
> 涉及第三方 API、Firebase、外部 Queue、AI 模型？

| 是 | 否 |
|---|---|
| → **Infrastructure Layer**（`infra.*/` 適配器） | → 在 Domain / Application Layer |

*範例：Firebase Storage 存取 → file.module/infra.storage；OpenAI 嵌入向量 → file.module/infra.ai-extract*

---

### 五、資料歸屬判斷（Q18–Q20）

**Q18: 誰是這個資料的「唯一真實來源（Single Source of Truth）」？**
> 哪個 Domain 負責這份資料的寫入、驗證、版本管理？

| 判斷方式 | 結論 |
|---|---|
| 找出哪個 Domain 擁有這份資料的「寫入 Port」 | 那個 Domain 是 Owner；其他 Domain 只能透過事件或查詢 API 讀取 |

*範例：Badge 由 achievement 解鎖（寫入 `IAccountBadgeWritePort`），但 Badge 展示資料由 account 擁有*

---

**Q19: 其他 Domain 是否只需要讀取？**
> 某個 Domain 需要看到這份資料，但不需要修改它？

| 是 | 否 |
|---|---|
| → 提供 **Read Port** 或透過 **Domain Event** 投影到讀取側 | → 該 Domain 是 Co-Owner，需要拆清楚寫入責任 |

*範例：social 需要顯示 Account 名稱 → 透過 `IAccountSocialReadPort` 讀取；不得直接 import account.module 內部*

---

**Q20: 這個資料是否跨 Domain？**
> 資料需要在多個 Domain 之間共享或同步？

| 是 | 否 |
|---|---|
| → 確立一個 **Owner Domain**（SSOT），其他 Domain 透過事件訂閱建立**本地投影（Read Model）** | → 資料屬於單一 Domain，直接在該 Domain 的 Aggregate 內管理 |

*範例：SearchIndex 是跨 BC 的讀取投影——search.module 訂閱所有 Domain 的 Event，建立本地索引*

---

## ④ Domain 合併 vs 拆分規則

### 何時應該**合併**兩個 Domain？

| 條件 | 範例 |
|---|---|
| 兩個概念有相同的一致性邊界（必須原子更新） | User Profile 與 Account → 合併進 account |
| 一個概念是另一個的從屬（Sub-Aggregate）| Membership 與 Team → 合併進 account（org 子聚合） |
| 兩個概念的生命周期完全一致（一起建立、一起刪除）| AccountBadge 展示 → account 的 AccountProfile 子聚合 |
| 分開後需要跨 BC 事務，但業務上不允許最終一致 | 若 A 和 B 必須同時成功才有意義 → 合併 |

### 何時應該**拆分**成獨立 Domain？

| 條件 | 範例 |
|---|---|
| 兩個概念有不同的寫入責任（不同 Owner） | namespace 從 org 拆出，因 personal 帳戶也需要 |
| 兩個概念的變更頻率差異極大 | search index 更新頻率遠高於 workspace 結構 |
| 一個概念被多個 Domain 消費（共享依賴） | namespace 同時被 identity / account / workspace 依賴 |
| 概念的「語意」在不同上下文有不同含義 | org.module 的「User」與 account.module 的「Account」語意不同 → 統一為 account |
| 安全/合規需要獨立的存取控制 | audit 必須 append-only，不能與其他業務資料混用 |

---

## ⑤ Detailed Routing Guide / 詳細路由指引

### 身份與帳戶層

**`identity`** — 你是誰？
- ✅ 登入/登出、密碼重設、OAuth Provider 連結、Session 更新、JWT Claims 生成
- ❌ 帳戶設定 → `account`；角色授權 → `account` + `audit`

**`account`** — 你擁有什麼？
- ✅ 建立個人/組織帳戶、編輯資料、訂閱方案、Team/Membership 管理、徽章展示
- ❌ 認證身份 → `identity`；Slug → `namespace`；徽章規則 → `achievement`

### 路徑與資源層

**`namespace`** — 路徑怎麼解析？
- ✅ Slug 保留/釋放、Handle 對應 Namespace、路徑解析 API
- ❌ Workspace 內容 → `workspace`

**`workspace`** — 專案範疇與治理
- ✅ 建立 Workspace、WBS、Issue、CR、QA 簽核、Baseline
- ❌ WorkItem 指派 → `work`；分支 → `fork`；評論 → `collaboration`

### 執行層

**`work`** — 工作項目執行
- ✅ WorkItem CRUD、Milestone、依賴關係、指派
- ❌ WBS 規劃 → `workspace`；分支 → `fork`

**`fork`** — 規劃分支
- ✅ Fork Workspace、分支規劃、MergeProposal
- ❌ 正式 CR → `workspace`

**`workforce`** — 排班與容量
- ✅ 排班計畫、工作量分配、容量約束管理

**`settlement`** — 結算
- ✅ AR/AP 記錄、結算執行、帳款查詢

### 協作層

**`collaboration`** — 一起做
- ✅ 留言、@mention、Emoji 回應、即時在場、協同編輯
- ❌ 正式審查 → `workspace` CR/QA；通知 → `notification`

**`file`** — 資料與文件
- ✅ 上傳/版本/刪除、DocParse、AI 萃取

### 跨領域服務層

**`search`** — 找它
- ✅ 全文/語意搜尋、自動補全、跨 BC 索引
- ❌ 過濾/排序 → source module 的 query

**`audit`** — 監控與合規
- ✅ 稽核日誌、PolicyRule、ComplianceReport
- ❌ 角色授權 → `account` MemberRole

**`notification`** — 通知
- ✅ 收件匣、通知偏好、推播/Email 派送
- ❌ 觸發通知的業務邏輯 → source module 發 Domain Event

**`social`** — 社交圖譜
- ✅ Follow/Star/Watch、Feed、探索
- ❌ 帳戶資料 → `account`

**`achievement`** — 成就與徽章
- ✅ AchievementRule 定義、評估、BadgeUnlock
- ❌ 徽章展示 → `account` AccountProfile

---

## ⑥ Feature Routing Flowchart / 功能路由流程

```
步驟一：先問三個核心問題
  Q1: 這是「誰」？           → identity / account
  Q2: 這是「誰擁有什麼」？   → account / namespace / settlement
  Q3: 這是「一起做什麼」？   → workspace / work / fork / collaboration

步驟二：用 Q4–Q9 排除跨領域服務
  Q4: 資料/資源本身     → file / work / fork / namespace
  Q5: 流程/執行         → workspace / workforce / settlement
  Q6: 通知              → notification
  Q7: 搜尋              → search
  Q8: 安全/監控         → audit
  Q9: 金錢              → settlement

步驟三：用 Q10–Q12 確認 Aggregate Root
  唯一生命周期 → Aggregate Root
  依附於另一概念 → 子實體 / Value Object

步驟四：用 Q13–Q14 決定是否需要 Domain Event
  影響其他 Domain → 發佈 Domain Event
  需要異步 → EventBus (Infrastructure)

步驟五：用 Q15–Q17 確認程式碼放在哪一層
  依賴多個 Domain → Application Service
  純資料存取 → Repository
  外部系統 → Infrastructure Adapter

步驟六：用 Q18–Q20 確認資料歸屬
  SSOT Owner → 寫入 Port 在該 Domain
  只讀 → Read Port 或 Domain Event 投影
  跨 Domain → Owner + 讀取側 Read Model
```

---

> 最後更新：docs: enhance domain-lookup with 20 architectural questions + merge/split rules  
> 對應 Serena 記憶：`project/architecture.md`
