import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { BookOpen, Plus, Calendar, Clock, ChevronRight } from 'lucide-react';
import { NotebookEntry } from '../types/notebook';

const NotebookList: React.FC = () => {
    const navigate = useNavigate();
    const [entries, setEntries] = useState<NotebookEntry[]>([]);
    const [loading, setLoading] = useState(true);

    // State for creating new entry
    const [isCreating, setIsCreating] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');

    const fetchEntries = async () => {
        try {
            const res = await fetch('/api/notebook-entries');
            if (res.ok) {
                const data = await res.json();
                setEntries(data);
            }
        } catch (error) {
            console.error('Error fetching notebooks:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEntries();
    }, []);

    const handleCreate = async () => {
        if (!newTitle.trim() || !newContent.trim()) return;
        try {
            const res = await fetch('/api/notebook-entries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTitle, content: newContent })
            });
            if (res.ok) {
                const entry = await res.json();
                setIsCreating(false);
                setNewTitle('');
                setNewContent('');
                navigate(`/notebook/${entry._id}`);
            }
        } catch (error) {
            console.error('Error creating notebook:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-xl shadow-purple-500/5">
                <div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent mb-2">
                        Sổ tay của bạn
                    </h1>
                    <p className="text-slate-500 font-medium">Ghi chép và luyện tập bằng Flashcards</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-violet-200 transition-all hover:scale-105 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    <span>Tạo sổ tay mới</span>
                </button>
            </div>

            {isCreating && (
                <div className="bg-white p-6 rounded-3xl shadow-xl shadow-purple-500/5 border border-purple-100">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Tạo Sổ tay mới</h2>
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Tiêu đề sổ tay..."
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all"
                        />
                        <textarea
                            placeholder="Nội dung/ghi chú..."
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all"
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsCreating(false)}
                                className="px-6 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleCreate}
                                className="px-6 py-2 rounded-xl font-bold text-white bg-violet-500 hover:bg-violet-600 transition-colors"
                            >
                                Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
                </div>
            ) : entries.length === 0 ? (
                <div className="text-center p-12 bg-white/40 rounded-3xl border border-dashed border-slate-300">
                    <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-600 mb-2">Chưa có sổ tay nào</h3>
                    <p className="text-slate-500">Bấm "Tạo sổ tay mới" để bắt đầu ghi chép nhé!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {entries.map((entry) => (
                        <div
                            key={entry._id}
                            onClick={() => navigate(`/notebook/${entry._id}`)}
                            className="group cursor-pointer bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 border border-slate-100 transition-all hover:-translate-y-1"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-violet-500 group-hover:text-white transition-all">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Giai đoạn: {entry.meta.stage}
                                </div>
                            </div>
                            <h3 className="font-bold text-slate-800 text-lg mb-2 line-clamp-1">{entry.title}</h3>
                            <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                                {entry.content || 'Chưa có nội dung'}
                            </p>

                            <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
                                <div className="flex items-center text-slate-500 gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>Ôn lần tới: {new Date(entry.meta.nextReviewDate).toLocaleDateString('vi-VN')}</span>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-violet-500 transition-colors" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NotebookList;
