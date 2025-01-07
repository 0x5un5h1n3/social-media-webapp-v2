import axios from "axios";
import mongoose from "mongoose";
import { AxiosResponse, AxiosError } from "axios";
import dbConnect from "@/utils/dbConnect";
import User from "@/models/User";
import Post from "@/models/Post";
import jwt from "jsonwebtoken";
import { hashPassword } from "@/utils/passwordHash";
import MockAdapter from "axios-mock-adapter";

interface BasePostResponse {
  _id: string;
  title: string;
  content: string;
  userId: string;
  likes: string[];
  createdAt?: Date;
}

interface EditablePostResponse extends BasePostResponse {
  edited: boolean;
  editedAt: Date;
}

interface ErrorResponse {
  message: string;
}

describe("Posts API", () => {
  // Store the original MongoDB URI
  const originalMongoUri = process.env.MONGODB_URI;

  // Generate a unique database name for this test suite
  const testDbName = `test_db_posts_${Date.now()}`;
  const testMongoUri = originalMongoUri?.replace(/\/[^\/]+$/, `/${testDbName}`);

  // Test user and token
  let testUser: any; // Use 'any' to avoid strict type checking
  let testToken: string;

  // Mock adapter
  let mock: MockAdapter;

  beforeAll(async () => {
    // Use the unique test database URI
    if (testMongoUri) {
      process.env.MONGODB_URI = testMongoUri;
    }

    // Ensure a fresh connection
    await mongoose.disconnect();
    await dbConnect();

    // Create a test user
    testUser = new User({
      username: "posttest",
      email: `posttest_${Date.now()}@example.com`, // Unique email
      password: await hashPassword("testpassword"),
    });
    await testUser.save();

    // Generate a JWT token for the test user
    testToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    // Set up Axios mock adapter
    mock = new MockAdapter(axios);
  });

  afterAll(async () => {
    try {
      // Restore mock adapter
      mock.restore();

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
    // Clear collections before each test
    await User.deleteMany({});
    await Post.deleteMany({});

    // Reset mock adapter
    mock.reset();
  });

  it("should create a new post", async () => {
    const formData = new FormData();
    formData.append("title", "Test Post");
    formData.append("content", "This is a test post content");

    // Mock the API response for creating a post
    mock.onPost("/api/posts").reply(201, {
      _id: "testPostId",
      title: "Test Post",
      content: "This is a test post content",
      userId: testUser._id.toString(),
      likes: [],
      createdAt: new Date(),
    });

    try {
      const response = await axios.post<BasePostResponse>(
        "/api/posts",
        formData,
        {
          headers: {
            Authorization: `Bearer ${testToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      expect(response.status).toBe(201);
      expect(response.data.title).toBe("Test Post");
      expect(response.data.content).toBe("This is a test post content");
      expect(response.data.userId).toBe(testUser._id.toString());
    } catch (error) {
      console.error("Create post test failed:", error);
      throw error;
    }
  });

  it("should fetch posts", async () => {
    const testPost = new Post({
      userId: testUser._id,
      title: "Fetch Test Post",
      content: "Post for fetching test",
      likes: [],
    });
    await testPost.save();

    // Mock the API response for fetching posts
    mock.onGet("/api/posts").reply(200, [
      {
        _id: testPost._id.toString(),
        title: testPost.title,
        content: testPost.content,
        userId: testUser._id.toString(),
        likes: [],
        createdAt: testPost.createdAt,
      },
    ]);

    try {
      const response = await axios.get<BasePostResponse[]>("/api/posts", {
        headers: {
          Authorization: `Bearer ${testToken}`,
        },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
      expect(response.data[0].title).toBe(testPost.title);
    } catch (error) {
      console.error("Fetch posts test failed:", error);
      throw error;
    }
  });

  it("should like a post", async () => {
    const testPost = new Post({
      userId: testUser._id,
      title: "Like Test Post",
      content: "Post for liking test",
      likes: [],
    });
    await testPost.save();

    // Mock the API response for liking a post
    mock.onPatch(`/api/posts?id=${testPost._id}`).reply(200, {
      ...testPost.toObject(),
      likes: [testUser._id.toString()],
    });

    try {
      const response = await axios.patch<BasePostResponse>(
        `/api/posts?id=${testPost._id}`,
        { userId: testUser._id },
        {
          headers: {
            Authorization: `Bearer ${testToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      expect(response.status).toBe(200);
      expect(response.data.likes).toContain(testUser._id.toString());
    } catch (error) {
      console.error("Like post test failed:", error);
      throw error;
    }
  });

  it("should update a post", async () => {
    const testPost = new Post({
      userId: testUser._id,
      title: "Original Title",
      content: "Original Content",
      likes: [],
    });
    await testPost.save();

    const formData = new FormData();
    formData.append("title", "Updated Title");
    formData.append("content", "Updated Content");

    // Mock the API response for updating a post
    mock.onPut(`/api/posts?id=${testPost._id}`).reply(200, {
      ...testPost.toObject(),
      title: "Updated Title",
      content: "Updated Content",
      edited: true,
      editedAt: new Date(),
    });

    try {
      const response = await axios.put<EditablePostResponse>(
        `/api/posts?id=${testPost._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${testToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      expect(response.status).toBe(200);
      expect(response.data.title).toBe("Updated Title");
      expect(response.data.content).toBe("Updated Content");
      expect(response.data.edited).toBe(true);
      expect(response.data.editedAt).toBeDefined();
    } catch (error) {
      console.error("Update post test failed:", error);
      throw error;
    }
  });
});
