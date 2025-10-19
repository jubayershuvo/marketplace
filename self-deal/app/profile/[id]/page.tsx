import ProfilePage from "@/components/ProfilePage";

export default async function Profile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ProfilePage id={id} />;
}
