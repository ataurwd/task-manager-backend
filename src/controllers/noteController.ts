import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import Note from '../models/Note';

// get notes with pagination (admin can view all or filter; users only see own)
export const getNotes = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string, 10) || 10));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (req.user?.role === 'admin') {
      if (req.query.userId) {
        filter.userId = req.query.userId;
      }
    } else {
      filter.userId = req.user?._id;
    }

    const [notes, total] = await Promise.all([
      Note.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email role'),
      Note.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
      },
      data: notes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notes',
      error: (error as Error).message
    });
  }
};

export const getNoteById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const noteId = req.params.id;
    const query: Record<string, unknown> = { _id: noteId };

    if (req.user?.role !== 'admin') {
      query.userId = req.user?._id;
    }

    const note = await Note.findOne(query).populate('userId', 'name email role');
    if (!note) {
      res.status(404).json({
        success: false,
        message: 'Note not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: note
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve note',
      error: (error as Error).message
    });
  }
};

export const createNote = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
      return;
    }

    const note = await Note.create({
      title,
      content,
      userId: req.user?._id
    });

    const populatedNote = await Note.findById(note._id).populate('userId', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: populatedNote
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create note',
      error: (error as Error).message
    });
  }
};

// only author can edit a note (even for admins)
export const updateNote = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const noteId = req.params.id;
    const { title, content } = req.body;

    const existingNote = await Note.findById(noteId);
    if (!existingNote) {
      res.status(404).json({
        success: false,
        message: 'Note not found'
      });
      return;
    }

    const isOwner = existingNote.userId.toString() === req.user?._id.toString();
    if (!isOwner) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: You can only edit notes that you have added yourself'
      });
      return;
    }

    const updatedNote = await Note.findOneAndUpdate(
      { _id: noteId, userId: req.user?._id },
      { $set: { ...(title && { title }), ...(content && { content }) } },
      { new: true, runValidators: true }
    ).populate('userId', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      data: updatedNote
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update note',
      error: (error as Error).message
    });
  }
};

// admins can delete any note; regular users can only delete their own
export const deleteNote = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const noteId = req.params.id;

    const query: Record<string, unknown> = { _id: noteId };
    if (req.user?.role !== 'admin') {
      query.userId = req.user?._id;
    }

    const deletedNote = await Note.findOneAndDelete(query);
    if (!deletedNote) {
      res.status(404).json({
        success: false,
        message: 'Note not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete note',
      error: (error as Error).message
    });
  }
};
