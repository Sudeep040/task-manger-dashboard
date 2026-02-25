import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db/connectDB";
import User from "../../../../lib/models/User";
import bcrypt from "bcryptjs";
import { signJwt } from "../../../../lib/auth/jwt";

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, password } = body || {};
  if (!name || !email || !password) {
    return NextResponse.json({ error: "name, email and password are required" }, { status: 400 });
  }

  await connectDB();
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email: email.toLowerCase(), passwordHash });

  const token = signJwt({ userId: user._id.toString() });
  const safeUser = {
    _id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt
  };

  return NextResponse.json({ token, user: safeUser }, { status: 201 });
}

