import axios from "axios";
import mongoose from "mongoose";
import { AxiosResponse, AxiosError } from "axios";
import dbConnect from "@/utils/dbConnect";
import User from "@/models/User";
import { hashPassword } from "@/utils/passwordHash";
import MockAdapter from "axios-mock-adapter";

interface LoginResponse {
  token: string;
  userId: string;
}

interface ErrorResponse {
  message: string;
}

describe("Login API", () => {
  // Store original environment variables
  const originalEnv = { ...process.env };

  // Store the original MongoDB URI
  const originalMongoUri = process.env.MONGODB_URI;

  // Generate a unique database name for this test suite
  const testDbName = `test_db_login_${Date.now()}`;
  const testMongoUri = originalMongoUri?.replace(/\/[^\/]+$/, `/${testDbName}`);

  // MockAdapter instance
  let mock: MockAdapter;

  beforeAll(async () => {
    // Use the unique test database URI
    if (testMongoUri) {
      process.env.MONGODB_URI = testMongoUri;
    }

    // Set test environment variables using type assertion
    (process.env as any).NODE_ENV = "test";
    (process.env as any).SKIP_CAPTCHA = "true";

    // Ensure a fresh connection
    await mongoose.disconnect();
    await dbConnect();

    // Initialize MockAdapter
    mock = new MockAdapter(axios);

    // Mock the reCAPTCHA verification endpoint
    mock.onPost("https://www.google.com/recaptcha/api/siteverify").reply(200, {
      success: true,
      score: 0.9,
    });
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

      // Restore original environment
      process.env = originalEnv;
    } catch (error) {
      console.error("Error during test cleanup:", error);
    }
  });

  beforeEach(async () => {
    // Clear the User collection before each test
    await User.deleteMany({});

    // Reset mock adapter before each test
    mock.reset();

    // Re-mock the reCAPTCHA verification endpoint
    mock.onPost("https://www.google.com/recaptcha/api/siteverify").reply(200, {
      success: true,
      score: 0.9,
    });
  });

  it("should login with correct credentials", async () => {
    const email = `testlogin_${Date.now()}@example.com`;
    const testUser = new User({
      username: "testlogin",
      email: email,
      password: await hashPassword("correctpassword"),
    });
    await testUser.save();

    // Mock the login API response
    mock.onPost("/api/auth/login").reply(200, {
      token: "mock-jwt-token",
      userId: testUser._id.toString(),
    });

    try {
      const response: AxiosResponse<LoginResponse> = await axios.post(
        "/api/auth/login",
        {
          email: email,
          password: "correctpassword",
          captchaToken: "test-captcha-token",
        }
      );

      expect(response.status).toBe(200);
      expect(response.data.token).toBeDefined();
      expect(response.data.userId).toBe(testUser._id.toString());
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Login test failed:", axiosError.response?.data);
      throw error;
    }
  });

  it("should reject login with incorrect password", async () => {
    const email = `testlogin_${Date.now()}@example.com`;
    // Create a user first
    const testUser = new User({
      username: "testlogin",
      email: email,
      password: await hashPassword("correctpassword"),
    });
    await testUser.save();

    // Mock the login API response for incorrect password
    mock.onPost("/api/auth/login").reply(401, {
      message: "Invalid email or password",
    });

    try {
      await axios.post("/api/auth/login", {
        email: email,
        password: "wrongpassword",
        captchaToken: "test-captcha-token",
      });

      // If login succeeds, fail the test
      fail("Expected login to fail with incorrect password");
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      expect(axiosError.response?.status).toBe(401);
      expect(axiosError.response?.data.message).toBe(
        "Invalid email or password"
      );
    }
  });

  it("should reject login with non-existent user", async () => {
    const email = `nonexistent_${Date.now()}@example.com`;

    // Mock the login API response for non-existent user
    mock.onPost("/api/auth/login").reply(401, {
      message: "Invalid email or password",
    });

    try {
      await axios.post("/api/auth/login", {
        email: email,
        password: "somepassword",
        captchaToken: "test-captcha-token",
      });

      // If login succeeds, fail the test
      fail("Expected login to fail with non-existent user");
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      expect(axiosError.response?.status).toBe(401);
      expect(axiosError.response?.data.message).toBe(
        "Invalid email or password"
      );
    }
  });
});
