"use client"; // Mark this file as a Client Component

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation"; // Import from next/navigation
import toast from "react-hot-toast"; // Import toast for notifications

const Login = () => {
  // State for email and password inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [usernameInitial, setUsernameInitial] = useState(""); // State for username initial

  // Initialize router for navigation
  const router = useRouter();

  const handleSubmit = async (e) => {
    // Prevent default form submission behavior
    e.preventDefault();

    // Show loading toast
    const loadingToast = toast.loading("Logging in...");

    try {
      // Send login request to the server
      const response = await axios.post("/api/auth/login", { email, password });

      // Store authentication token in local storage
      localStorage.setItem("token", response.data.token);

      // Get user ID from response
      const userId = response.data.userId;

      // Fetch full user data using the user ID
      const userResponse = await axios.get(`/api/users/${userId}`);

      // Store user data in local storage
      localStorage.setItem("user", JSON.stringify(userResponse.data));

      // Show success notification
      toast.success("Login successful");

      // Redirect to posts page after successful login
      router.push("/posts");
    } catch (error) {
      // Show error notification if login fails
      const errorMessage = error.response?.data?.message || "Error logging in";
      toast.error(errorMessage);
    } finally {
      // Dismiss loading toast
      toast.dismiss(loadingToast);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F9F5F0] to-[#E8E4D9] p-4">
      <div className="w-full max-w-md">
        <div className="glass p-10 flex flex-col items-center rounded-3xl shadow-lg">
          <div className="title flex flex-col items-center mb-6">
            <h4 className="text-5xl font-bold">Hello Again!</h4>
            <span className="py-4 text-xl w-2/3 text-center text-gray-500">
              Explore More by connecting with us.
            </span>
          </div>

          {/* Login form */}
          <form className="w-full" onSubmit={handleSubmit}>
            <div className="profile flex justify-center py-4">
              <div className="w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xl">
                {usernameInitial || "?"}
              </div>
            </div>
            <div className="flex flex-col items-center gap-6">
              {/* Email input */}
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setUsernameInitial(e.target.value.charAt(0).toUpperCase());
                }}
                placeholder="Email"
                required
                className="textbox"
              />

              {/* Password input */}
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="textbox"
              />

              {/* Submit button */}
              <button type="submit" className="btn">
                Let's Go
              </button>
            </div>

            {/* Register link */}
            <div className="text-center py-4">
              <span className="text-gray-500">
                Don't have an account?{" "}
                <a href="/register" className="text-[#ff3030]">
                  Register Now
                </a>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
