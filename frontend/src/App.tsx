import { Toaster } from 'sonner';
import { BrowserRouter, Routes, Route } from "react-router";
import { AppLayout } from './components/layout';
import Folder from './pages/Folder';
import FolderDetail from './pages/FolderDetail';
import Session from './pages/Session';

function App() {
  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'shadow-lg border border-slate-200/50',
        }}
      />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Folder />} />
            <Route path="/folders/:id" element={<FolderDetail />} />
            <Route path="/sessions/:id" element={<Session />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </>
  )
}

export default App
