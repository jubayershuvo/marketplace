import DeliverOrderPage from "../../../components/Delivery";

export default async function Page({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  return <DeliverOrderPage orderId={orderId} />;
}
