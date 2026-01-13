// src/components/folder/ReviewDashboard.tsx
import React from 'react'
import { FolderReviewStats } from '@/types/folder'
import { useNavigate } from 'react-router'
import {
    AlertCircle,
    ChevronRight,
    CheckCircle2,
    Clock,
    Calendar,
    Hourglass,
    ShieldCheck,
    RotateCcw,
    Sparkles,
    Zap
} from 'lucide-react'

interface ReviewDashboardProps {
    data: FolderReviewStats[]
    loading: boolean
    onResetProgress?: (folderId: string) => void
}

const ReviewDashboard: React.FC<ReviewDashboardProps> = ({ data, loading, onResetProgress }) => {
    const navigate = useNavigate()

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-violet-100 border-t-violet-500 animate-spin"></div>
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-violet-500 animate-pulse" />
                </div>
                <p className="mt-6 text-violet-500 font-bold animate-pulse">Đang tải phép thuật...</p>
            </div>
        )
    }

    if (data.length === 0) {
        return (
            <div className="bg-white/60 backdrop-blur-md rounded-3xl p-12 text-center border-2 border-dashed border-violet-200 flex flex-col items-center">
                <div className="h-20 w-20 bg-violet-50 rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <ShieldCheck className="h-10 w-10 text-violet-400" />
                </div>
                <h3 className="text-xl font-black text-violet-900 mb-2">Chưa có bài nào xong hết á!</h3>
                <p className="text-slate-500 max-w-sm">Học hết 100% từ vựng đi rồi quay lại đây nha!</p>
            </div>
        )
    }

    // Group data by category
    const groups = {
        overdue: data.filter(i => i.category === 'overdue'),
        d3: data.filter(i => i.category === '3days'),
        d7: data.filter(i => i.category === '7days'),
        d14: data.filter(i => i.category === '14days'),
        d30: data.filter(i => i.category === '30days'),
        safe: data.filter(i => i.category === 'safe'),
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">

            {/* Header - Dreamy Gradient */}
            <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-3xl p-8 text-white shadow-xl shadow-purple-200 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                            <Sparkles className="w-6 h-6 text-yellow-300" />
                        </span>
                        <h2 className="text-3xl font-black tracking-tight">Hồ Sơ Trí Nhớ</h2>
                    </div>
                    <p className="text-purple-100 font-medium max-w-2xl text-lg">
                        Danh sách các bộ từ vựng bạn đã <span className="text-white font-bold underline decoration-yellow-400 decoration-4">thuộc làu làu</span>!
                        Hệ thống sẽ nhắc bạn ôn lại đúng lúc để không bao giờ quên.
                    </p>
                </div>
                {/* Decorative blobs */}
                <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-pink-400 rounded-full blur-3xl opacity-50 mix-blend-overlay" />
                <div className="absolute -top-10 -left-10 w-64 h-64 bg-blue-400 rounded-full blur-3xl opacity-50 mix-blend-overlay" />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                {/* Column 1: Cần ôn ngay (Red/Rose) */}
                <div className="space-y-4">
                    <CategoryHeader
                        title="Cần ôn gấp!"
                        count={groups.overdue.length}
                        color="rose"
                        icon={<Zap className="h-5 w-5" />}
                    />
                    {groups.overdue.length === 0 ? (
                        <EmptyState message="Tuyệt vời! Không có bài nợ." color="rose" />
                    ) : (
                        groups.overdue.map(item => (
                            <RetentionCard 
                                key={item.folderId} 
                                item={item} 
                                color="rose" 
                                onClick={() => navigate(`/folders/${item.folderId}`)}
                                onReset={onResetProgress}
                            />
                        ))
                    )}
                </div>

                {/* Column 2: Sắp tới (Amber/Yellow) */}
                <div className="space-y-4">
                    <CategoryHeader
                        title="Sắp tới (3-7 ngày)"
                        count={groups.d3.length + groups.d7.length}
                        color="amber"
                        icon={<Clock className="h-5 w-5" />}
                    />
                    {[...groups.d3, ...groups.d7].length === 0 ? (
                        <EmptyState message="Chưa có lịch sắp tới." color="amber" />
                    ) : (
                        <>
                            {groups.d3.map(item => (
                                <RetentionCard 
                                    key={item.folderId} 
                                    item={item} 
                                    color="amber" 
                                    label="3 ngày" 
                                    onClick={() => navigate(`/folders/${item.folderId}`)}
                                    onReset={onResetProgress}
                                />
                            ))}
                            {groups.d7.map(item => (
                                <RetentionCard 
                                    key={item.folderId} 
                                    item={item} 
                                    color="amber" 
                                    label="7 ngày" 
                                    onClick={() => navigate(`/folders/${item.folderId}`)}
                                    onReset={onResetProgress}
                                />
                            ))}
                        </>
                    )}
                </div>

                {/* Column 3: Dài hạn (Sky/Blue) */}
                <div className="space-y-4">
                    <CategoryHeader
                        title="Dài hạn (> 2 tuần)"
                        count={groups.d14.length + groups.d30.length + groups.safe.length}
                        color="sky"
                        icon={<Calendar className="h-5 w-5" />}
                    />
                    {[...groups.d14, ...groups.d30, ...groups.safe].length === 0 ? (
                        <EmptyState message="Chưa có folder nào siêu trí nhớ." color="sky" />
                    ) : (
                        <>
                            {groups.d14.map(item => (
                                <RetentionCard 
                                    key={item.folderId} 
                                    item={item} 
                                    color="sky" 
                                    label="2 tuần" 
                                    onClick={() => navigate(`/folders/${item.folderId}`)}
                                    onReset={onResetProgress}
                                />
                            ))}
                            {groups.d30.map(item => (
                                <RetentionCard 
                                    key={item.folderId} 
                                    item={item} 
                                    color="violet" 
                                    label="1 tháng" 
                                    onClick={() => navigate(`/folders/${item.folderId}`)}
                                    onReset={onResetProgress}
                                />
                            ))}
                            {groups.safe.map(item => (
                                <RetentionCard 
                                    key={item.folderId} 
                                    item={item} 
                                    color="emerald" 
                                    label="An toàn" 
                                    onClick={() => navigate(`/folders/${item.folderId}`)}
                                    onReset={onResetProgress}
                                />
                            ))}
                        </>
                    )}
                </div>

            </div>
        </div>
    )
}

