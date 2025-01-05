"use client"; // Add this line at the top of the file

import React, { useEffect, useState } from "react";
import PostForm from "../../components/PostForm";
import PostsList from "../../components/PostsList";
import axios from "axios";
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import toast from "react-hot-toast";
import { FiLogOut } from "react-icons/fi";

// Profile Picture Component
const ProfilePicture = ({ username }) => {
  const initial = username ? username.charAt(0).toUpperCase() : "?";

  return (
    <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xl">
      {initial}
    </div>
  );
};

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [username, setUsername] = useState("");
  const [user, setUser] = useState(null); // Add state for user
  const router = useRouter(); // Initialize router

  // Define the fetchPosts function
  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/posts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(response.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
      // Redirect to login if unauthorized
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        // router.push("/login");
      }
    }
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
    // router.push("/login");
    toast.success("Logged out successfully");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F5F0] to-[#E8E4D9] flex justify-center">
      <div className="w-full max-w-[475px] bg-white/10 shadow-lg min-h-screen">
        <div className="container mx-auto px-4 py-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 border-b pb-4 border-gray-200">
            {/* Conditional Rendering for User/Guest */}
            {user ? (
              <div className="flex items-center space-x-4">
                <ProfilePicture username={username} />
                <div>
                  <p className="text-sm text-gray-600">Your Social Feed</p>
                  <h1 className="text-xl font-bold text-gray-800">
                    Welcome, {username}! {/* Display username */}
                  </h1>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <div>
                  <p className="text-sm text-gray-600">Your Social Feed</p>
                  <h1 className="text-2xl font-bold text-gray-800">
                    Welcome, Guest!
                  </h1>
                </div>
              </div>
            )}

            {/* Logout/Login Button */}
            {user ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors"
                >
                  <FiLogOut className="text-xl" />
                  <span className="text-sm">Logout</span>
                </button>{" "}
                {/* Logout button */}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => router.push("/login")}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Please login to continue
                </button>{" "}
                {/* Link to login page */}
              </div>
            )}
          </div>

          {/* Show PostForm Section - only for logged-in users */}
          {user && (
            <div className="mb-6">
              <PostForm fetchPosts={fetchPosts} />
            </div>
          )}

          {/* Posts List */}
          <PostsList
            posts={posts}
            fetchPosts={fetchPosts}
            user={user}
            isGuest={!user}
          />
        </div>
      </div>
    </div>
  );
};

export default Posts;
