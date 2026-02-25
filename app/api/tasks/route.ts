import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db/connectDB";
import Task from "../../../lib/models/Task";
import Project from "../../../lib/models/Project";
import { getUserFromRequest } from "../../../lib/api/withAuth";
import mongoose from "mongoose";

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  const url = new URL(request.url);
  const projectId = url.searchParams.get("projectId");

  await connectDB();

  const filter: any = {};
  if (projectId) {
    if (!mongoose.isValidObjectId(projectId)) {
      return NextResponse.json({ error: "Invalid projectId" }, { status: 400 });
    }
    const project = await Project.findById(projectId).lean();
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    const isMember = project.owner?.toString() === user.userId || (project.members || []).some((m: any) => m.toString() === user.userId);
    if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    filter.project = projectId;
  } else {
    // return tasks where user is part of project (owner or member)
    const projects = await Project.find({
      $or: [{ owner: user.userId }, { members: user.userId }]
    }).select("_id");
    filter.project = { $in: projects.map((p: any) => p._id) };
  }

  const tasks = await Task.find(filter).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ tasks });
}

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  const body = await request.json();
  const { title, description, projectId, assignees, priority, dueDate } = body || {};
  if (!title || !projectId) return NextResponse.json({ error: "title and projectId required" }, { status: 400 });
  if (!mongoose.isValidObjectId(projectId)) return NextResponse.json({ error: "Invalid projectId" }, { status: 400 });

  await connectDB();
  const project = await Project.findById(projectId);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  const isMember = project.owner?.toString() === user.userId || (project.members || []).some((m: any) => m.toString() === user.userId);
  if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const task = await Task.create({
    title,
    description: description || "",
    project: projectId,
    assignees: Array.isArray(assignees) ? assignees : [],
    priority: priority || "medium",
    dueDate: dueDate ? new Date(dueDate) : null
  });

  return NextResponse.json({ task }, { status: 201 });
}

