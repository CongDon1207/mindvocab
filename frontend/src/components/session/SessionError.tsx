// src/components/session/SessionError.tsx
import React from 'react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface SessionErrorProps {
  error: string
}

const SessionError: React.FC<SessionErrorProps> = ({ error }) => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center justify-center">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/')}>Quay lại trang chủ</Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default SessionError
