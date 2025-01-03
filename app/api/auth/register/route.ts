import { NextResponse } from "next/server";
import dbConnect from "../../../../utils/dbConnect";
import User from "../../../../models/User";
import bcrypt from "bcrypt";
import axios from "axios";

export async function POST(request: Request) {
  await dbConnect();

  const { username, email, password, captchaToken } = await request.json();

  // Verify CAPTCHA
  const captchaResponse = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`
  );
  const { success } = captchaResponse.data;

  if (!success) {
    return NextResponse.json(
      { message: "Captcha verification failed" },
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, email, password: hashedPassword });

  await newUser.save();
  return NextResponse.json({ message: "User registered successfully" });
}
