"use client"; // Add this line at the top of the file

import { useState, useRef } from "react"; // Import useRef
import axios from "axios";
import toast from "react-hot-toast";
import { FaImage, FaPaperPlane } from "react-icons/fa";

const PostForm = ({ fetchPosts }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null); // State for image
  const fileInputRef = useRef(null); // Create a ref for the file input

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token"); // Retrieve the token

    if (!token) {
      toast.error("You must be logged in to create a post.");
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

      toast.success("Post created successfully");
      fetchPosts(); // Refresh the posts after creating a new one
      setTitle(""); // Clear the title input
      setContent(""); // Clear the content input
      setImage(null); // Clear the image input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Clear the file input
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Error creating post");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/40 backdrop-blur-lg rounded-xl p-4 shadow-md"
    >
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <div className="flex items-center space-x-3">
          <input
            type="file"
            ref={fileInputRef} // Attach the ref to the file input
            onChange={(e) => setImage(e.target.files[0])} // Set the image file
            className="flex-grow text-sm file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 file:text-sm file:px-3 file:py-1"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors flex items-center"
          >
            <FaPaperPlane className="mr-2 w-4 h-4" />
            Post
          </button>
        </div>
      </div>
    </form>
  );
};

export default PostForm;
