import React, { useEffect, useState } from "react";
import PostForm from "./PostForm"; // Adjust the import path as necessary
import PostsList from "./PostsList"; // Adjust the import path as necessary
import axios from "axios";

const ParentComponent = () => {
  const [posts, setPosts] = useState([]);

  // Define the fetchPosts function
  const fetchPosts = async () => {
    const response = await axios.get("/api/posts");
    setPosts(response.data);
  };

  // Fetch posts when the component mounts
  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div>
      <PostForm fetchPosts={fetchPosts} /> {/* Pass fetchPosts as a prop */}
      <PostsList posts={posts} /> {/* Pass posts to PostsList */}
    </div>
  );
};

export default ParentComponent;
