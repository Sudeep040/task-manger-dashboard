import mongoose, { Schema, models, model } from "mongoose";

const CommentSchema = new Schema(
  {
    task: { type: Schema.Types.ObjectId, ref: "Task", required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true }
  },
  { timestamps: true }
);

const Comment = (models.Comment as mongoose.Model<any>) || model("Comment", CommentSchema);
export default Comment;

