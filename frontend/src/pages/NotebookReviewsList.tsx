import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { BookOpen, Calendar, Clock, ChevronRight, Play } from 'lucide-react';
import { NotebookEntry } from '../types/notebook';

const NotebookReviewsList: React.FC = () => {
    const navigate = useNavigate();
    const [entries, setEntries] = useState<NotebookEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
        fetchDueEntries();
    }, []);

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
                        <div
                            key={entry._id}
                            onClick={() => navigate(`/notebook/${entry._id}`)}
                            className="group cursor-pointer bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 border border-violet-100 transition-all hover:-translate-y-1 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-violet-500/10 to-pink-500/10 rounded-bl-full -z-10" />
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white flex items-center justify-center shadow-lg shadow-violet-200">
                                    <Play className="w-5 h-5 fill-white" />
                                </div>
                                <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-orange-200">
                                    <Clock className="w-3 h-3" />
                                    Đến hạn ôn
                                </div>
                            </div>
                            <h3 className="font-bold text-slate-800 text-lg mb-2 line-clamp-1">{entry.title}</h3>
                            <p className="text-sm text-slate-500 mb-4">
                                Đang ở giai đoạn SRS: <strong className="text-violet-600">{entry.meta.stage}</strong>
                            </p>

                            <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
                                <div className="flex items-center text-slate-500 gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>Cần ôn: ngay bây giờ</span>
                                </div>
                                <ChevronRight className="w-5 h-5 text-violet-400 group-hover:text-violet-600 transition-colors" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NotebookReviewsList;
