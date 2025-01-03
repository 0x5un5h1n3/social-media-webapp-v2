"use client"; // Add this line at the top of the file

import axios from "axios";
import { useEffect } from "react";

const PostsList = ({ posts, fetchPosts }) => {
  const handleLike = async (postId) => {
    const token = localStorage.getItem("token");
    await axios.put(
      `/api/posts?id=${postId}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    fetchPosts(); // Refresh the posts list after liking
  };

  return (
    <div>
      <h2>Posts</h2>
      <ul>
        {posts.map((post) => (
          <li key={post._id}>
            <h3>{post.title}</h3>
            <p>{post.content}</p>
            <p>Likes: {post.likes}</p>
            <p>Created At: {new Date(post.createdAt).toLocaleString()}</p>{" "}
            {/* Display creation time */}
            <button onClick={() => handleLike(post._id)}>Like</button>{" "}
            {/* Like button */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PostsList;
