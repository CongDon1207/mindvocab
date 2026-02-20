import { BrowserRouter, Routes, Route } from "react-router";
import { AppLayout } from './components/layout';
import Folder from './pages/Folder';
import FolderDetail from './pages/FolderDetail';
import Session from './pages/Session';
import NotebookList from './pages/NotebookList';
import NotebookDetail from './pages/NotebookDetail';
import NotebookReview from './pages/NotebookReview';
import NotebookReviewsList from './pages/NotebookReviewsList';

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
            <Route path="/notebook-reviews" element={<NotebookReviewsList />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </>
  )
}

export default App
