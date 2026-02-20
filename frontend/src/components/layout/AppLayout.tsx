// src/components/layout/AppLayout.tsx
import React from 'react'
import { BookOpen, Sparkles, Cloud } from 'lucide-react'
import { useNavigate } from 'react-router'

interface AppLayoutProps {
  children: React.ReactNode
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/60 via-purple-50/50 to-pink-50/60 font-sans selection:bg-pink-100 selection:text-pink-900">
      {/* Aurora Background - Dreamy & Soft */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-pink-200/20 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-200/10 rounded-full blur-[120px]" />
      </div>

      {/* Header - Glassmorphism */}
      <header className="sticky top-0 z-50 px-4 pt-4">
        <div className="max-w-7xl mx-auto">
          <div className="backdrop-blur-xl bg-white/60 border border-white/60 rounded-2xl shadow-sm shadow-purple-500/5">
            <div className="px-4 sm:px-6">
              <div className="flex items-center justify-between h-16">
                {/* Logo - Playful */}
                <button
                  onClick={() => navigate('/')}
                  className="group flex items-center gap-3 hover:opacity-80 transition-all cursor-pointer"
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-200 group-hover:scale-105 transition-transform duration-300">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-2 -right-2 animate-bounce duration-[2000ms]" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <h1 className="text-xl font-black bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">
                      MindVocab
                    </h1>
                    <p className="text-xs text-slate-500 font-medium pl-0.5">Học là mê!</p>
                  </div>
                </button>

                {/* Navigation Links */}
                <nav className="hidden md:flex items-center gap-6 ml-8 flex-1">
                  <button onClick={() => navigate('/')} className="text-sm font-bold text-slate-600 hover:text-pink-500 transition-colors">
                    Từ vựng
                  </button>
                  <button onClick={() => navigate('/notebook')} className="text-sm font-bold text-slate-600 hover:text-pink-500 transition-colors">
                    Sổ tay
                  </button>
                  <button onClick={() => navigate('/notebook-reviews')} className="text-sm font-bold text-slate-600 hover:text-pink-500 transition-colors">
                    Ôn tập Sổ tay
                  </button>
                </nav>

                {/* Right side actions */}
                <div className="flex items-center gap-4">
                  <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/50 border border-white shadow-sm">
                    <Cloud className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-bold text-slate-600">ONLINE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-auto border-t border-white/50 bg-white/30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm font-medium text-slate-500">
              © 2025 MindVocab
            </p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-pink-400" />
              <span className="w-2 h-2 rounded-full bg-violet-400" />
              <span className="w-2 h-2 rounded-full bg-sky-400" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default AppLayout
