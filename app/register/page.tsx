"use client"; // Mark this file as a Client Component

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    try {
      // Get the reCAPTCHA token
      const token = await getReCAPTCHAToken();

      await axios.post("/api/auth/register", {
        username,
        email,
        password,
        captchaToken: token,
      });
      alert("Registration successful");
      router.push("/login"); // Redirect to login page after registration
    } catch (error) {
      alert("Error registering user");
    }
  };

  const getReCAPTCHAToken = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      window.grecaptcha
        .execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!, {
          action: "submit",
        })
        .then((token: string) => {
          // Explicitly define the type for token
          resolve(token);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  return (
    <div>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
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
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
