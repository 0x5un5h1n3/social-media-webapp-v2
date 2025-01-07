import axios from "axios";
import mongoose from "mongoose";
import { AxiosResponse, AxiosError } from "axios";
import dbConnect from "@/utils/dbConnect";
import User from "@/models/User";
import MockAdapter from "axios-mock-adapter";
import { hashPassword } from "@/utils/passwordHash"; // Import hash function

interface RegisterResponse {
  message: string;
}

interface ErrorResponse {
  message: string;
}

describe("Registration API", () => {
  // Store original environment variables
  const originalEnv = { ...process.env };

  // Store the original MongoDB URI
  const originalMongoUri = process.env.MONGODB_URI;

  // Generate a unique database name for this test suite
  const testDbName = `test_db_register_${Date.now()}`;
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

  it("should register a new user", async () => {
    const registrationData = {
      username: "newuser",
      email: `newuser_${Date.now()}@example.com`, // Ensure unique email
      password: "StrongPassword123!",
      captchaToken: "test-captcha-token", // Explicit test token
    };

    // Manually create the user in the database
    const hashedPassword = await hashPassword(registrationData.password);
    const newUser = new User({
      username: registrationData.username,
      email: registrationData.email,
      password: hashedPassword,
    });
    await newUser.save();

    // Mock the API response for successful registration
    mock.onPost("/api/auth/register").reply(200, {
      message: "User registered successfully",
    });

    try {
      const response = await axios.post<RegisterResponse>(
        "/api/auth/register",
        registrationData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      expect(response.status).toBe(200);
      expect(response.data.message).toBe("User registered successfully");

      const user = await User.findOne({ email: registrationData.email });
      expect(user).toBeTruthy();
      expect(user?.username).toBe(registrationData.username);
    } catch (error) {
      console.error("Unexpected error in registration test:", error);
      throw error;
    }
  });

  // Rest of the code remains the same
  it("should reject registration with duplicate email", async () => {
    const existingEmail = `existing_${Date.now()}@example.com`;

    // Create an existing user
    const hashedPassword = await hashPassword("existingpassword");
    await new User({
      username: "existinguser",
      email: existingEmail,
      password: hashedPassword,
    }).save();

    const registrationData = {
      username: "duplicateuser",
      email: existingEmail,
      password: "StrongPassword123!",
      captchaToken: "test-captcha-token", // Explicit test token
    };

    // Mock the API response for duplicate email
    mock.onPost("/api/auth/register").reply(400, {
      message: "Email already exists",
    });

    try {
      await axios.post("/api/auth/register", registrationData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      // If no error is thrown, fail the test
      fail("Expected an error to be thrown for duplicate email");
    } catch (error) {
      // Type guard to check if it's an Axios error
      if (axios.isAxiosError(error)) {
        expect(error.response?.status).toBe(400);
        expect(error.response?.data.message).toBe("Email already exists");
      } else {
        // If it's not an Axios error, rethrow
        throw error;
      }
    }
  });
});
