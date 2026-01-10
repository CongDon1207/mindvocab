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
    RotateCcw
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
                    <div className="h-16 w-16 rounded-full border-4 border-slate-100 border-t-emerald-600 animate-spin"></div>
                    <Hourglass className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-emerald-600 animate-pulse" />
                </div>
                <p className="mt-6 text-slate-500 font-medium animate-pulse">Đang phân tích dữ liệu...</p>
            </div>
        )
    }

    // Nếu không có folder nào 100%
    if (data.length === 0) {
        return (
            <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-100 flex flex-col items-center">
                <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <ShieldCheck className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Chưa có bộ từ vựng nào cần ôn tập</h3>
                <p className="text-slate-500 max-w-sm">Hãy hoàn thành tất cả các từ trong một folder hoặc đặt lịch ôn tập thủ công từ menu thả xuống trên mỗi thư mục!</p>
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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 text-white shadow-xl shadow-emerald-100 relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-3xl font-black tracking-tight mb-2">Bảng theo dõi trí nhớ</h2>
                    <p className="text-emerald-100 font-medium max-w-2xl">
                        Đây là danh sách các bộ từ vựng bạn đã <span className="text-white font-bold underline">thuộc lòng 100%</span> hoặc
                        đã <span className="text-white font-bold underline">đặt lịch ôn tập thủ công</span>.
                        Hệ thống sẽ nhắc bạn ôn lại theo các mốc thời gian tối ưu để ghi nhớ lâu dài.
                    </p>
                </div>
                <ShieldCheck className="absolute -bottom-6 -right-6 h-48 w-48 text-white/10 rotate-12" />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                {/* Column 1: Active Review (Overdue) */}
                <div className="space-y-4">
                    <CategoryHeader
                        title="Cần ôn ngay"
                        count={groups.overdue.length}
                        color="red"
                        icon={<AlertCircle className="h-5 w-5" />}
                    />
                    {groups.overdue.length === 0 ? (
                        <EmptyState message="Không có bài quá hạn" />
                    ) : (
                        groups.overdue.map(item => (
                            <RetentionCard 
                                key={item.folderId} 
                                item={item} 
                                color="red" 
                                onClick={() => navigate(`/folders/${item.folderId}`)}
                                onReset={onResetProgress}
                            />
                        ))
                    )}
                </div>

                {/* Column 2: Short Term (3-7 Days) */}
                <div className="space-y-4">
                    <CategoryHeader
                        title="Sắp tới (3-7 ngày)"
                        count={groups.d3.length + groups.d7.length}
                        color="orange"
                        icon={<Clock className="h-5 w-5" />}
                    />
                    {[...groups.d3, ...groups.d7].length === 0 ? (
                        <EmptyState message="Trống" />
                    ) : (
                        <>
                            {groups.d3.map(item => (
                                <RetentionCard 
                                    key={item.folderId} 
                                    item={item} 
                                    color="orange" 
                                    label="3 ngày" 
                                    onClick={() => navigate(`/folders/${item.folderId}`)}
                                    onReset={onResetProgress}
                                />
                            ))}
                            {groups.d7.map(item => (
                                <RetentionCard 
                                    key={item.folderId} 
                                    item={item} 
                                    color="yellow" 
                                    label="7 ngày" 
                                    onClick={() => navigate(`/folders/${item.folderId}`)}
                                    onReset={onResetProgress}
                                />
                            ))}
                        </>
                    )}
                </div>

                {/* Column 3: Long Term (14-30+ Days) */}
                <div className="space-y-4">
                    <CategoryHeader
                        title="Dài hạn (> 2 tuần)"
                        count={groups.d14.length + groups.d30.length + groups.safe.length}
                        color="blue"
                        icon={<Calendar className="h-5 w-5" />}
                    />
                    {[...groups.d14, ...groups.d30, ...groups.safe].length === 0 ? (
                        <EmptyState message="Chưa có folder nào đạt mốc này" />
                    ) : (
                        <>
                            {groups.d14.map(item => (
                                <RetentionCard 
                                    key={item.folderId} 
                                    item={item} 
                                    color="blue" 
                                    label="2 tuần" 
                                    onClick={() => navigate(`/folders/${item.folderId}`)}
                                    onReset={onResetProgress}
                                />
                            ))}
                            {groups.d30.map(item => (
                                <RetentionCard 
                                    key={item.folderId} 
                                    item={item} 
                                    color="indigo" 
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
    const colors: any = {
        red: 'bg-red-50 text-red-600 border-red-100',
        orange: 'bg-orange-50 text-orange-600 border-orange-100',
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
    }

    return (
        <div className={`flex items-center gap-3 p-3 rounded-xl border ${colors[color]}`}>
            {icon}
            <span className="font-bold flex-1">{title}</span>
            <span className="bg-white/50 px-2 py-0.5 rounded-md text-xs font-black shadow-sm">{count}</span>
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
    const badges: any = {
        red: 'bg-red-100 text-red-700',
        orange: 'bg-orange-100 text-orange-700',
        yellow: 'bg-yellow-100 text-yellow-700',
        blue: 'bg-blue-100 text-blue-700',
        indigo: 'bg-indigo-100 text-indigo-700',
        emerald: 'bg-emerald-100 text-emerald-700',
    }

    const borderColors: any = {
        red: 'hover:border-red-300 hover:shadow-red-50',
        orange: 'hover:border-orange-300 hover:shadow-orange-50',
        yellow: 'hover:border-yellow-300 hover:shadow-yellow-50',
        blue: 'hover:border-blue-300 hover:shadow-blue-50',
        indigo: 'hover:border-indigo-300 hover:shadow-indigo-50',
        emerald: 'hover:border-emerald-300 hover:shadow-emerald-50',
    }

    const handleReset = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (onReset && confirm(`Bạn có chắc muốn reset toàn bộ tiến độ học của thư mục "${item.folderName}"?\n\nTất cả từ sẽ trở về trạng thái chưa học.`)) {
            onReset(item.folderId)
        }
    }

    return (
        <div className="relative group/card">
            <button
                onClick={onClick}
                className={`w-full bg-white p-4 rounded-2xl border border-slate-100 shadow-sm transition-all text-left ${borderColors[color]} group-hover/card:-translate-y-1`}
            >
                <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-800 line-clamp-1 flex-1">{item.folderName}</h4>
                    {label && <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${badges[color]}`}>{label}</span>}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                    {item.isManualSchedule ? (
                        <>
                            <Clock className="h-3 w-3 text-blue-500" />
                            <span>Đặt lịch thủ công • {item.masteredWords ?? 0}/{item.totalWords} từ</span>
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            <span>100% thuộc lòng ({item.totalWords} từ)</span>
                        </>
                    )}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-50 flex justify-between items-center">
                    <span className="text-xs font-medium text-slate-500">
                        {item.category === 'overdue'
                            ? <span className="text-red-500 font-bold">Cần ôn ngay!</span>
                            : `Ôn lại sau ${item.diffDays} ngày`
                        }
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover/card:text-slate-600" />
                </div>
            </button>
            
            {/* Reset button - only show for 100% mastered (not manual schedule) */}
            {!item.isManualSchedule && onReset && (
                <button
                    onClick={handleReset}
                    className="absolute top-2 right-2 opacity-0 group-hover/card:opacity-100 transition-opacity p-2 bg-white hover:bg-red-50 rounded-lg border border-slate-200 hover:border-red-300 shadow-sm"
                    title="Reset tiến độ học"
                >
                    <RotateCcw className="h-3.5 w-3.5 text-red-500" />
                </button>
            )}
        </div>
    )
}

const EmptyState = ({ message }: { message: string }) => (
    <div className="h-24 rounded-xl border-2 border-dashed border-slate-100 flex items-center justify-center">
        <span className="text-slate-400 text-sm font-medium">{message}</span>
    </div>
)

export default ReviewDashboard
