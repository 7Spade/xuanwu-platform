# design-system — File Index

**層次**: 設計系統 / Design System
**職責**: 提供 UI 元件的四層結構（primitives → components → patterns → tokens），確保設計一致性。
**架構**: Four-tier hierarchy — `primitives`（raw shadcn/ui 元件）→ `components`（專案特定包裝）→ `patterns`（高階 UI 複合體）→ `tokens`（設計常數）。
**匯入規則**: 從對應層次匯入，例如 `import { Button } from "@/design-system/primitives"`，或直接使用 `@/design-system` barrel。

---

## `src/design-system/index.ts`
**描述**: 設計系統公開 API barrel，四層全匯出入口。
**函數清單**:
- `export * from './primitives'` — raw shadcn/ui 元件層
- `export * from './components'` — 專案特定包裝元件層
- `export * from './patterns'` — 高階 UI 複合體層
- `export * from './tokens'` — 設計 token 常數層

---

## Primitives 層（`src/design-system/primitives/`）

### `src/design-system/primitives/index.ts`
**描述**: Primitives 層 barrel，匯出所有 shadcn/ui 元件及 hooks。
**函數清單**:
- `export * from './ui/*'` — 所有 shadcn/ui 元件（56 個）
- `export * from './hooks/use-mobile'` — `useIsMobile` hook
- `export { cn } from './lib/utils'` — Tailwind class 合併工具

### `src/design-system/primitives/lib/utils.ts`
**描述**: Tailwind CSS class 合併工具 — 組合 `clsx` 和 `tailwind-merge`。
**函數清單**:
- `function cn(...inputs: ClassValue[]): string` — 合併並去重 Tailwind CSS class names

### `src/design-system/primitives/hooks/use-mobile.ts`
**描述**: 回應式行動裝置偵測 hook — 監聽 window resize，判斷目前視窗是否為行動裝置寬度（< 768px）。
**函數清單**:
- `function useIsMobile(): boolean` — 回傳目前是否為行動裝置視窗寬度

---

## Primitives UI 元件（`src/design-system/primitives/ui/`）

> 以下 56 個元件均為 shadcn/ui（New York style）自動生成元件，直接包裝對應的 Radix UI primitives 或第三方套件，並套用 Tailwind CSS 樣式。

### `accordion.tsx` — 手風琴展開/收合元件（Radix UI Accordion）
- `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`

### `alert-dialog.tsx` — 警告對話框元件，用於需要確認的破壞性操作（Radix UI AlertDialog）
- `AlertDialog`, `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogFooter`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogAction`, `AlertDialogCancel`

### `alert.tsx` — 靜態提示訊息橫幅（variant: default/destructive）
- `Alert`, `AlertTitle`, `AlertDescription`

### `aspect-ratio.tsx` — 固定寬高比容器（Radix UI AspectRatio）
- `AspectRatio`

### `avatar.tsx` — 使用者頭像（圖片 + 備援文字縮寫）
- `Avatar`, `AvatarImage`, `AvatarFallback`

### `badge.tsx` — 狀態/標籤 badge（variant: default/secondary/destructive/outline）
- `Badge`, `badgeVariants`

### `breadcrumb.tsx` — 頁面導覽 breadcrumb
- `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator`, `BreadcrumbEllipsis`

### `button-group.tsx` — 按鈕群組容器
- `ButtonGroup`

### `button.tsx` — 主要按鈕元件（variant: default/destructive/outline/secondary/ghost/link）
- `Button`, `buttonVariants`

### `calendar.tsx` — 日期選擇器日曆（react-day-picker）
- `Calendar`

### `card.tsx` — 卡片容器
- `Card`, `CardHeader`, `CardFooter`, `CardTitle`, `CardDescription`, `CardContent`

### `carousel.tsx` — 輪播元件（Embla Carousel）
- `Carousel`, `CarouselContent`, `CarouselItem`, `CarouselPrevious`, `CarouselNext`

### `chart.tsx` — 圖表容器與工具（Recharts 包裝）
- `ChartContainer`, `ChartTooltip`, `ChartTooltipContent`, `ChartLegend`, `ChartLegendContent`, `ChartStyle`

### `checkbox.tsx` — 核取方塊（Radix UI Checkbox）
- `Checkbox`

### `collapsible.tsx` — 可收合/展開區塊（Radix UI Collapsible）
- `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent`

### `combobox.tsx` — 可搜尋下拉選單（Command + Popover 組合）
- `Combobox`

### `command.tsx` — 命令面板/鍵盤導航搜尋（cmdk）
- `Command`, `CommandDialog`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem`, `CommandShortcut`, `CommandSeparator`

