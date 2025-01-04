"use client"; // Add this line at the top of the file

import React, { useEffect, useState } from "react";
import PostForm from "../../components/PostForm";
import PostsList from "../../components/PostsList";
import axios from "axios";
import { useRouter } from "next/navigation"; // Import useRouter for navigation

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [username, setUsername] = useState("");
  const [user, setUser] = useState(null); // Add state for user
  const router = useRouter(); // Initialize router

  // Define the fetchPosts function
  const fetchPosts = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get("/api/posts", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setPosts(response.data);
  };

  // Fetch posts when the component mounts
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user")); // Retrieve user info from local storage
    if (userData) {
      setUsername(userData.username); // Set the username
      setUser(userData); // Set the user data
    }
    fetchPosts();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUsername(""); // Clear username
    setUser(null); // Clear user data
  };

  return (
    <div>
      <h1>Manage Your Posts</h1>
      {user ? (
        <>
          <h2>Welcome, {username}!</h2> {/* Display username */}
          <button onClick={handleLogout}>Logout</button> {/* Logout button */}
          <PostForm fetchPosts={fetchPosts} />{" "}
          {/* Show PostForm only if logged in */}
        </>
      ) : (
        <>
          <h2>Welcome Guest!</h2> {/* Display welcome message for guests */}
          <button onClick={() => router.push("/login")}>Login</button>{" "}
          {/* Link to login page */}
        </>
      )}
      <PostsList posts={posts} fetchPosts={fetchPosts} user={user} />{" "}
      {/* Pass user to PostsList */}
    </div>
  );
};

export default Posts;
