import type { Metadata } from "next";
import { SearchResultsView } from "@/modules/search.module/_components/search-results-view";

export const metadata: Metadata = {
  title: "搜尋 — 玄武平台",
};

export default function SearchPage() {
  return <SearchResultsView />;
}
