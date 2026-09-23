import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import Note from '../models/Note';

// @desc    Get paginated notes (Users: own notes; Admins: everyone's notes or filtered)
// @route   GET /api/notes
// @access  Private (User / Admin)
export const getNotes = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string, 10) || 10));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (req.user?.role === 'admin') {
      // Admin can view everyone's notes or optionally filter by a specific user
      if (req.query.userId) {
        filter.userId = req.query.userId;
      }
    } else {
      // Regular user can only view their own notes
      filter.userId = req.user?._id;
    }

    // Supported by indexes:
    // With userId: uses compound index { userId: 1, createdAt: -1 }
    // Without userId (Admin): uses index { createdAt: -1 }
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

// @desc    Get single note by ID
// @route   GET /api/notes/:id
// @access  Private (User: own note; Admin: any note)
export const getNoteById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const noteId = req.params.id;
    const query: Record<string, unknown> = { _id: noteId };

    // Regular users can only access their own notes; utilizes compound index { _id: 1, userId: 1 }
    if (req.user?.role !== 'admin') {
      query.userId = req.user?._id;
    }

    const note = await Note.findOne(query).populate('userId', 'name email role');
    if (!note) {
      res.status(404).json({
        success: false,
        message: 'Note not found or you do not have permission to view it'
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

// @desc    Create a new note
// @route   POST /api/notes
// @access  Private (User / Admin)
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

// @desc    Update a note (Users & Admins can only edit their own notes)
// @route   PUT /api/notes/:id
// @access  Private (Owner only)
export const updateNote = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const noteId = req.params.id;
    const { title, content } = req.body;

    // First check if note exists
    const existingNote = await Note.findById(noteId);
    if (!existingNote) {
      res.status(404).json({
        success: false,
        message: 'Note not found'
      });
      return;
    }

    // Strict rule: Admin can view all notes, but can ONLY edit their own added notes
    const isOwner = existingNote.userId.toString() === req.user?._id.toString();
    if (!isOwner) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: You can only edit notes that you have added yourself'
      });
      return;
    }

    // Supported by index { _id: 1, userId: 1 }
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

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private (User: own note; Admin: any note)
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
        message: 'Note not found or you do not have permission to delete it'
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
