import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { Support } from './pages/Support';
import { ProfilePage } from './pages/ProfilePage';
import { FoProfilePage } from './pages/FoProfilePage';

function AppRoutes() {
  const location = useLocation();
  // Profile pages — /@username or /username (we handle both in ProfilePage)
  const knownRoutes = ['/', '/privacy', '/privacy-policy', '/terms', '/terms-of-service', '/support'];
  const isProfilePage = !knownRoutes.includes(location.pathname);

  return (
    <>
      {!isProfilePage && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/privacy-policy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/terms-of-service" element={<Terms />} />
        <Route path="/support" element={<Support />} />
        {/* F/O profile pages under user handle — e.g. /@ashwiin11/:id or /@ashwiin11/fo/:id */}
        <Route path="/:handle/fo/:id" element={<FoProfilePage />} />
        <Route path="/:handle/:id" element={<FoProfilePage />} />
        {/* Standalone F/O profile pages */}
        <Route path="/fo/:id" element={<FoProfilePage />} />
        <Route path="/social/fo/:id" element={<FoProfilePage />} />
        {/* Public profile pages — must be before the catch-all */}
        <Route path="/:handle" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!isProfilePage && <Footer />}
    </>
  );
}

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;
