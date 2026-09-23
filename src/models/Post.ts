import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IPost extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  content: string;
  authorId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: [true, 'Post title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
      trim: true
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Post must have an author']
    }
  },
  {
    timestamps: true
  }
);

// ------------------------------------------------------------------------------------------
// Explicit Index Definitions (required by task specification: use schema.index method)
// ------------------------------------------------------------------------------------------

// 1. Compound index on authorId & createdAt: Strictly supports Aggregation Scenario 2 ($lookup by authorId)
// and fetching all posts belonging to a specific user ordered chronologically
postSchema.index({ authorId: 1, createdAt: -1 });

// 2. Index on createdAt: Supports paginated public listing of all posts visible to everyone
postSchema.index({ createdAt: -1 });

export const Post: Model<IPost> = mongoose.model<IPost>('Post', postSchema);
export default Post;
