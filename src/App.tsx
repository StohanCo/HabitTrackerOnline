import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HabitsPage } from './pages/HabitsPage';
import { FinancePage } from './pages/FinancePage';
import { ProfilePage } from './pages/ProfilePage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950 text-white">
        <Navbar />
        <main className="pt-14">
          <Routes>
            <Route path="/" element={<HabitsPage />} />
            <Route path="/finance" element={<FinancePage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
