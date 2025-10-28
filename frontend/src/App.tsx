import { Toaster } from 'sonner';
import { BrowserRouter, Routes, Route } from "react-router";
import Folder from './pages/Folder';
import FolderDetail from './pages/FolderDetail';
import Session from './pages/Session';

function App() {
  return (
    <>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Folder />} />
          <Route path="/folders/:id" element={<FolderDetail />} />
          <Route path="/sessions/:id" element={<Session />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
