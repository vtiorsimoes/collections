import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Home, Users, FileText, LogOut } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import ImportData from './pages/ImportData';

function App() {
  // Simple mock auth for MVP
  const userId = 1;

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200">
          <div className="h-16 flex items-center px-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-blue-600">DebtRecovery</h1>
          </div>
          <nav className="p-4 space-y-1">
            <Link to="/" className="flex items-center px-4 py-3 text-gray-700 bg-gray-100 rounded-lg">
              <Home className="w-5 h-5 mr-3" />
              Dashboard
            </Link>
            <Link to="/customers" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
              <Users className="w-5 h-5 mr-3" />
              Clientes
            </Link>
            <Link to="/import" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
              <FileText className="w-5 h-5 mr-3" />
              Importar Faturas
            </Link>
          </nav>
          <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
            <button className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 w-full">
              <LogOut className="w-5 h-5 mr-3" />
              Sair
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <Routes>
              <Route path="/" element={<Dashboard userId={userId} />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/customers/:id" element={<CustomerDetail userId={userId} />} />
              <Route path="/import" element={<ImportData />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
