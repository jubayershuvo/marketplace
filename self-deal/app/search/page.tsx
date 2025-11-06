import SearchResultPage from "@/components/SearchResultPage";

export default function Search({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const query = searchParams.q?.toString() || '';
    return (
        <SearchResultPage query={query} />
    );
}