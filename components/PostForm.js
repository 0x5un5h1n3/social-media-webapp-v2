"use client"; // Add this line at the top of the file

import { useState } from "react";
import axios from "axios";

const PostForm = ({ fetchPosts }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    await axios.post(
      "/api/posts",
      { title, content },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    fetchPosts(); // Refresh the posts list after submission
    setTitle(""); // Clear the title input
    setContent(""); // Clear the content input
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />
      <button type="submit">Create Post</button>
    </form>
  );
};

export default PostForm;
