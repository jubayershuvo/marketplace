import ViewGigPage from "@/components/ViewGigPage";


export const metadata = {
  title: "Gig Details",
  description: "View detailed information about the gig.",
};

export default async function Gig({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ViewGigPage  id = {id} />;
}