const CategoryHeader = ({ title, count, color, icon }: any) => {
    // Vibrant Pastel Headers
    const styles: any = {
        rose: 'bg-rose-100 text-rose-600 border-rose-200',
        amber: 'bg-amber-100 text-amber-600 border-amber-200',
        sky: 'bg-sky-100 text-sky-600 border-sky-200',
    }

    return (
        <div className={`flex items-center gap-3 p-4 rounded-2xl border-2 border-white shadow-sm ${styles[color]}`}>
            <div className="p-2 bg-white/60 rounded-xl backdrop-blur-sm shadow-sm">
                {icon}
            </div>
            <span className="font-bold flex-1 text-lg">{title}</span>
            <span className="bg-white px-3 py-1 rounded-full text-xs font-black shadow-sm">{count}</span>
        </div>
    )
}

const RetentionCard = ({ item, color, label, onClick, onReset }: { 
    item: FolderReviewStats, 
    color: string, 
    label?: string, 
    onClick: () => void,
    onReset?: (folderId: string) => void
}) => {
    // Dreamy Card Styles
    const styles: any = {
        rose: {
            bg: 'hover:bg-rose-50',
            border: 'hover:border-rose-200',
            iconBg: 'bg-rose-100',
            iconColor: 'text-rose-500',
            badge: 'bg-rose-100 text-rose-600'
        },
        amber: {
            bg: 'hover:bg-amber-50',
            border: 'hover:border-amber-200',
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-500',
            badge: 'bg-amber-100 text-amber-600'
        },
        sky: {
            bg: 'hover:bg-sky-50',
            border: 'hover:border-sky-200',
            iconBg: 'bg-sky-100',
            iconColor: 'text-sky-500',
            badge: 'bg-sky-100 text-sky-600'
        },
        violet: {
            bg: 'hover:bg-violet-50',
            border: 'hover:border-violet-200',
            iconBg: 'bg-violet-100',
            iconColor: 'text-violet-500',
            badge: 'bg-violet-100 text-violet-600'
        },
        emerald: {
            bg: 'hover:bg-emerald-50',
            border: 'hover:border-emerald-200',
            iconBg: 'bg-emerald-100',
            iconColor: 'text-emerald-500',
            badge: 'bg-emerald-100 text-emerald-600'
        }
    }

    const s = styles[color] || styles.sky

    const handleReset = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (onReset && confirm(`Reset tiến độ?`)) {
            onReset(item.folderId)
        }
    }

    return (
        <div className="relative group/card">
            <button
                onClick={onClick}
                className={`w-full bg-white/80 backdrop-blur-sm p-5 rounded-3xl border border-white shadow-sm transition-all text-left ${s.bg} ${s.border} hover:shadow-md hover:-translate-y-1 hover:scale-[1.02] duration-300`}
            >
                <div className="flex justify-between items-start mb-3">
                    <h4 className="font-bold text-slate-700 text-base line-clamp-1 flex-1">{item.folderName}</h4>
                    {label && <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${s.badge}`}>{label}</span>}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    {item.isManualSchedule ? (
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${s.iconBg} ${s.iconColor}`}>
                            <Clock className="h-3.5 w-3.5" />
                            <span>Thủ công</span>
                        </div>
                    ) : (
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${s.iconBg} ${s.iconColor}`}>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Đã thuộc lòng</span>
                        </div>
                    )}
                    <span className="opacity-60">• {item.totalWords} từ</span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400">
                        {item.category === 'overdue'
                            ? <span className="text-rose-500 animate-pulse">CẦN ÔN NGAY!</span>
                            : `Sau ${item.diffDays} ngày nữa`
                        }
                    </span>
                    <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center group-hover/card:bg-white group-hover/card:shadow-sm transition-all">
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover/card:text-slate-600" />
                    </div>
                </div>
            </button>
            
            {!item.isManualSchedule && onReset && (
                <button
                    onClick={handleReset}
                    className="absolute top-3 right-3 opacity-0 group-hover/card:opacity-100 transition-opacity p-1.5 hover:bg-rose-50 rounded-lg text-slate-300 hover:text-rose-500"
                    title="Reset"
                >
                    <RotateCcw className="h-4 w-4" />
                </button>
            )}
        </div>
    )
}

const EmptyState = ({ message, color }: { message: string, color: string }) => {
    const bgs: any = {
        rose: 'bg-rose-50 border-rose-100 text-rose-400',
        amber: 'bg-amber-50 border-amber-100 text-amber-400',
        sky: 'bg-sky-50 border-sky-100 text-sky-400',
    }

    return (
        <div className={`h-24 rounded-2xl border-2 border-dashed flex items-center justify-center ${bgs[color]}`}>
            <span className="font-bold text-sm">{message}</span>
        </div>
    )
}

export default ReviewDashboard