import PaymentPage from "@/components/PaymentPage";
import { connectDB } from "@/lib/mongodb";
export default async function Payment({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = await connectDB();
  const data = await db.collection("settings").findOne({});
  return (
    <PaymentPage
      id={id}
      paymentNumbers={{ nagad: data?.nagad, bkash: data?.bkash }}
    />
  );
}
