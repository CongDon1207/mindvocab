import * as React from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

const schema = z.object({
  name: z.string().trim().min(1, "Tên folder là bắt buộc"),
  description: z.string().trim().optional(),
})

export type CreateFolderValues = z.infer<typeof schema>

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSubmit: (values: CreateFolderValues) => void
}


const CreateFolderDialog: React.FC<Props> = ({ open, onOpenChange, onSubmit }) => {
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<CreateFolderValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "" },
  })

  const submit = (values: CreateFolderValues) => {
    onSubmit(values)
    reset()
    onOpenChange(false)
  }

  const close = () => {
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Tạo folder mới</DialogTitle>
          <DialogDescription>Nhập tên và mô tả ngắn để bắt đầu nhóm từ vựng.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Tên folder *</Label>
            <Input id="name" placeholder="Ví dụ: IELTS Vocabulary" {...register("name")} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea id="description" placeholder="Diễn giải ngắn về nội dung folder" {...register("description")} />
          </div>

          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" onClick={close}>Hủy</Button>
            <Button type="submit" disabled={isSubmitting}>Tạo</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateFolderDialog
