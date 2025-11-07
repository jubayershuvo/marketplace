import HomePage from "@/components/HomePage";
import { connectDB } from "@/lib/mongodb";
import UserModel from "@/models/User";
import { User } from "@/types/Profile";

export default async function Home() {
  const db = await connectDB();
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
const categories = await db.collection("categories").find({}).toArray();
const categoyArray = categories.map((category) => category.label);
  return <HomePage freelancers={serializedUsers as User[]} categories={categoyArray} />;
}