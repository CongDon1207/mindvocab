import React from 'react'
import { Input } from '@/components/ui/input'

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
  <div className="bg-white rounded-lg shadow p-4 mb-6">
    <div className="flex gap-4">
      <Input
        placeholder="Tìm kiếm từ..."
        value={searchQuery}
        onChange={(e) => onSearch(e.target.value)}
        className="flex-1"
      />
      <select
        value={posFilter}
        onChange={(e) => onPosChange(e.target.value)}
        className="border rounded px-3 py-2"
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
)

export default FolderWordFilters

