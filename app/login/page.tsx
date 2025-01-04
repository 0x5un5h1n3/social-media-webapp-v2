"use client"; // Mark this file as a Client Component

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation"; // Import from next/navigation

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/auth/login", { email, password });
      localStorage.setItem("token", response.data.token);

      // Store user ID in local storage
      const userId = response.data.userId; // Get user ID from response
      const userResponse = await axios.get(`/api/users/${userId}`); // Fetch user data using the user ID
      localStorage.setItem("user", JSON.stringify(userResponse.data)); // Store user data

      alert("Login successful");
      router.push("/posts"); // Redirect to posts page after login
    } catch (error) {
      alert("Error logging in");
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
