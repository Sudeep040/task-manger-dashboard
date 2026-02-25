import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db/connectDB";
import Comment from "../../../lib/models/Comment";
import Task from "../../../lib/models/Task";
import Project from "../../../lib/models/Project";
import { getUserFromRequest } from "../../../lib/api/withAuth";
import mongoose from "mongoose";

const DEFAULT_LIMIT = 20;

function encodeCursor(date: Date, id: string) {
  return Buffer.from(`${date.toISOString()}|${id}`).toString("base64");
}

function decodeCursor(cursor: string) {
  try {
    const decoded = Buffer.from(cursor, "base64").toString("utf8");
    const [iso, id] = decoded.split("|");
    return { date: new Date(iso), id };
  } catch (err) {
    return null;
  }
}

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  const url = new URL(request.url);
  const taskId = url.searchParams.get("taskId");
  const limitParam = parseInt(url.searchParams.get("limit") || "") || DEFAULT_LIMIT;
  const cursor = url.searchParams.get("cursor");

  if (!taskId) return NextResponse.json({ error: "taskId is required" }, { status: 400 });
  if (!mongoose.isValidObjectId(taskId)) return NextResponse.json({ error: "Invalid taskId" }, { status: 400 });

  await connectDB();
  const task = await Task.findById(taskId).lean();
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const project = await Project.findById(task.project).lean();
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  const isMember =
    project.owner?.toString() === user.userId || (project.members || []).some((m: any) => m.toString() === user.userId);
  if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const limit = Math.min(Math.max(1, limitParam), 100);

  const query: any = { task: taskId };
  // sort newest first
  const sort = { createdAt: -1, _id: -1 };

  if (cursor) {
    const decoded = decodeCursor(cursor);
    if (!decoded) return NextResponse.json({ error: "Invalid cursor" }, { status: 400 });
    // (createdAt < cursorDate) OR (createdAt == cursorDate AND _id < cursorId)
    query.$or = [
      { createdAt: { $lt: decoded.date } },
      { createdAt: decoded.date, _id: { $lt: new mongoose.Types.ObjectId(decoded.id) } }
    ];
  }

  const items = await Comment.find(query).sort(sort).limit(limit + 1).lean();
  let nextCursor = null;
  if (items.length > limit) {
    const last = items[limit - 1];
    nextCursor = encodeCursor(new Date(last.createdAt), last._id.toString());
    items.splice(limit); // trim extra
  }

  return NextResponse.json({ items, nextCursor });
}

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  const body = await request.json();
  const { taskId, body: text } = body || {};
  if (!taskId || !text) return NextResponse.json({ error: "taskId and body are required" }, { status: 400 });
  if (!mongoose.isValidObjectId(taskId)) return NextResponse.json({ error: "Invalid taskId" }, { status: 400 });

  await connectDB();
  const task = await Task.findById(taskId);
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  const project = await Project.findById(task.project).lean();
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  const isMember =
    project.owner?.toString() === user.userId || (project.members || []).some((m: any) => m.toString() === user.userId);
  if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const comment = await Comment.create({
    task: taskId,
    author: user.userId,
    body: text
  });

  return NextResponse.json({ comment }, { status: 201 });
}

