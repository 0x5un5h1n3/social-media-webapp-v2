"use client"; // Add this line at the top of the file

import axios from "axios";
import { formatDate } from "../utils/formatDate";
import { FaHeart, FaRegHeart, FaEdit, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";
import { useState } from "react";

const PostsList = ({ posts, fetchPosts, user }) => {
  const [editingPostId, setEditingPostId] = useState(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [editedImage, setEditedImage] = useState(null);

  const handleLike = async (postId) => {
    const token = localStorage.getItem("token");
    if (!user) {
      toast.error("You must be logged in to like a post");
      return;
    }

    try {
      await axios.patch(
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

  const handleEdit = (post) => {
    setEditingPostId(post._id);
    setEditedTitle(post.title);
    setEditedContent(post.content);
    setEditedImage(null);
  };

  const handleUpdatePost = async (postId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in to edit a post.");
      return;
    }

    const formData = new FormData();
    formData.append("userId", user._id);
    formData.append("title", editedTitle);
    formData.append("content", editedContent);
    if (editedImage) {
      formData.append("image", editedImage);
    }

    try {
      await axios.put(`/api/posts?id=${postId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Post updated successfully");
      fetchPosts(); // Refresh the posts list after updating
      setEditingPostId(null); // Reset editing state
      setEditedTitle(""); // Clear title input
      setEditedContent(""); // Clear content input
      setEditedImage(null); // Clear image input
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("Error updating the post");
    }
  };

  const handleDelete = async (postId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in to delete a post.");
      return;
    }

    try {
      await axios.delete(`/api/posts?id=${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Post deleted successfully");
      fetchPosts(); // Refresh the posts list after deletion
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Error deleting the post");
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
          {(post.image || (editingPostId === post._id && editedImage)) && (
            <div className="w-full aspect-[4/3] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  editingPostId === post._id && editedImage
                    ? URL.createObjectURL(editedImage)
                    : post.image
                }
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Post Content */}
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-grow pr-4">
                <h3 className="text-base font-semibold text-gray-800 mb-1 truncate flex items-center">
                  {editingPostId === post._id ? (
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="border border-gray-300 rounded-md p-1 w-full"
                      maxLength={100}
                    />
                  ) : (
                    <>
                      {post.title}
                      {post.edited && (
                        <span className="text-gray-400 text-xs ml-2">
                          (edited)
                        </span>
                      )}
                    </>
                  )}
                </h3>

                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {editingPostId === post._id ? (
                    <textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="border border-gray-300 rounded-md p-1 w-full"
                      rows="3"
                      maxLength={500}
                    />
                  ) : (
                    post.content
                  )}
                </p>

                {/* Image upload during edit */}
                {editingPostId === post._id && (
                  <div className="mb-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        // Optional: Add file size and type validation
                        if (file && file.size <= 5 * 1024 * 1024) {
                          setEditedImage(file);
                        } else {
                          toast.error("File must be less than 5MB");
                        }
                      }}
                      className="border border-gray-300 rounded-md p-1 w-full"
                    />
                    {editedImage && (
                      <div className="text-xs text-gray-500 mt-1">
                        Selected file: {editedImage.name}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Edit and Delete Buttons */}
              {user &&
                post.userId &&
                (post.userId._id === user._id || post.userId === user._id) && (
                  <div className="flex items-center gap-2">
                    {editingPostId === post._id ? (
                      <>
                        <button
                          onClick={() => handleUpdatePost(post._id)}
                          className="text-blue-500 hover:underline"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingPostId(null);
                            setEditedImage(null);
                          }}
                          className="text-gray-500 hover:underline"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(post)}
                          className="text-gray-600 hover:text-blue-500"
                          title="Edit Post"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(post._id)}
                          className="text-gray-600 hover:text-red-500"
                          title="Delete Post"
                        >
                          <FaTrash />
                        </button>
                      </>
                    )}
                  </div>
                )}
            </div>

            {/* Like Button - Conditional Rendering */}
            <div className="flex items-center justify-between">
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

            <div className="flex justify-between text-xs text-gray-500 mt-2">
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