### `context-menu.tsx` — 右鍵選單（Radix UI ContextMenu）
- `ContextMenu`, `ContextMenuTrigger`, `ContextMenuContent`, `ContextMenuItem`, `ContextMenuCheckboxItem`, `ContextMenuRadioItem`, `ContextMenuLabel`, `ContextMenuSeparator`, `ContextMenuShortcut`, `ContextMenuGroup`, `ContextMenuPortal`, `ContextMenuSub`, `ContextMenuSubContent`, `ContextMenuSubTrigger`, `ContextMenuRadioGroup`

### `dialog.tsx` — 模態對話框（Radix UI Dialog）
- `Dialog`, `DialogPortal`, `DialogOverlay`, `DialogTrigger`, `DialogClose`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`

### `direction.tsx` — 文字方向提供者（RTL/LTR）
- `DirectionProvider`

### `drawer.tsx` — 抽屜/底部滑入面板（Vaul）
- `Drawer`, `DrawerPortal`, `DrawerOverlay`, `DrawerTrigger`, `DrawerClose`, `DrawerContent`, `DrawerHeader`, `DrawerFooter`, `DrawerTitle`, `DrawerDescription`

### `dropdown-menu.tsx` — 下拉式選單（Radix UI DropdownMenu）
- `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuCheckboxItem`, `DropdownMenuRadioItem`, `DropdownMenuLabel`, `DropdownMenuSeparator`, `DropdownMenuShortcut`, `DropdownMenuGroup`, `DropdownMenuPortal`, `DropdownMenuSub`, `DropdownMenuSubContent`, `DropdownMenuSubTrigger`, `DropdownMenuRadioGroup`

### `empty.tsx` — 空狀態佔位元件
- `Empty`

### `field.tsx` — 表單欄位容器（label + input + hint 組合）
- `Field`, `FieldLabel`, `FieldHint`, `FieldError`

### `form.tsx` — react-hook-form 整合表單元件
- `Form`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`, `FormField`, `useFormField`

### `hover-card.tsx` — 懸停預覽卡片（Radix UI HoverCard）
- `HoverCard`, `HoverCardTrigger`, `HoverCardContent`

### `input-group.tsx` — 輸入框群組（前綴/後綴組合）
- `InputGroup`, `InputGroupPrefix`, `InputGroupSuffix`

### `input-otp.tsx` — OTP/PIN 輸入框（input-otp）
- `InputOTP`, `InputOTPGroup`, `InputOTPSlot`, `InputOTPSeparator`

### `input.tsx` — 基礎文字輸入框
- `Input`

### `item.tsx` — 通用清單項目元件
- `Item`, `ItemIcon`, `ItemLabel`, `ItemBadge`

### `kbd.tsx` — 鍵盤按鍵顯示元件
- `Kbd`

### `label.tsx` — 表單標籤（Radix UI Label）
- `Label`

### `menubar.tsx` — 選單列（Radix UI Menubar）
- `Menubar`, `MenubarMenu`, `MenubarTrigger`, `MenubarContent`, `MenubarItem`, `MenubarSeparator`, `MenubarLabel`, `MenubarCheckboxItem`, `MenubarRadioGroup`, `MenubarRadioItem`, `MenubarPortal`, `MenubarSubContent`, `MenubarSubTrigger`, `MenubarGroup`, `MenubarSub`, `MenubarShortcut`

### `native-select.tsx` — 原生 HTML `<select>` 包裝
- `NativeSelect`

### `navigation-menu.tsx` — 導覽選單（Radix UI NavigationMenu）
- `NavigationMenu`, `NavigationMenuList`, `NavigationMenuItem`, `NavigationMenuContent`, `NavigationMenuTrigger`, `NavigationMenuLink`, `NavigationMenuIndicator`, `NavigationMenuViewport`

### `pagination.tsx` — 分頁導覽元件
- `Pagination`, `PaginationContent`, `PaginationItem`, `PaginationLink`, `PaginationPrevious`, `PaginationNext`, `PaginationEllipsis`

