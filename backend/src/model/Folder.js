import mongoose from 'mongoose';

const FolderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    ownerId: { type: String, index: true }, // để sẵn, sau này có auth thì dùng
    stats: {
      totalWords: { type: Number, default: 0 },
      mastered: { type: Number, default: 0 }
    },
    // Manual review scheduling (Forgetting Curve)
    // User can set this manually to schedule a review reminder
    nextReviewDate: { type: Date, default: null }
  },
  { timestamps: true }
);

// Tối ưu tìm kiếm theo tên
FolderSchema.index({ name: 1 });

const Folder = mongoose.model('Folder', FolderSchema);
export default Folder;