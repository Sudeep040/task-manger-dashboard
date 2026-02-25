import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db/connectDB";
import Project from "../../../../lib/models/Project";
import { getUserFromRequest } from "../../../../lib/api/withAuth";
import mongoose from "mongoose";

function isOwner(project: any, userId: string) {
  return project.owner?.toString() === userId;
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(request);
  const { id } = params;
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  await connectDB();
  const project = await Project.findById(id).lean();
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const isMember = project.owner?.toString() === user.userId || (project.members || []).some((m: any) => m.toString() === user.userId);
  if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json({ project });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(request);
  const { id } = params;
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const body = await request.json();
  const { title, description } = body || {};
  await connectDB();
  const project = await Project.findById(id);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!isOwner(project, user.userId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (title !== undefined) project.title = title;
  if (description !== undefined) project.description = description;
  await project.save();
  return NextResponse.json({ project });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(request);
  const { id } = params;
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  await connectDB();
  const project = await Project.findById(id);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!isOwner(project, user.userId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await project.deleteOne();
  return NextResponse.json({ ok: true });
}

