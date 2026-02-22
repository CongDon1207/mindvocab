import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { AppLayout } from './components/layout';
import Folder from './pages/Folder';
import FolderDetail from './pages/FolderDetail';
import Session from './pages/Session';
import NotebookList from './pages/NotebookList';
import NotebookDetail from './pages/NotebookDetail';
import NotebookReview from './pages/NotebookReview';

function App() {
  return (
    <>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Folder />} />
            <Route path="/folders/:id" element={<FolderDetail />} />
            <Route path="/sessions/:id" element={<Session />} />
            <Route path="/notebook" element={<NotebookList />} />
            <Route path="/notebook/:id" element={<NotebookDetail />} />
            <Route path="/notebook/:id/review" element={<NotebookReview />} />
            {/* Redirect old route to new unified page */}
            <Route path="/notebook-reviews" element={<Navigate to="/notebook" replace />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </>
  )
}

export default App
