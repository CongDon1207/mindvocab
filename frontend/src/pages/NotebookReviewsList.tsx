import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { BookOpen } from 'lucide-react';
import { NotebookEntry } from '../types/notebook';
import { NotebookCard } from '../components/notebook';

const NotebookReviewsList: React.FC = () => {
    const navigate = useNavigate();
    const [entries, setEntries] = useState<NotebookEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDueEntries = async () => {
        try {
            const res = await fetch('/api/notebook-entries?due=true');
            if (res.ok) {
                const data = await res.json();
                setEntries(data);
            }
        } catch (error) {
            console.error('Error fetching due reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDueEntries();
    }, []);

    const handleDelete = async (entryId: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa sổ tay này?')) return;
        try {
            const res = await fetch(`/api/notebook-entries/${entryId}`, { method: 'DELETE' });
            if (res.ok) {
                setEntries(prev => prev.filter(e => e._id !== entryId));
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
                // If scheduled for later, remove from due list
                if (days !== null && days > 0) {
                    setEntries(prev => prev.filter(e => e._id !== entryId));
                    alert(`Đã đặt lịch ôn tập sau ${days} ngày`);
                } else {
                    // Refresh the list
                    fetchDueEntries();
                    alert('Đã cập nhật lịch ôn tập');
                }
            }
        } catch (error) {
            console.error('Error scheduling review:', error);
            alert('Không thể đặt lịch ôn tập');
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-xl shadow-purple-500/5">
                <h1 className="text-3xl font-black bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent mb-2">
                    Ôn tập Sổ tay
                </h1>
                <p className="text-slate-500 font-medium">Danh sách các sổ tay đến hạn ôn tập (Spaced Repetition)</p>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
                </div>
            ) : entries.length === 0 ? (
                <div className="text-center p-12 bg-white/40 rounded-3xl border border-dashed border-slate-300">
                    <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-600 mb-2">Tuyệt vời!</h3>
                    <p className="text-slate-500">Bạn đã ôn hết các sổ tay đến hạn hôm nay.</p>
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
    );
};

export default NotebookReviewsList;
