// src/components/word/WordFormDialog.tsx
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { WordFormValues } from '@/types/word'

const schema = z.object({
  word: z.string().trim().min(1, 'Từ vựng là bắt buộc'),
  pos: z.string().trim().min(1, 'Loại từ là bắt buộc'),
  meaning_vi: z.string().trim().min(1, 'Nghĩa tiếng Việt là bắt buộc'),
  ipa: z.string().trim().optional(),
  note: z.string().trim().optional(),
})

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: WordFormValues) => void | Promise<void>
  defaultValues?: WordFormValues
  title?: string
  submitButtonText?: string
}

const WordFormDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  title = 'Thêm từ mới',
  submitButtonText = 'Thêm',
}) => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<WordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || {
      word: '',
      pos: '',
      meaning_vi: '',
      ipa: '',
      note: '',
    },
  })

  const submit = async (values: WordFormValues) => {
    await onSubmit(values)
    reset()
  }

  const close = () => {
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="word">Từ vựng *</Label>
              <Input id="word" placeholder="example" {...register('word')} />
              {errors.word && <p className="text-sm text-red-500">{errors.word.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="pos">Loại từ *</Label>
              <select
                id="pos"
                {...register('pos')}
                className="border rounded px-3 py-2 text-sm"
              >
                <option value="">-- Chọn loại từ --</option>
                <option value="noun">Noun (danh từ)</option>
                <option value="verb">Verb (động từ)</option>
                <option value="adj">Adjective (tính từ)</option>
                <option value="adv">Adverb (trạng từ)</option>
                <option value="prep">Preposition (giới từ)</option>
                <option value="conj">Conjunction (liên từ)</option>
                <option value="pron">Pronoun (đại từ)</option>
                <option value="interj">Interjection (thán từ)</option>
              </select>
              {errors.pos && <p className="text-sm text-red-500">{errors.pos.message}</p>}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="meaning_vi">Nghĩa tiếng Việt *</Label>
            <Input id="meaning_vi" placeholder="ví dụ" {...register('meaning_vi')} />
            {errors.meaning_vi && <p className="text-sm text-red-500">{errors.meaning_vi.message}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ipa">Phiên âm IPA (tùy chọn)</Label>
            <Input id="ipa" placeholder="ɪɡˈzɑːmpəl" {...register('ipa')} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="note">Ghi chú / Mẹo nhớ (tùy chọn)</Label>
            <Textarea
              id="note"
              placeholder="Ghi chú về cách dùng, mẹo nhớ..."
              rows={3}
              {...register('note')}
            />
          </div>

          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" onClick={close}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang xử lý...' : submitButtonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default WordFormDialog
