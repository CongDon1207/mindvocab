import React from 'react'
import { WordFormDialog } from '@/components/word'
import { UploadWordsDialog, ImportStatusDrawer } from '@/components/import'
import { Word } from '@/types/word'
import { ImportJob } from '@/types/import'

interface FolderModalsProps {
    id: string | undefined
    isAddDialogOpen: boolean
    setIsAddDialogOpen: (open: boolean) => void
    editingWord: Word | null
    setEditingWord: (word: Word | null) => void
    isUploadDialogOpen: boolean
    setIsUploadDialogOpen: (open: boolean) => void
    isImportDrawerOpen: boolean
    setIsImportDrawerOpen: (open: boolean) => void
    activeJobId: string | null
    handleAddWord: (values: any) => Promise<void>
    handleUpdateWord: (wordId: string, values: any) => Promise<void>
    handleImportJobCreated: (jobId: string) => void
    handleJobFinished: (job: ImportJob) => void
}

const FolderModals: React.FC<FolderModalsProps> = ({
    id,
    isAddDialogOpen,
    setIsAddDialogOpen,
    editingWord,
    setEditingWord,
    isUploadDialogOpen,
    setIsUploadDialogOpen,
    isImportDrawerOpen,
    setIsImportDrawerOpen,
    activeJobId,
    handleAddWord,
    handleUpdateWord,
    handleImportJobCreated,
    handleJobFinished,
}) => {
    return (
        <>
            <WordFormDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                onSubmit={handleAddWord}
                title="Thêm từ mới"
                submitButtonText="Thêm"
            />

            {editingWord && (
                <WordFormDialog
                    open={!!editingWord}
                    onOpenChange={(open) => !open && setEditingWord(null)}
                    onSubmit={(values) => handleUpdateWord(editingWord._id, values)}
                    defaultValues={{
                        word: editingWord.word,
                        pos: editingWord.pos,
                        meaning_vi: editingWord.meaning_vi,
                        ipa: editingWord.ipa || '',
                        note: editingWord.note || '',
                        ex1_en: editingWord.ex1?.en || '',
                        ex1_vi: editingWord.ex1?.vi || '',
                        ex2_en: editingWord.ex2?.en || '',
                        ex2_vi: editingWord.ex2?.vi || '',
                    }}
                    title="Chỉnh sửa từ"
                    submitButtonText="Lưu"
                />
            )}

            <UploadWordsDialog
                open={isUploadDialogOpen}
                onOpenChange={setIsUploadDialogOpen}
                folderId={id!}
                onJobCreated={handleImportJobCreated}
            />

            <ImportStatusDrawer
                open={isImportDrawerOpen}
                onOpenChange={setIsImportDrawerOpen}
                jobId={activeJobId}
                onJobFinished={handleJobFinished}
            />
        </>
    )
}

export default FolderModals
