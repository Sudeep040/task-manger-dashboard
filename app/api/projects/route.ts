import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db/connectDB";
import Project from "../../../lib/models/Project";
import { getUserFromRequest } from "../../../lib/api/withAuth";

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  await connectDB();
  const projects = await Project.find({
    $or: [{ owner: user.userId }, { members: user.userId }]
  }).lean();
  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  const body = await request.json();
  const { title, description } = body || {};
  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  await connectDB();
  const project = await Project.create({
    title,
    description: description || "",
    owner: user.userId,
    members: []
  });
  return NextResponse.json({ project }, { status: 201 });
}

