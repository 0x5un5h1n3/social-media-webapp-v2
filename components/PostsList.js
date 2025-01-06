"use client"; // Add this line at the top of the file

import axios from "axios";
import { formatDate } from "../utils/formatDate";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import toast from "react-hot-toast";

const PostsList = ({ posts, fetchPosts, user }) => {
  const handleLike = async (postId) => {
    const token = localStorage.getItem("token");
    if (!user) {
      toast.error("You must be logged in to like a post");
      return;
    }

    try {
      await axios.put(
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
      toast.error("Error liking the post");
    }
  };

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div
          key={post._id}
          className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
        >
          {/* Post Image */}
          {post.image && (
            <div className="w-full aspect-[4/3] overflow-hidden">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Post Content */}
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-grow pr-4">
                <h3 className="text-base font-semibold text-gray-800 mb-1 truncate">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {post.content}
                </p>
              </div>

              {/* Like Button - Conditional Rendering */}
              {user ? (
                <button
                  onClick={() => handleLike(post._id)}
                  className="flex items-center gap-1 text-gray-600 hover:text-red-500"
                >
                  {post.likes &&
                  Array.isArray(post.likes) &&
                  post.likes.some(
                    (likedUserId) =>
                      likedUserId && likedUserId.toString() === user._id
                  ) ? (
                    <FaHeart className="text-red-500" />
                  ) : (
                    <FaRegHeart />
                  )}
                  <span className="text-xs">
                    {Array.isArray(post.likes) ? post.likes.length : 0}
                  </span>
                </button>
              ) : (
                <div className="flex items-center gap-1 cursor-not-allowed opacity-50">
                  <FaRegHeart />
                  {/* Display Likes count*/}
                  <span className="text-xs">
                    {Array.isArray(post.likes) ? post.likes.length : 0}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-between text-xs text-gray-500">
              {/* Display username */}
              <span>
                Posted by: {post.userId ? post.userId.username : "Unknown User"}
              </span>
              {/* Display formatted creation time */}
              <span>{formatDate(post.createdAt)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostsList;
