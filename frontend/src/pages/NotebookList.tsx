import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { BookOpen, Plus, LayoutGrid, CalendarClock } from 'lucide-react';
import { NotebookEntry } from '../types/notebook';
import { NotebookCard } from '../components/notebook';

const NotebookList: React.FC = () => {
    const navigate = useNavigate();
    const [entries, setEntries] = useState<NotebookEntry[]>([]);
    const [dueEntries, setDueEntries] = useState<NotebookEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [dueLoading, setDueLoading] = useState(true);

    // Tab state
    const [activeTab, setActiveTab] = useState<'list' | 'review'>('list');

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

    const fetchDueEntries = async () => {
        setDueLoading(true);
        try {
            const res = await fetch('/api/notebook-entries?due=true');
            if (res.ok) {
                const data = await res.json();
                setDueEntries(data);
            }
        } catch (error) {
            console.error('Error fetching due notebooks:', error);
        } finally {
            setDueLoading(false);
        }
    };

    useEffect(() => {
        fetchEntries();
        fetchDueEntries();
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

    const handleDelete = async (entryId: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa sổ tay này?')) return;
        try {
            const res = await fetch(`/api/notebook-entries/${entryId}`, { method: 'DELETE' });
            if (res.ok) {
                setEntries(prev => prev.filter(e => e._id !== entryId));
                setDueEntries(prev => prev.filter(e => e._id !== entryId));
            }
        } catch (error) {
            console.error('Error deleting notebook:', error);
        }
    };

    const handleScheduleReview = async (entryId: string, days: number | null) => {
        try {
            const res = await fetch(`/api/notebook-entries/${entryId}/schedule`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ days })
            });
            
            if (res.ok) {
                const data = await res.json();
                // Update local state with new meta
                setEntries(prev => prev.map(e => 
                    e._id === entryId 
                        ? { ...e, meta: data.meta }
                        : e
                ));
                
                // Refresh due entries list
                fetchDueEntries();
                
                if (days !== null) {
                    alert(`Đã đặt lịch ôn tập sau ${days} ngày`);
                } else {
                    alert('Đã đặt về trạng thái "Cần ôn ngay"');
                }
            }
        } catch (error) {
            console.error('Error scheduling review:', error);
            alert('Không thể đặt lịch ôn tập');
        }
    };

    // Count overdue notebooks for badge
    const overdueCount = dueEntries.length;

    return (
        <div className="space-y-6">
            {/* Header */}
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

            {/* Tab Switcher */}
            <div className="flex gap-2 p-1.5 bg-white/40 backdrop-blur-md w-fit rounded-2xl border border-white/60 shadow-sm">
                <button
                    onClick={() => setActiveTab('list')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all text-sm font-black tracking-wide ${
                        activeTab === 'list'
                            ? 'bg-white text-violet-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-white/20'
                    }`}
                >
                    <LayoutGrid className="h-4 w-4" />
                    Tất cả sổ tay
                </button>
                <button
                    onClick={() => setActiveTab('review')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all text-sm font-black tracking-wide relative ${
                        activeTab === 'review'
                            ? 'bg-white text-violet-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-white/20'
                    }`}
                >
                    <CalendarClock className="h-4 w-4" />
                    Lịch ôn tập
                    {overdueCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 bg-rose-500 rounded-full border-2 border-white text-[10px] text-white font-bold flex items-center justify-center">
                            {overdueCount > 9 ? '9+' : overdueCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Create Form */}
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

            {/* Tab Content */}
            {activeTab === 'list' ? (
                // All Notebooks Tab
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
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
                                <NotebookCard
                                    key={entry._id}
                                    id={entry._id}
                                    title={entry.title}
                                    content={entry.content}
                                    exerciseCount={entry.exercises?.length || 0}
                                    stage={entry.meta.stage}
                                    nextReviewDate={entry.meta.nextReviewDate}
                                    onClick={() => navigate(`/notebook/${entry._id}`)}
                                    onStartReview={() => navigate(`/notebook/${entry._id}/review`)}
                                    onDelete={() => handleDelete(entry._id)}
                                    onScheduleReview={(days) => handleScheduleReview(entry._id, days)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                // Review Schedule Tab
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {dueLoading ? (
                        <div className="flex justify-center p-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
                        </div>
                    ) : dueEntries.length === 0 ? (
                        <div className="text-center p-12 bg-white/40 rounded-3xl border border-dashed border-slate-300">
                            <CalendarClock className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-600 mb-2">Tuyệt vời! 🎉</h3>
                            <p className="text-slate-500">Bạn đã ôn hết các sổ tay đến hạn hôm nay.</p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-2xl">
                                <p className="text-rose-700 font-medium text-sm">
                                    <CalendarClock className="w-4 h-4 inline-block mr-2" />
                                    Bạn có <strong>{dueEntries.length}</strong> sổ tay cần ôn tập ngay!
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {dueEntries.map((entry) => (
                                    <NotebookCard
                                        key={entry._id}
                                        id={entry._id}
                                        title={entry.title}
                                        content={entry.content}
                                        exerciseCount={entry.exercises?.length || 0}
                                        stage={entry.meta.stage}
                                        nextReviewDate={entry.meta.nextReviewDate}
                                        onClick={() => navigate(`/notebook/${entry._id}`)}
                                        onStartReview={() => navigate(`/notebook/${entry._id}/review`)}
                                        onDelete={() => handleDelete(entry._id)}
                                        onScheduleReview={(days) => handleScheduleReview(entry._id, days)}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotebookList;
