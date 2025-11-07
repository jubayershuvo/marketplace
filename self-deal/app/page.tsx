import HomePage from "@/components/HomePage";
import { connectDB } from "@/lib/mongodb";
import UserModel from "@/models/User";
import { User } from "@/types/Profile";

export default async function Home() {
  await connectDB();
  const users = await UserModel.find({
    userType: "freelancer",
  })
    .sort({ avgRating: -1 })
    .limit(3)
    .lean();

  // Convert MongoDB objects to plain objects
  const serializedUsers = users.map(user => ({
    ...user,
    _id: user._id.toString(),
  }));

  return <HomePage freelancers={serializedUsers as User[]} />;
}