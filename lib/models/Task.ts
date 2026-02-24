import mongoose, { Schema, models, model } from "mongoose";

const TaskSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    assignees: [{ type: Schema.Types.ObjectId, ref: "User" }],
    status: {
      type: String,
      enum: ["todo", "in_progress", "done", "archived"],
      default: "todo"
    },
    priority: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium" },
    dueDate: { type: Date, default: null }
  },
  { timestamps: true }
);

const Task = (models.Task as mongoose.Model<any>) || model("Task", TaskSchema);
export default Task;

