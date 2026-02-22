import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Edit3, Save, FileUp, Trash2, Play, Download, AlertCircle, BookOpen, ChevronDown, ChevronRight, CheckCircle2, HelpCircle } from 'lucide-react';
import { NotebookEntry, ExerciseItem } from '../types/notebook';

const NotebookDetail: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [entry, setEntry] = useState<NotebookEntry | null>(null);
    const [loading, setLoading] = useState(true);

    // Edit mode states
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');

    // Upload states
    const [uploadting, setUploading] = useState(false);
    const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
    const [importResult, setImportResult] = useState<any>(null);

    // Exercise list view states
    const [expandedExercises, setExpandedExercises] = useState<Set<number>>(new Set());
    const [showAllExercises, setShowAllExercises] = useState(false);

    const fetchEntry = async () => {
        try {
            const res = await fetch(`/api/notebook-entries/${id}`);
            if (res.ok) {
                const data = await res.json();
                setEntry(data);
                setEditTitle(data.title);
                setEditContent(data.content);
            } else {
                navigate('/notebook');
            }
        } catch (error) {
            console.error('Error fetching entry:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEntry();
    }, [id]);

    const handleSave = async () => {
        try {
            const res = await fetch(`/api/notebook-entries/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: editTitle, content: editContent })
            });
            if (res.ok) {
                const data = await res.json();
                setEntry(data);
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Error updating entry:', error);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa sổ tay này?')) return;
        try {
            const res = await fetch(`/api/notebook-entries/${id}`, { method: 'DELETE' });
            if (res.ok) navigate('/notebook');
        } catch (error) {
            console.error('Error deleting entry:', error);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setImportResult(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('mode', importMode);

        try {
            const res = await fetch(`/api/notebook-entries/${id}/exercises/import`, {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            if (res.ok) {
                setImportResult({ type: 'success', data });
                fetchEntry(); // reload data to get new exercises
            } else {
                setImportResult({ type: 'error', data });
            }
        } catch (error) {
            console.error('Import error:', error);
            setImportResult({ type: 'error', message: 'Lỗi mạng hoặc server' });
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    if (loading) return <div className="p-12 text-center text-slate-500">Đang tải...</div>;
    if (!entry) return null;

    const isDue = new Date(entry.meta.nextReviewDate) <= new Date();

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/notebook')}
                    className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-100 text-slate-500 hover:text-violet-600 hover:bg-violet-50 hover:scale-105 transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <div className="text-sm font-bold text-violet-500 mb-1">CHI TIẾT SỔ TAY</div>
                    {!isEditing ? (
                        <h1 className="text-3xl font-black text-slate-800">{entry.title}</h1>
                    ) : (
                        <input
                            value={editTitle}
                            onChange={e => setEditTitle(e.target.value)}
                            className="text-3xl font-black w-full bg-transparent border-b-2 border-violet-500 focus:outline-none"
                        />
                    )}
                </div>
                {!isEditing ? (
                    <>
                        <button onClick={() => setIsEditing(true)} className="p-2 text-slate-400 hover:text-violet-500 bg-white rounded-xl shadow-sm border border-slate-100 transition-colors">
                            <Edit3 className="w-5 h-5" />
                        </button>
                        <button onClick={handleDelete} className="p-2 text-slate-400 hover:text-red-500 bg-white rounded-xl shadow-sm border border-slate-100 transition-colors">
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </>
                ) : (
                    <button onClick={handleSave} className="flex items-center gap-2 bg-violet-500 text-white px-4 py-2 rounded-xl font-bold shadow-md hover:bg-violet-600 transition-colors">
                        <Save className="w-4 h-4" /> Lưu
                    </button>
                )}
            </div>

            {/* Content Section */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Nội dung ghi chép</h2>
                {!isEditing ? (
                    <div className="prose max-w-none text-slate-600 whitespace-pre-wrap">
                        {entry.content || <span className="italic text-slate-400">Không có dữ liệu</span>}
                    </div>
                ) : (
                    <textarea
                        value={editContent}
                        onChange={e => setEditContent(e.target.value)}
                        rows={10}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-violet-500 outline-none"
                    />
                )}
            </div>

            {/* Exercises Section */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Bài tập gắn kèm ({entry.exercises?.length || 0})</h2>
                        <p className="text-sm text-slate-500">
                            Giai đoạn SRS: <strong className="text-violet-600">{entry.meta.stage}</strong> | Ôn lần tới: <strong>{new Date(entry.meta.nextReviewDate).toLocaleDateString('vi-VN')}</strong>
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <a
                            href="/import-samples/notebook-exercises.xlsx"
                            download
                            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                        >
                            <Download className="w-4 h-4" /> File mẫu
                        </a>

                        <div className="flex items-center gap-2">
                            <select
                                value={importMode}
                                onChange={(e) => setImportMode(e.target.value as 'replace' | 'append')}
                                className="text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                            >
                                <option value="replace">Ghi đè (Replace)</option>
                                <option value="append">Thêm vào (Append)</option>
                            </select>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadting}
                                className="flex items-center gap-2 px-4 py-2 bg-sky-100 text-sky-700 hover:bg-sky-200 rounded-xl font-bold transition-colors disabled:opacity-50"
                            >
                                <FileUp className="w-4 h-4" /> {uploadting ? 'Đang tải...' : 'Upload Excel'}
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                accept=".xlsx"
                                className="hidden"
                            />
                        </div>
                    </div>
                </div>

                {/* Import Results */}
                {importResult && (
                    <div className={`p-4 rounded-xl mb-6 ${importResult.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                        {importResult.type === 'success' ? (
                            <div className="text-green-700 text-sm">
                                <strong>Import thành công!</strong> Đã thêm/cập nhật {importResult.data.importedCount} câu. Bỏ qua {importResult.data.skippedCount} câu trùng.
                                {importResult.data.errors?.length > 0 && (
                                    <ul className="mt-2 list-disc list-inside text-red-600 text-xs">
                                        {importResult.data.errors.map((err: any, i: number) => <li key={i}>Dòng {err.row}: {err.message}</li>)}
                                    </ul>
                                )}
                            </div>
                        ) : (
                            <div className="text-red-700 text-sm flex gap-2">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <div>
                                    <strong>Import thất bại!</strong> {importResult.message || 'Dữ liệu không hợp lệ'}
                                    {importResult.data?.errors && (
                                        <ul className="mt-2 list-disc list-inside text-red-600 text-xs text-left">
                                            {importResult.data.errors.map((err: any, i: number) => <li key={i}>Dòng {err.row}: {err.message}</li>)}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Exercises List Preview */}
                {entry.exercises && entry.exercises.length > 0 && (
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                <HelpCircle className="w-4 h-4 text-violet-500" />
                                Danh sách câu hỏi
                            </h3>
                            <button
                                onClick={() => setShowAllExercises(!showAllExercises)}
                                className="text-xs text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1"
                            >
                                {showAllExercises ? 'Thu gọn' : `Xem tất cả (${entry.exercises.length})`}
                                {showAllExercises ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                            </button>
                        </div>
                        
                        <div className="space-y-3">
                            {(showAllExercises ? entry.exercises : entry.exercises.slice(0, 5)).map((ex, idx) => {
                                const isExpanded = expandedExercises.has(idx);
                                return (
                                    <div 
                                        key={ex._id || idx}
                                        className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden"
                                    >
                                        <button
                                            onClick={() => {
                                                const newSet = new Set(expandedExercises);
                                                if (isExpanded) {
                                                    newSet.delete(idx);
                                                } else {
                                                    newSet.add(idx);
                                                }
                                                setExpandedExercises(newSet);
                                            }}
                                            className="w-full flex items-start gap-3 p-4 text-left hover:bg-slate-100 transition-colors"
                                        >
                                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center text-sm font-bold">
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                                                        ex.type === 'mcq' 
                                                            ? 'bg-sky-100 text-sky-600' 
                                                            : 'bg-emerald-100 text-emerald-600'
                                                    }`}>
                                                        {ex.type === 'mcq' ? 'Trắc nghiệm' : 'Điền từ'}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-700 line-clamp-2">{ex.prompt}</p>
                                            </div>
                                            <div className="flex-shrink-0">
                                                {isExpanded ? (
                                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                                ) : (
                                                    <ChevronRight className="w-4 h-4 text-slate-400" />
                                                )}
                                            </div>
                                        </button>
                                        
                                        {isExpanded && (
                                            <div className="px-4 pb-4 pt-0 border-t border-slate-100 bg-white">
                                                <div className="pl-11 space-y-3">
                                                    {/* MCQ Options */}
                                                    {ex.type === 'mcq' && ex.options && (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                                                            {(['A', 'B', 'C', 'D'] as const).map((key) => {
                                                                const optionValue = ex.options?.[key];
                                                                if (!optionValue) return null;
                                                                const isCorrect = ex.answer === key;
                                                                return (
                                                                    <div 
                                                                        key={key}
                                                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                                                                            isCorrect 
                                                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                                                                : 'bg-slate-50 text-slate-600 border border-slate-100'
                                                                        }`}
                                                                    >
                                                                        <span className={`flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                                                                            isCorrect 
                                                                                ? 'bg-emerald-500 text-white' 
                                                                                : 'bg-slate-200 text-slate-600'
                                                                        }`}>
                                                                            {key}
                                                                        </span>
                                                                        <span className="truncate">{optionValue}</span>
                                                                        {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 ml-auto" />}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                    
                                                    {/* Fill Answer */}
                                                    {ex.type === 'fill' && (
                                                        <div className="mt-3 flex items-center gap-2">
                                                            <span className="text-sm text-slate-500">Đáp án:</span>
                                                            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-200">
                                                                {ex.answer.includes('|') ? ex.answer.split('|').join(' / ') : ex.answer}
                                                            </span>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Explanation */}
                                                    {ex.explanation && (
                                                        <div className="mt-3 p-3 bg-sky-50 text-sky-700 rounded-lg text-sm border border-sky-100">
                                                            <span className="font-medium">Giải thích:</span> {ex.explanation}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        
                        {!showAllExercises && entry.exercises.length > 5 && (
                            <button
                                onClick={() => setShowAllExercises(true)}
                                className="mt-3 w-full py-2 text-sm text-violet-600 hover:text-violet-700 font-medium hover:bg-violet-50 rounded-xl transition-colors"
                            >
                                Xem thêm {entry.exercises.length - 5} câu hỏi...
                            </button>
                        )}
                    </div>
                )}

                {/* Call to action for review */}
                <div className="text-center p-8 bg-gradient-to-br from-violet-50 to-pink-50 rounded-2xl border border-violet-100 mt-6">
                    <BookOpen className="w-12 h-12 text-violet-300 mx-auto mb-4" />
                    {entry.exercises?.length > 0 ? (
                        <>
                            {isDue ? (
                                <h3 className="text-xl font-bold text-violet-600 mb-2">Đến lúc ôn tập rồi!</h3>
                            ) : (
                                <h3 className="text-lg font-bold text-slate-600 mb-2">Chưa đến hạn ôn (vẫn có thể luyện tập)</h3>
                            )}
                            <button
                                onClick={() => navigate(`/notebook/${id}/review`)}
                                className="mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-8 py-4 rounded-full font-black text-lg shadow-xl shadow-violet-200 hover:scale-105 transition-all mx-auto"
                            >
                                <Play className="w-6 h-6 fill-white" /> Bắt đầu ôn tập
                            </button>
                        </>
                    ) : (
                        <p className="text-slate-500">Vui lòng tải lên file Excel để có bài tập ôn luyện.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotebookDetail;
