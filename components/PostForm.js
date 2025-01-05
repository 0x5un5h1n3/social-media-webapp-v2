"use client"; // Add this line at the top of the file

import { useState, useRef } from "react"; // Import useRef
import axios from "axios";

const PostForm = ({ fetchPosts }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null); // State for image
  const fileInputRef = useRef(null); // Create a ref for the file input

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token"); // Retrieve the token

    if (!token) {
      alert("You must be logged in to create a post.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (image) {
      formData.append("image", image); // Append image if it exists
    }

    try {
      await axios.post("/api/posts", formData, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token
          "Content-Type": "multipart/form-data", // Set content type for form data
        },
      });
      alert("Post created successfully");
      fetchPosts(); // Refresh the posts after creating a new one
      setTitle(""); // Clear the title input
      setContent(""); // Clear the content input
      setImage(null); // Clear the image input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Clear the file input
      }
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Error creating post");
    }
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
      <input
        type="file"
        ref={fileInputRef} // Attach the ref to the file input
        onChange={(e) => setImage(e.target.files[0])} // Set the image file
      />
      <button type="submit">Create Post</button>
    </form>
  );
};

export default PostForm;
