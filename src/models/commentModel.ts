import { Document, Schema, model } from 'mongoose';
import { Comment } from '../types/commentType';

export interface IComment extends Comment, Document {}

const commentSchema: Schema = new Schema({
  content: {
    type: String,
    required: true,
  },
  userType: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  deletedAt: {
    type: Date,
    required: false,
  },
  isDeleted: {
    type: Boolean,
    required: true,
    default: false,
  },
});

const CommentModel = model<IComment>('Comment', commentSchema);

export default CommentModel;
