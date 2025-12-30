// src/pages/FolderDetail.tsx
import React, { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { WordsTable } from '@/components/word'
import {
  FolderDetailHeader,
  FolderWordFilters,
  FolderPagination,
  FolderStatsView,
  FolderModals,
} from '@/components/folder'
import { useFolderDetail } from '@/hooks/useFolderDetail'
import { LayoutGrid, BarChart3 } from 'lucide-react'

const FolderDetail: React.FC = () => {
  const {
    id, folder, words, total, loading, error, page, totalPages, limit,
    searchQuery, posFilter, isAddDialogOpen, editingWord, isUploadDialogOpen, isImportDrawerOpen,
    activeJobId, enrichingIds, activeTab, folderStats, statsLoading,
    setPage, setSearchQuery, setPosFilter, setIsAddDialogOpen, setEditingWord, setIsUploadDialogOpen,
    setIsImportDrawerOpen, setActiveTab, handleAddWord, handleUpdateWord, handleDeleteWord,
    handleEnrichWord, handleStartLearning, handleStartRetrySession,
    handleImportJobCreated, handleJobFinished, navigate, location
  } = useFolderDetail()

  // Handle retry session from individual summary redirections
  useEffect(() => {
    const retryWords = location.state?.retryWords
    if (retryWords && Array.isArray(retryWords) && retryWords.length > 0) {
      navigate(location.pathname, { replace: true, state: {} })
      handleStartRetrySession(retryWords)
    }
  }, [location.state, id, navigate, handleStartRetrySession])

  if (error && !folder) {
    return (
      <div className="min-h-screen p-8 flex flex-col items-center justify-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => navigate('/')}>Quay lại danh sách folder</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <FolderDetailHeader
          folder={folder}
          onStartLearning={handleStartLearning}
          onOpenUpload={() => setIsUploadDialogOpen(true)}
          onOpenAddWord={() => setIsAddDialogOpen(true)}
          canStart={Boolean(folder?.stats?.totalWords)}
          onBackToFolders={() => navigate('/')}
        />

        <FolderWordFilters
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
          posFilter={posFilter}
          onPosChange={setPosFilter}
        />

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-6 p-1 bg-gray-100/80 w-fit rounded-lg border border-gray-200">
          <button
            onClick={() => setActiveTab('words')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all text-sm font-bold ${activeTab === 'words'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <LayoutGrid className="h-4 w-4" />
            Danh sách từ
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all text-sm font-bold ${activeTab === 'stats'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <BarChart3 className="h-4 w-4" />
            Thống kê & Lịch ôn
          </button>
        </div>

        {activeTab === 'words' ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <WordsTable
              words={words}
              loading={loading}
              searchQuery={searchQuery}
              posFilter={posFilter}
              onEdit={setEditingWord}
              onDelete={handleDeleteWord}
              onEnrich={handleEnrichWord}
              enrichingIds={enrichingIds}
            />

            {!loading && words.length > 0 && (
              <FolderPagination
                page={page}
                totalPages={totalPages}
                total={total}
                limit={limit}
                onPageChange={setPage}
              />
            )}
          </div>
        ) : (
          <FolderStatsView stats={folderStats} loading={statsLoading} />
        )}
      </div>

      <FolderModals
        id={id}
        isAddDialogOpen={isAddDialogOpen}
        setIsAddDialogOpen={setIsAddDialogOpen}
        editingWord={editingWord}
        setEditingWord={setEditingWord}
        isUploadDialogOpen={isUploadDialogOpen}
        setIsUploadDialogOpen={setIsUploadDialogOpen}
        isImportDrawerOpen={isImportDrawerOpen}
        setIsImportDrawerOpen={setIsImportDrawerOpen}
        activeJobId={activeJobId}
        handleAddWord={handleAddWord}
        handleUpdateWord={handleUpdateWord}
        handleImportJobCreated={handleImportJobCreated}
        handleJobFinished={handleJobFinished}
      />
    </div>
  )
}

export default FolderDetail
