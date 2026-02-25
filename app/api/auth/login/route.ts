import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db/connectDB";
import User from "../../../../lib/models/User";
import bcrypt from "bcryptjs";
import { signJwt } from "../../../../lib/auth/jwt";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body || {};
  if (!email || !password) {
    return NextResponse.json({ error: "email and password are required" }, { status: 400 });
  }

  await connectDB();
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const token = signJwt({ userId: user._id.toString() });
  const safeUser = {
    _id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt
  };

  return NextResponse.json({ token, user: safeUser });
}

