"use client"; // Mark this file as a Client Component

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation"; // Import router for navigation
import toast from "react-hot-toast"; // Import toast for notifications

const Register = () => {
  // State for username input
  const [username, setUsername] = useState("");

  // State for email input
  const [email, setEmail] = useState("");

  // State for password input
  const [password, setPassword] = useState("");

  // Initialize router for navigation
  const router = useRouter();

  // Handle form submission
  const handleSubmit = async (e: { preventDefault: () => void }) => {
    // Prevent default form submission behavior
    e.preventDefault();

    try {
      // Get the reCAPTCHA token for bot protection
      const token = await getReCAPTCHAToken();

      // Send registration request to the server
      await axios.post("/api/auth/register", {
        username,
        email,
        password,
        captchaToken: token, // Include reCAPTCHA token for verification
      });

      // Show success notification
      toast.success("Registration successful");

      // Redirect to login page after successful registration
      router.push("/login");
    } catch (error) {
      // Show error notification if registration fails
      toast.error("Error registering user");
    }
  };

  // Function to get reCAPTCHA token
  const getReCAPTCHAToken = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Execute reCAPTCHA and get verification token
      window.grecaptcha
        .execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!, {
          action: "submit", // Specify the action
        })
        .then((token: string) => {
          // Resolve promise with the token
          resolve(token);
        })
        .catch((error) => {
          // Reject promise if token generation fails
          reject(error);
        });
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F9F5F0] to-[#E8E4D9] p-4">
      <div className="w-full max-w-md">
        <div className="glass">
          {/* Page Title */}
          <div className="title flex flex-col items-center">
            <h4 className="text-5xl font-bold">Create Account</h4>
            <span className="py-4 text-xl w-2/3 text-center text-gray-500">
              Connect with us and start your journey!
            </span>
          </div>

          {/* Registration Form */}
          <form className="py-1" onSubmit={handleSubmit}>
            <div className="textbox flex flex-col items-center gap-6">
              {/* Username Input */}
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
                className="textbox"
              />

              {/* Email Input */}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="textbox"
              />

              {/* Password Input */}
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="textbox"
              />

              {/* Submit Button */}
              <button
                type="submit"
                className="btn bg-gradient-to-r from-[#6E7BFB] to-[#3B5FE0] hover:opacity-90 transition-all"
              >
                Register
              </button>
            </div>

            {/* Login Link */}
            <div className="text-center py-4">
              <span className="text-gray-500">
                Already have an account?{" "}
                <a href="/login" className="text-[#ff3030] font-bold">
                  Login Now
                </a>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
