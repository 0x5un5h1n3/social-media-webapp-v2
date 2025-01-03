"use client"; // Add this line at the top of the file

import axios from "axios";
import { useEffect, useState } from "react";

const PostsList = ({ posts }) => {
  return (
    <div>
      <h2>Posts</h2>
      <ul>
        {posts.map((post) => (
          <li key={post._id}>
            {" "}
            {/* Use post._id for the key */}
            <h3>{post.title}</h3>
            <p>{post.content}</p>
            <p>Likes: {post.likes}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PostsList;
