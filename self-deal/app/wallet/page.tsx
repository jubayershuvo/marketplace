import FreelancerWallet from "@/components/Wallet";
import { connectDB } from "@/lib/mongodb";

export default async function Wallet() {
    
try {
    const db = await connectDB();

    const data = await db.collection("settings").findOne({});
    const WITHDRAWAL_CONSTANTS: {
      MIN_WITHDRAWAL_AMOUNT: number;
      WITHDRAWAL_FEE_PERCENTAGE: number;
      MIN_WITHDRAWAL_FEE: number;
    } = {
      MIN_WITHDRAWAL_AMOUNT: data?.min_withdraw_amount || 0,
      WITHDRAWAL_FEE_PERCENTAGE: data?.withdraw_fee_percentage || 0,
      MIN_WITHDRAWAL_FEE: data?.min_fee || 0,
    };
    return <FreelancerWallet WITHDRAWAL_CONSTANTS={WITHDRAWAL_CONSTANTS} />;
  } catch (error) {
    return <div>Error</div>;
  }
}
