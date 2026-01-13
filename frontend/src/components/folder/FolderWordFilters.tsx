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
  <div className="bg-white/40 backdrop-blur-md rounded-2xl shadow-sm border border-white/60 p-4 mb-5">
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Tìm kiếm từ vựng..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          className="pl-11 pr-4 bg-white/60 border-white/40 rounded-xl focus:bg-white focus:ring-violet-200 transition-all shadow-sm"
        />
      </div>
      <div className="relative">
        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <select
          value={posFilter}
          onChange={(e) => onPosChange(e.target.value)}
          className="pl-11 pr-10 py-2 bg-white/60 border border-white/40 rounded-xl text-sm font-medium text-slate-600 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-300 transition-all min-w-[180px] appearance-none cursor-pointer shadow-sm hover:bg-white"
        >
          <option value="">Tất cả loại từ</option>
          <option value="noun">Noun</option>
          <option value="verb">Verb</option>
          <option value="adj">Adjective</option>
          <option value="adv">Adverb</option>
          <option value="prep">Preposition</option>
          <option value="phrase">Phrase</option>
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    </div>
  </div>
)

import { ChevronDown } from 'lucide-react'
export default FolderWordFilters

