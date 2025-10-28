// src/controllers/folderController.js
import Folder from '../model/Folder.js';

/**
 * Tạo thư mục mới
 * Body: { name: string, description?: string }
 */
export async function createFolder(req, res) {
  try {
    const name = (req.body?.name || '').trim();
    const description = (req.body?.description || '').trim();

    if (!name) {
      return res.status(400).json({ error: 'Tên thư mục (name) là bắt buộc.' });
    }

    const doc = await Folder.create({ name, description });
    return res.status(201).json(doc);
  } catch (err) {
    return res.status(500).json({
      error: 'Tạo thư mục thất bại.',
      detail: err.message,
    });
  }
}

/**
 * Lấy danh sách thư mục (mới nhất trước)
 */
export async function listFolders(_req, res) {
  try {
    const docs = await Folder.find().sort({ createdAt: -1 });
    return res.json(docs);
  } catch (err) {
    return res.status(500).json({
      error: 'Không lấy được danh sách thư mục.',
      detail: err.message,
    });
  }
}

/**
 * Lấy chi tiết 1 thư mục theo id
 * Param: :id
 */
export async function getFolderById(req, res) {
  try {
    const folder = await Folder.findById(req.params.id);
    if (!folder) {
      return res.status(404).json({ error: 'Không tìm thấy thư mục.' });
    }
    return res.json(folder);
  } catch (err) {
    // 400 thay vì 500 để phản hồi khi id sai định dạng
    return res.status(400).json({
      error: 'ID không hợp lệ hoặc truy vấn lỗi.',
      detail: err.message,
    });
  }
}

export async function updateFolder(req, res){
  try{
    const id = req.params.id;
    const name = (req.body?.name || '').trim();
    const description = (req.body?.description || '').trim();

    if (!name) {
      return res.status(400).json({ error: 'Tên thư mục (name) là bắt buộc.' });
    }

    const updatedFolder = await Folder.findByIdAndUpdate(id, { name, description }, { new: true });
    if (!updatedFolder) {
      return res.status(404).json({ error: 'Không tìm thấy thư mục để cập nhật.' });
    }
    return res.json(updatedFolder);
  }catch(error){
    return res.status(500).json({
      error: 'Cập nhật thư mục thất bại.',
      detail: error.message,
    });
  }
}
/**
 * Xóa thư mục theo id
 * Param: :id
 */
export async function deleteFolder(req, res) {
  try {
    const deletedFolder = await Folder.findByIdAndDelete(req.params.id);
    if (!deletedFolder) {
      return res.status(404).json({ error: 'Không tìm thấy thư mục để xóa.' });
    }
    return res.json({ message: 'Thư mục đã được xóa thành công.' });
  } catch (err) {
    return res.status(400).json({
      error: 'ID không hợp lệ hoặc xóa thất bại.',
      detail: err.message,
    });
  }
}
