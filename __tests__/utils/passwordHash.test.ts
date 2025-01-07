import { hashPassword, comparePassword } from "@/utils/passwordHash";

describe("Password Hashing Utility", () => {
  const plainPassword = "testpassword123";

  it("should hash a password", async () => {
    const hashedPassword = await hashPassword(plainPassword);

    expect(hashedPassword).toBeDefined();
    expect(hashedPassword).not.toBe(plainPassword);
  });

  it("should compare correct password", async () => {
    const hashedPassword = await hashPassword(plainPassword);

    const isMatch = await comparePassword(plainPassword, hashedPassword);
    expect(isMatch).toBe(true);
  });

  it("should fail to compare incorrect password", async () => {
    const hashedPassword = await hashPassword(plainPassword);

    const isMatch = await comparePassword("wrongpassword", hashedPassword);
    expect(isMatch).toBe(false);
  });
});
