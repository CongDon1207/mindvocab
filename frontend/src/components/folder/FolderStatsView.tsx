import React from 'react'
import { FolderStatistics } from '@/types/folder'
import { BarChart3, Calendar, Clock, Info } from 'lucide-react'

interface FolderStatsViewProps {
    stats: FolderStatistics | null
    loading: boolean
}

const FolderStatsView: React.FC<FolderStatsViewProps> = ({ stats, loading }) => {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-500 font-medium">Đang phân tích dữ liệu...</p>
            </div>
        )
    }

    if (!stats) {
        return (
            <div className="py-20 text-center bg-white rounded-xl shadow-sm border border-gray-100">
                <Info className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Không có dữ liệu thống kê.</p>
            </div>
        )
    }

    // Phân bổ Stage labels
    const stageLabels: Record<number, { label: string; color: string; desc: string }> = {
        0: { label: 'Từ mới', color: 'bg-gray-200', desc: 'Chưa học lần nào' },
        1: { label: 'Cấp độ 1', color: 'bg-orange-200', desc: 'Mới bắt đầu' },
        2: { label: 'Cấp độ 2', color: 'bg-orange-300', desc: 'Đang ghi nhớ' },
        3: { label: 'Cấp độ 3', color: 'bg-blue-300', desc: 'Đã thuộc sơ bộ' },
        4: { label: 'Cấp độ 4', color: 'bg-blue-500', desc: 'Ghi nhớ tốt' },
        5: { label: 'Thành thạo', color: 'bg-green-500', desc: 'Đã thuộc lòng' },
    }


    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 1. SRS Stage Distribution */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Tiến độ ghi nhớ (SRS)</h3>
                </div>

                <div className="space-y-4">
                    {[5, 4, 3, 2, 1, 0].map((stage) => {
                        const count = stats.stageDistribution[stage] || 0
                        const percentage = (count / stats.totalWords) * 100
                        const info = stageLabels[stage]

                        return (
                            <div key={stage} className="group">
                                <div className="flex justify-between items-end mb-1 text-sm">
                                    <span className="font-semibold text-gray-700 flex items-center gap-2">
                                        {info.label}
                                        <span className="text-xs font-normal text-gray-400">({info.desc})</span>
                                    </span>
                                    <span className="font-bold text-gray-900">{count} từ</span>
                                </div>
                                <div className="h-3 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                                    <div
                                        className={`h-full ${info.color} transition-all duration-700 ease-out`}
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* 2. Review Forecast */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-purple-50 rounded-lg">
                        <Calendar className="h-5 w-5 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Dự báo lịch ôn tập</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <ForecastCard
                        label="Quá hạn"
                        count={stats.forecast.overdue}
                        color="text-red-600"
                        bgColor="bg-red-50"
                        sub="Cần ôn ngay"
                    />
                    <ForecastCard
                        label="Hôm qua/Hôm nay"
                        count={stats.forecast.today}
                        color="text-orange-600"
                        bgColor="bg-orange-50"
                        sub="Đến hạn"
                    />
                    <ForecastCard
                        label="Ngày mai"
                        count={stats.forecast.tomorrow}
                        color="text-blue-600"
                        bgColor="bg-blue-50"
                    />
                    <ForecastCard
                        label="3 ngày tới"
                        count={stats.forecast.next3Days}
                        color="text-indigo-600"
                        bgColor="bg-indigo-50"
                    />
                    <ForecastCard
                        label="Tuần tới"
                        count={stats.forecast.nextWeek}
                        color="text-purple-600"
                        bgColor="bg-purple-50"
                    />
                    <ForecastCard
                        label="Dài hạn"
                        count={stats.forecast.later}
                        color="text-gray-600"
                        bgColor="bg-gray-50"
                    />
                </div>

                {stats.forecast.overdue + stats.forecast.today > 0 && (
                    <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-100 flex items-start gap-3">
                        <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
                        <p className="text-sm text-amber-800">
                            Bạn đang có <strong>{stats.forecast.overdue + stats.forecast.today} từ</strong> cần ôn tập.
                            Hãy bắt đầu session học để duy trì trí nhớ tốt nhất nhé!
                        </p>
                    </div>
                )}
            </section>
        </div>
    )
}

interface ForecastCardProps {
    label: string
    count: number
    color: string
    bgColor: string
    sub?: string
}

const ForecastCard: React.FC<ForecastCardProps> = ({ label, count, color, bgColor, sub }) => (
    <div className={`${bgColor} p-4 rounded-xl border border-transparent hover:border-current transition-colors group`}>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
        <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-black ${color}`}>{count}</span>
            <span className="text-sm font-medium text-gray-400">từ</span>
        </div>
        {sub && <p className="text-[10px] text-gray-400 mt-1 font-medium">{sub}</p>}
    </div>
)

export default FolderStatsView
