import { useState } from 'react';
import { Toaster } from 'sonner';
import { BrowserRouter, Routes, Route } from "react-router";
import Folder from './pages/Folder';

function App() {

  return (
    <>
      <Toaster></Toaster>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<Folder />}
          />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
