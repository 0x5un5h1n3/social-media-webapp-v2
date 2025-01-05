"use client"; // Add this line at the top of the file

import axios from "axios";
import { formatDate } from "../utils/formatDate";

const PostsList = ({ posts, fetchPosts, user }) => {
  const handleLike = async (postId) => {
    const token = localStorage.getItem("token");
    if (!user) {
      alert("You must be logged in to like a post");
      return;
    }

    try {
      const response = await axios.put(
        `/api/posts?id=${postId}`,
        { userId: user._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      fetchPosts(); // Refresh the posts list after liking
    } catch (error) {
      console.error("Error liking post:", error);
      alert("Error liking the post");
    }
  };

  return (
    <div>
      <h2>Posts</h2>
      <ul>
        {posts.map((post) => (
          <li key={post._id}>
            <h3>{post.title}</h3>
            {/* Display image */}
            {post.image && (
              <img
                src={post.image}
                alt={post.title}
                style={{
                  maxWidth: "100%",
                  maxHeight: "400px",
                  objectFit: "cover",
                }}
              />
            )}

            <p>{post.content}</p>

            <p>
              {/* Display username */}
              Posted by: {post.userId ? post.userId.username : "Unknown User"}
            </p>
            {/* Display formatted creation time */}
            <p>Created At: {formatDate(post.createdAt)}</p>
            {/* Display Likes count*/}
            <p>Likes: {Array.isArray(post.likes) ? post.likes.length : 0}</p>

            {user && (
              <button onClick={() => handleLike(post._id)}>
                {post.likes.some(
                  (likedUserId) => likedUserId.toString() === user._id
                )
                  ? "Unlike"
                  : "Like"}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PostsList;
