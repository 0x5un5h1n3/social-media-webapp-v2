"use client"; // Add this line at the top of the file

import axios from "axios";
import { useEffect } from "react";
import { formatDate } from "../utils/formatDate"; // Import the formatDate function

const PostsList = ({ posts, fetchPosts, user }) => {
  const handleLike = async (postId) => {
    const token = localStorage.getItem("token");
    if (!user) return; // If user is not logged in, do nothing

    const userId = user._id; // Ensure to get the correct user ID
    console.log(`Liking post with ID: ${postId} by user ID: ${userId}`); // Log the like action
    try {
      const response = await axios.put(
        `/api/posts?id=${postId}`,
        { userId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Like response:", response.data); // Log the response from the server
      fetchPosts(); // Refresh the posts list after liking
    } catch (error) {
      console.error("Error liking post:", error); // Log any errors
    }
  };

  return (
    <div>
      <h2>Posts</h2>
      <ul>
        {posts.map((post) => (
          <li key={post._id}>
            <h3>{post.title}</h3>
            <p>{post.content}</p>
            <p>
              Posted by: {post.userId ? post.userId.username : "Unknown User"}
            </p>{" "}
            {/* Display username */}
            <p>Created At: {formatDate(post.createdAt)}</p>{" "}
            {/* Display formatted creation time */}
            <p>
              Likes: {Array.isArray(post.likes) ? post.likes.length : 0}
            </p>{" "}
            {/* Ensure likes is an array */}
            <button onClick={() => handleLike(post._id)}>
              {Array.isArray(post.likes) && post.likes.includes(user?._id)
                ? "Unlike"
                : "Like"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PostsList;
