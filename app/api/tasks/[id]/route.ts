import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db/connectDB";
import Task from "../../../../lib/models/Task";
import Project from "../../../../lib/models/Project";
import { getUserFromRequest } from "../../../../lib/api/withAuth";
import mongoose from "mongoose";

function isProjectMember(project: any, userId: string) {
  return project.owner?.toString() === userId || (project.members || []).some((m: any) => m.toString() === userId);
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(request);
  const { id } = params;
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  await connectDB();
  const task = await Task.findById(id).lean();
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const project = await Project.findById(task.project).lean();
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  if (!isProjectMember(project, user.userId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json({ task });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(request);
  const { id } = params;
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const body = await request.json();
  await connectDB();
  const task = await Task.findById(id);
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const project = await Project.findById(task.project);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  const isMember = isProjectMember(project, user.userId);
  if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { title, description, status, assignees, priority, dueDate } = body || {};
  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (status !== undefined) task.status = status;
  if (Array.isArray(assignees)) task.assignees = assignees;
  if (priority !== undefined) task.priority = priority;
  if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;

  await task.save();
  return NextResponse.json({ task });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(request);
  const { id } = params;
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  await connectDB();
  const task = await Task.findById(id);
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const project = await Project.findById(task.project);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  // only project owner can delete tasks
  if (project.owner?.toString() !== user.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await task.deleteOne();
  return NextResponse.json({ ok: true });
}

