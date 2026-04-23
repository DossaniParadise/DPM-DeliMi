import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Display from './components/Display';
import Admin from './components/Admin';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Signage Display */}
        <Route path="/display/:storeId/:screenId" element={<Display />} />
        
        {/* Admin Interface */}
        <Route path="/admin/*" element={<Admin />} />
        
        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/admin" />} />
      </Routes>
    </BrowserRouter>
  );
}
