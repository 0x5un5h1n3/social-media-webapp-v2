import { getTestMongoURI } from "./test-utils";
import mongoose from "mongoose";

describe("MongoDB Connection", () => {
  beforeAll(async () => {
    const uri = getTestMongoURI();
    await mongoose.connect(uri, {});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should connect to MongoDB", async () => {
    const state = mongoose.connection.readyState;
    expect(state).toBe(1); // 1 means connected
  });
});
