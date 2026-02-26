import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';

const TemporaryDashboard = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <h1 className="text-3xl font-bold text-green-600">You are securely logged in! 🎉</h1>
  </div>
);

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <TemporaryDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;