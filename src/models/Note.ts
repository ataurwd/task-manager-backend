import mongoose, { Document, Model, Schema } from 'mongoose';

export interface INote extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  content: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>(
  {
    title: {
      type: String,
      required: [true, 'Note title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    content: {
      type: String,
      required: [true, 'Note content is required'],
      trim: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Note must belong to a user']
    }
  },
  {
    timestamps: true
  }
);

// ------------------------------------------------------------------------------------------
// Explicit Index Definitions (required by task specification: use schema.index method)
// ------------------------------------------------------------------------------------------

// 1. Compound index on userId & createdAt: Supports paginated list of notes for a specific user, sorted newest first
noteSchema.index({ userId: 1, createdAt: -1 });

// 2. Compound index on _id & userId: Supports fast single-note read/update/delete operations with ownership check
noteSchema.index({ _id: 1, userId: 1 });

// 3. Index on createdAt: Supports Admin view of everyone's notes with global pagination, sorted newest first
noteSchema.index({ createdAt: -1 });

export const Note: Model<INote> = mongoose.model<INote>('Note', noteSchema);
export default Note;
