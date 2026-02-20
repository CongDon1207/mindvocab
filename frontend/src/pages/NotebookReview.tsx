import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, CheckCircle2, ChevronRight, BookOpen, AlertCircle } from 'lucide-react';
import { NotebookEntry, ExerciseItem } from '../types/notebook';
import confetti from 'canvas-confetti';

const NotebookReview: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [entry, setEntry] = useState<NotebookEntry | null>(null);
    const [exercises, setExercises] = useState<ExerciseItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Game states
    const [answers, setAnswers] = useState<string[]>([]);
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [isDone, setIsDone] = useState(false);

    // Result state
    const [submitting, setSubmitting] = useState(false);
    const [resultStage, setResultStage] = useState<{ stage: number, nextDate: string, score: number } | null>(null);

    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const fetchEntry = async () => {
            try {
                const res = await fetch(`/api/notebook-entries/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setEntry(data);

                    if (!data.exercises || data.exercises.length === 0) {
                        setErrorMsg('Chưa có bài tập nào. Vui lòng quay lại và import Excel.');
                    } else {
                        // Shuffle
                        setExercises([...data.exercises].sort(() => 0.5 - Math.random()));
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchEntry();
    }, [id]);

    const handleMCQSelect = (key: string) => {
        if (submitted) return;
        setCurrentAnswer(key);
    };

    const checkAnswer = () => {
        if (!currentAnswer.trim() && exercises[currentIndex].type === 'fill') return;
        setAnswers([...answers, currentAnswer]);
        setSubmitted(true);
    };

    const nextQuestion = () => {
        if (currentIndex < exercises.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setCurrentAnswer('');
            setSubmitted(false);
        } else {
            finishReview();
        }
    };

    const finishReview = async () => {
        setIsDone(true);
        setSubmitting(true);

        // Calculate correct count
        const correctCount = answers.reduce((acc, ans, idx) => {
            const ex = exercises[idx];
            if (ex.type === 'mcq') {
                return acc + (ans === ex.answer ? 1 : 0);
            } else {
                const valids = ex.answer.split('|').map(a => a.trim().toLowerCase());
                const userAns = ans.trim().toLowerCase();
                return acc + (valids.includes(userAns) ? 1 : 0);
            }
        }, 0);

        const score = correctCount / exercises.length;
        if (score >= 0.8) {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }

        try {
            const res = await fetch(`/api/notebook-entries/${id}/review`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correctCount, totalCount: exercises.length })
            });
            if (res.ok) {
                const data = await res.json();
                setResultStage({ stage: data.stage, nextDate: data.nextReviewDate, score });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-center p-12">Đang tải...</div>;
    if (errorMsg) return (
        <div className="text-center p-12 bg-white rounded-3xl shadow-sm border border-slate-100 max-w-xl mx-auto">
            <AlertCircle className="mx-auto w-12 h-12 text-red-400 mb-4" />
            <p className="text-slate-600 mb-6">{errorMsg}</p>
            <button onClick={() => navigate(`/notebook/${id}`)} className="bg-violet-100 text-violet-600 px-6 py-2 rounded-xl font-bold">Quay lại</button>
        </div>
    );
    if (!entry || exercises.length === 0) return null;

    if (isDone && resultStage) {
        const isPassed = resultStage.score >= 0.8;
        return (
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-xl shadow-purple-500/10 border border-slate-100 text-center space-y-6">
                <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center ${isPassed ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>
                    {isPassed ? <CheckCircle2 className="w-12 h-12" /> : <AlertCircle className="w-12 h-12" />}
                </div>
                <div>
                    <h2 className="text-3xl font-black text-slate-800 mb-2">
                        {isPassed ? 'Tuyệt vời!' : 'Cần cố gắng thêm!'}
                    </h2>
                    <p className="text-slate-500">
                        Bạn đúng {Math.round(resultStage.score * 100)}% ({Math.round(resultStage.score * exercises.length)}/{exercises.length})
                    </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-sm text-slate-500">Giai đoạn SRS (Spaced Repetition):</p>
                    <p className="font-bold text-violet-600 text-xl">{resultStage.stage}</p>
                    <p className="text-sm mt-2 font-bold text-slate-600">Ôn lần tiếp theo: {new Date(resultStage.nextDate).toLocaleDateString('vi-VN')}</p>
                </div>
                <button
                    onClick={() => navigate('/notebook')}
                    className="bg-violet-500 text-white w-full py-4 rounded-xl font-bold text-lg hover:bg-violet-600 transition-colors"
                >
                    Trở về danh sách sổ tay
                </button>
            </div>
        );
    }

    const ex = exercises[currentIndex];
    let isCorrect = false;
    if (submitted) {
        if (ex.type === 'mcq') {
            isCorrect = currentAnswer === ex.answer;
        } else {
            const valids = ex.answer.split('|').map(a => a.trim().toLowerCase());
            isCorrect = valids.includes(currentAnswer.trim().toLowerCase());
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header Progess */}
            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <button onClick={() => { if (window.confirm('Hủy ôn tập?')) navigate(`/notebook/${id}`) }} className="text-slate-400 hover:text-red-500 p-2">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1 bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-full transition-all duration-300"
                        style={{ width: `${((currentIndex) / exercises.length) * 100}%` }}
                    />
                </div>
                <div className="text-sm font-bold text-slate-500 w-16 text-right">
                    {currentIndex + 1} / {exercises.length}
                </div>
            </div>

            {/* Question Card */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                {/* Content Note Extract (optional info display) */}
                {!submitted && (
                    <div className="mb-6 pb-6 border-b border-slate-100 text-sm font-medium text-slate-500 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" /> Luyện tập: {entry.title}
                    </div>
                )}

                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-8 whitespace-pre-wrap leading-relaxed">
                    {ex.prompt}
                </h2>

                {/* Input area */}
                <div className="space-y-3">
                    {ex.type === 'mcq' && ex.options && (
                        Object.entries(ex.options).map(([key, val]) => {
                            if (!val) return null;

                            let style = "border-slate-200 text-slate-700 hover:border-violet-300 hover:bg-violet-50";
                            if (currentAnswer === key && !submitted) style = "border-violet-500 bg-violet-50 text-violet-700 ring-2 ring-violet-200";

                            // Feedback styling after submit
                            if (submitted) {
                                if (key === ex.answer) {
                                    style = "bg-green-100 border-green-500 text-green-800 ring-2 ring-green-200";
                                } else if (key === currentAnswer && !isCorrect) {
                                    style = "bg-red-50 border-red-300 text-red-600";
                                } else {
                                    style = "border-slate-100 text-slate-400 opacity-50";
                                }
                            }

                            return (
                                <button
                                    key={key}
                                    disabled={submitted}
                                    onClick={() => handleMCQSelect(key)}
                                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all font-medium flex items-center gap-3 ${style}`}
                                >
                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${currentAnswer === key && !submitted ? 'bg-violet-500 text-white' : 'bg-white border-2 border-inherit text-inherit'}`}>
                                        {key}
                                    </span>
                                    {val}
                                </button>
                            );
                        })
                    )}

                    {ex.type === 'fill' && (
                        <div className="space-y-4">
                            <input
                                type="text"
                                disabled={submitted}
                                autoFocus
                                value={currentAnswer}
                                onChange={e => setCurrentAnswer(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && currentAnswer && !submitted && checkAnswer()}
                                placeholder="Nhập câu trả lời..."
                                className={`w-full p-4 rounded-2xl border-2 text-lg font-bold outline-none transition-all ${submitted
                                    ? (isCorrect ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700')
                                    : 'border-slate-200 focus:border-violet-500 text-slate-800'
                                    }`}
                            />
                            {submitted && !isCorrect && (
                                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                                    <span className="text-sm font-bold text-green-700 block mb-1">Đáp án đúng:</span>
                                    <p className="font-medium text-green-800">{ex.answer.split('|').join(' hoặc ')}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Explanation */}
                {submitted && ex.explanation && (
                    <div className="mt-6 p-4 bg-sky-50 border border-sky-100 rounded-2xl text-sky-800 text-sm">
                        <strong className="block mb-1">Giải thích:</strong>
                        {ex.explanation}
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end pt-4">
                {!submitted ? (
                    <button
                        disabled={!currentAnswer.trim()}
                        onClick={checkAnswer}
                        className="bg-violet-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-violet-600 active:scale-95 transition-all shadow-lg disabled:opacity-50 disabled:active:scale-100 focus:outline-none"
                    >
                        Kiểm tra
                    </button>
                ) : (
                    <button
                        autoFocus
                        disabled={submitting}
                        onClick={nextQuestion}
                        className="flex items-center gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-8 py-4 rounded-xl font-bold hover:from-violet-600 hover:to-fuchsia-600 active:scale-95 transition-all shadow-lg focus:outline-none disabled:opacity-50"
                    >
                        {currentIndex < exercises.length - 1 ? 'Tiếp tục' : 'Hoàn thành'} <ChevronRight className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default NotebookReview;
