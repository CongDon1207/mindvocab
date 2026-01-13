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
    <div className="min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto px-4 py-8">
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

        {/* Tab Switcher - Dreamy style */}
        <div className="flex gap-2 mb-6 p-1.5 bg-white/40 backdrop-blur-md w-fit rounded-2xl border border-white/60 shadow-sm">
          <button
            onClick={() => setActiveTab('words')}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl transition-all text-sm font-black tracking-wide ${activeTab === 'words'
                ? 'bg-white text-violet-600 shadow-sm scale-[1.02]'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/20'
              }`}
          >
            <LayoutGrid className="h-4 w-4" />
            TỪ VỰNG
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl transition-all text-sm font-black tracking-wide ${activeTab === 'stats'
                ? 'bg-white text-violet-600 shadow-sm scale-[1.02]'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/20'
              }`}
          >
            <BarChart3 className="h-4 w-4" />
            THỐNG KÊ
          </button>
        </div>

        {activeTab === 'words' ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
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
              <div className="mt-6 flex justify-center">
                <FolderPagination
                  page={page}
                  totalPages={totalPages}
                  total={total}
                  limit={limit}
                  onPageChange={setPage}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <FolderStatsView stats={folderStats} loading={statsLoading} />
          </div>
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
