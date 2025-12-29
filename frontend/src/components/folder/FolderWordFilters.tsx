import React from 'react'
import { Input } from '@/components/ui/input'
import { Search, Filter } from 'lucide-react'

type FolderWordFiltersProps = {
  searchQuery: string
  onSearch: (value: string) => void
  posFilter: string
  onPosChange: (value: string) => void
}

const FolderWordFilters: React.FC<FolderWordFiltersProps> = ({
  searchQuery,
  onSearch,
  posFilter,
  onPosChange,
}) => (
  <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200/60 p-4 mb-5">
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Tìm kiếm từ vựng..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          className="pl-10 bg-slate-50/50 border-slate-200 focus:bg-white transition-colors"
        />
      </div>
      <div className="relative">
        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <select
          value={posFilter}
          onChange={(e) => onPosChange(e.target.value)}
          className="pl-10 pr-4 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all min-w-[160px] appearance-none cursor-pointer"
        >
          <option value="">Tất cả loại từ</option>
          <option value="noun">Noun</option>
          <option value="verb">Verb</option>
          <option value="adj">Adjective</option>
          <option value="adv">Adverb</option>
          <option value="prep">Preposition</option>
          <option value="phrase">Phrase</option>
        </select>
      </div>
    </div>
  </div>
)

export default FolderWordFilters

