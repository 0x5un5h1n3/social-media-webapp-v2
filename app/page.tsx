"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("token");
    router.push("/posts");
  }, [router]); // Add router to dependency array

  // Fallback UI while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F9F5F0] to-[#E8E4D9]">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Social Media Webapp</h1>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
