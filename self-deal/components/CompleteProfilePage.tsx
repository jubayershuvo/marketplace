"use client";
import { useAppSelector } from "@/lib/hooks";
import React, { useEffect, useState } from "react";
import CompleteFreelancerAccount from "./CompleteFreelancerAccount";
import { User } from "@/types/Profile";
import { useRouter } from "next/navigation";

function CompleteProfilePage() {
  const userAuth = useAppSelector((state) => state.userAuth);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (userAuth && userAuth.isLoggedIn) {
      setUser(userAuth.user);
    } else {
      router.push("/login");
    }
  }, [userAuth, router]);

  return (
    <>
      {user?.userType === "freelancer" && <CompleteFreelancerAccount />}
      {user?.userType === "client" && (
        <div className="min-h-screen">
          <h1>Complete Client Profile</h1>
        </div>
      )}
    </>
  );
}

export default CompleteProfilePage;
