import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db/connectDB";
import Project from "../../../../../lib/models/Project";
import User from "../../../../../lib/models/User";
import { getUserFromRequest } from "../../../../../lib/api/withAuth";
import mongoose from "mongoose";

function isOwner(project: any, userId: string) {
  return project.owner?.toString() === userId;
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(request);
  const { id } = params;
  const body = await request.json();
  const { email } = body || {};
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  await connectDB();
  const project = await Project.findById(id);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!isOwner(project, user.userId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const member = await User.findOne({ email: email.toLowerCase() });
  if (!member) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (project.members.some((m: any) => m.toString() === member._id.toString())) {
    return NextResponse.json({ error: "Already a member" }, { status: 400 });
  }
  project.members.push(member._id);
  await project.save();
  return NextResponse.json({ project });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(request);
  const { id } = params;
  const url = new URL(request.url);
  const userIdToRemove = url.searchParams.get("userId");
  if (!userIdToRemove) return NextResponse.json({ error: "userId required" }, { status: 400 });
  if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(userIdToRemove))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  await connectDB();
  const project = await Project.findById(id);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!isOwner(project, user.userId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  project.members = project.members.filter((m: any) => m.toString() !== userIdToRemove);
  await project.save();
  return NextResponse.json({ project });
}

