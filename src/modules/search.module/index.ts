// search.module — Public API barrel
// Bounded Context: Search / 全域搜尋
export type { SearchResultDTO } from "./core/_use-cases";
export { indexDocument, executeSearch } from "./core/_use-cases";
export type { ISearchIndexRepository, ISearchQueryPort } from "./domain.search/_ports";
export { GlobalSearchDialog } from "./_components/global-search-dialog";
export { SearchResultsView } from "./_components/search-results-view";
export { SearchFilterBar } from "./_components/search-filter-bar";
export { useSearchHistory } from "./_components/use-search-history";