### `popover.tsx` — 浮動彈出層（Radix UI Popover）
- `Popover`, `PopoverTrigger`, `PopoverContent`, `PopoverAnchor`

### `progress.tsx` — 進度條（Radix UI Progress）
- `Progress`

### `radio-group.tsx` — 單選按鈕群組（Radix UI RadioGroup）
- `RadioGroup`, `RadioGroupItem`

### `resizable.tsx` — 可調整大小的面板群組（react-resizable-panels）
- `ResizablePanelGroup`, `ResizablePanel`, `ResizableHandle`

### `scroll-area.tsx` — 自訂滾動區域（Radix UI ScrollArea）
- `ScrollArea`, `ScrollBar`

### `select.tsx` — 下拉選擇器（Radix UI Select）
- `Select`, `SelectGroup`, `SelectValue`, `SelectTrigger`, `SelectContent`, `SelectLabel`, `SelectItem`, `SelectSeparator`, `SelectScrollUpButton`, `SelectScrollDownButton`

### `separator.tsx` — 分隔線（Radix UI Separator）
- `Separator`

### `sheet.tsx` — 側邊抽屜（Radix UI Dialog 變體）
- `Sheet`, `SheetPortal`, `SheetOverlay`, `SheetTrigger`, `SheetClose`, `SheetContent`, `SheetHeader`, `SheetFooter`, `SheetTitle`, `SheetDescription`

### `sidebar.tsx` — 側邊欄完整元件（帶 context, hook, 折疊狀態管理）
- `Sidebar`, `SidebarProvider`, `SidebarTrigger`, `SidebarContent`, `SidebarGroup`, `SidebarGroupLabel`, `SidebarGroupContent`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`, `SidebarMenuSub`, `SidebarMenuSubItem`, `SidebarMenuSubButton`, `SidebarMenuBadge`, `SidebarMenuSkeleton`, `SidebarMenuAction`, `SidebarSeparator`, `SidebarHeader`, `SidebarFooter`, `SidebarInset`, `SidebarRail`, `useSidebar`

### `skeleton.tsx` — 載入佔位骨架屏
- `Skeleton`

### `slider.tsx` — 滑桿輸入（Radix UI Slider）
- `Slider`

### `sonner.tsx` — Toast 通知（Sonner）
- `Toaster`

### `spinner.tsx` — 載入旋轉指示器
- `Spinner`

### `switch.tsx` — 開關切換（Radix UI Switch）
- `Switch`

### `table.tsx` — 資料表格
- `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableHead`, `TableRow`, `TableCell`, `TableCaption`

### `tabs.tsx` — 分頁標籤（Radix UI Tabs）
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`

### `textarea.tsx` — 多行文字輸入框
- `Textarea`

### `toggle-group.tsx` — 切換按鈕群組（Radix UI ToggleGroup）
- `ToggleGroup`, `ToggleGroupItem`

### `toggle.tsx` — 單一切換按鈕（Radix UI Toggle）
- `Toggle`, `toggleVariants`

### `tooltip.tsx` — 工具提示（Radix UI Tooltip）
- `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`

---

## Components 層（`src/design-system/components/`）

### `src/design-system/components/index.ts`
**描述**: Components 層 barrel — 專案特定包裝元件，建立在 primitives 之上，加入專案 i18n、主題、UX 規範。目前尚未定義元件（`export {}`）。
**函數清單**:
- *(目前為空，待擴充)*

---

## Patterns 層（`src/design-system/patterns/`）

### `src/design-system/patterns/index.ts`
**描述**: Patterns 層 barrel — 高階 UI 複合體，將 primitives 和 components 組合成可重複使用的互動模式（如登入表單、資料表格頁、Modal 流程）。目前尚未定義 patterns（`export {}`）。
**函數清單**:
- *(目前為空，待擴充)*

---

## Tokens 層（`src/design-system/tokens/`）

### `src/design-system/tokens/index.ts`
**描述**: Tokens 層 barrel — 設計 token 常數（色彩、間距、字體、圓角、陰影、z-index、動畫時長）。這些值與 `globals.css`/`tailwind.config.ts` 的 CSS custom properties 同步。目前尚未定義 token（`export {}`）。
**函數清單**:
- *(目前為空，待擴充；預計匯出 colorBrand、spacingBase 等常數)*
