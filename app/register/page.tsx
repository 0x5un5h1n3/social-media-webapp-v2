"use client"; // Mark this file as a Client Component

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation"; // Import router for navigation
import toast from "react-hot-toast"; // Import toast for notifications

const Register = () => {
  // State for username, email, password, and password confirmation inputs
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Initialize router for navigation
  const router = useRouter();

  // Function to validate password
  const validatePassword = (password: string) => {
    const minLength = 8; // Minimum length
    const hasUpperCase = /[A-Z]/.test(password); // At least one uppercase letter
    const hasLowerCase = /[a-z]/.test(password); // At least one lowercase letter
    const hasNumbers = /\d/.test(password); // At least one number
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password); // At least one special character

    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChars
    );
  };

  // Handle form submission
  const handleSubmit = async (e: { preventDefault: () => void }) => {
    // Prevent default form submission behavior
    e.preventDefault();

    // Check if passwords match
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Validate password strength
    if (!validatePassword(password)) {
      toast.error(
        "Password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and special characters."
      );
      return;
    }

    // Show loading toast
    const loadingToast = toast.loading("Registering...");

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
      // Handle specific error messages
      if (error.response && error.response.data) {
        const { message } = error.response.data;
        // Display specific error messages from the server
        if (message) {
          toast.error(message); // Show the specific error message
        } else {
          toast.error("An unknown error occurred.");
        }
      } else {
        toast.error("Error registering user");
      }
    } finally {
      // Dismiss loading toast
      toast.dismiss(loadingToast);
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
        <div className="glass p-10 flex flex-col items-center rounded-3xl shadow-lg">
          {/* Page Title */}
          <div className="title flex flex-col items-center mb-6">
            <h4 className="text-5xl font-bold">Create Account</h4>
            <span className="py-4 text-xl w-2/3 text-center text-gray-500">
              Connect with us and start your journey!
            </span>
          </div>

          {/* Registration Form */}
          <form className="w-full" onSubmit={handleSubmit}>
            <div className="flex flex-col items-center gap-6">
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

              {/* Confirm Password Input */}
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                required
                className="textbox"
              />

              {/* Submit Button */}
              <button type="submit" className="btn">
                Register
              </button>
            </div>

            {/* Login Link */}
            <div className="text-center py-4">
              <span className="text-gray-500">
                Already have an account?{" "}
                <a href="/login" className="text-[#ff3030]">
                  Login Here
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
