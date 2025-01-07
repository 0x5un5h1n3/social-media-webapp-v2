import mongoose from "mongoose";
import Post from "@/models/Post";
import User from "@/models/User";
import dbConnect from "@/utils/dbConnect";
import { hashPassword } from "@/utils/passwordHash";

describe("Post Model Test", () => {
  // Store the original MongoDB URI
  const originalMongoUri = process.env.MONGODB_URI;

  // Generate a unique database name for this test suite
  const testDbName = `test_db_post_model_${Date.now()}`;
  const testMongoUri = originalMongoUri?.replace(/\/[^\/]+$/, `/${testDbName}`);

  let testUser: any;

  beforeAll(async () => {
    // Use the unique test database URI
    if (testMongoUri) {
      process.env.MONGODB_URI = testMongoUri;
    }

    // Ensure a fresh connection
    await mongoose.disconnect();
    await dbConnect();

    // Create a test user to associate with posts
    testUser = new User({
      username: "posttest",
      email: `posttest_${Date.now()}@example.com`,
      password: await hashPassword("password123"),
    });
    await testUser.save();
  });

  afterAll(async () => {
    try {
      // Drop the test database
      await mongoose.connection.dropDatabase();

      // Close the connection
      await mongoose.connection.close();

      // Restore the original MongoDB URI
      process.env.MONGODB_URI = originalMongoUri;
    } catch (error) {
      console.error("Error during test cleanup:", error);
    }
  });

  beforeEach(async () => {
    // Clear posts collection before each test
    await Post.deleteMany({});
  });

  it("should create a new post", async () => {
    const postData = {
      userId: testUser._id,
      title: "Test Post",
      content: "This is a test post content",
    };

    const validPost = new Post(postData);
    const savedPost = await validPost.save();

    expect(savedPost._id).toBeDefined();
    expect(savedPost.title).toBe(postData.title);
    expect(savedPost.content).toBe(postData.content);
    expect(savedPost.userId).toEqual(testUser._id);
    expect(savedPost.likes).toHaveLength(0);
    expect(savedPost.edited).toBe(false);
  });

  it("should fail to create a post without required fields", async () => {
    const invalidPost = new Post({
      userId: testUser._id,
      // Missing title and content
    });

    await expect(invalidPost.save()).rejects.toThrow();
  });

  it("should add likes to a post", async () => {
    const postData = {
      userId: testUser._id,
      title: "Likeable Post",
      content: "This post can be liked",
    };

    const post = new Post(postData);
    const savedPost = await post.save();

    // Simulate adding a like
    savedPost.likes.push(testUser._id);
    const updatedPost = await savedPost.save();

    expect(updatedPost.likes).toHaveLength(1);
    expect(updatedPost.likes[0].toString()).toBe(testUser._id.toString());
  });

  it("should manually mark a post as edited when updated", async () => {
    const postData = {
      userId: testUser._id,
      title: "Original Title",
      content: "Original Content",
      edited: false,
    };

    const post = new Post(postData);
    const savedPost = await post.save();

    // Manually update the post with edited flag
    savedPost.title = "Updated Title";
    savedPost.content = "Updated Content";
    savedPost.edited = true;
    savedPost.editedAt = new Date();

    const updatedPost = await savedPost.save();

    expect(updatedPost.edited).toBe(true);
    expect(updatedPost.editedAt).toBeDefined();
    expect(updatedPost.title).toBe("Updated Title");
    expect(updatedPost.content).toBe("Updated Content");
  });

  it("should create a post with an optional image", async () => {
    const postData = {
      userId: testUser._id,
      title: "Post with Image",
      content: "This post has an image",
      image: "https://example.com/image.jpg",
    };

    const post = new Post(postData);
    const savedPost = await post.save();

    expect(savedPost.image).toBe(postData.image);
  });

  it("should have a default createdAt timestamp", async () => {
    const postData = {
      userId: testUser._id,
      title: "Timestamp Test Post",
      content: "This post should have a createdAt timestamp",
    };

    const post = new Post(postData);
    const savedPost = await post.save();

    expect(savedPost.createdAt).toBeDefined();
    expect(savedPost.createdAt).toBeInstanceOf(Date);
  });

  it("should allow setting edited status manually", async () => {
    const postData = {
      userId: testUser._id,
      title: "Manually Edited Post",
      content: "This post can be manually marked as edited",
      edited: true,
      editedAt: new Date(),
    };

    const post = new Post(postData);
    const savedPost = await post.save();

    expect(savedPost.edited).toBe(true);
    expect(savedPost.editedAt).toBeDefined();
  });
});
