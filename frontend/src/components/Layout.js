import { LayoutDashboard, Wallet, TrendingUp, Settings, LogOut, PlusCircle } from 'lucide-react';
import Chatbot from './Chatbot';

export default function Layout({ children, activeTab, setActiveTab, username, onLogout }) {
  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'portfolio', label: 'Portfolio', icon: Wallet },
    { id: 'market', label: 'Market Trends', icon: TrendingUp },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'add', label: 'Add Asset', icon: PlusCircle },
  ];

  return (
    <div className="flex h-screen bg-gray-900 text-white font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-6">
          <div className="flex items-center space-x-2 text-blue-500 mb-8" id="sidebar-logo">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">C</div>
            <h1 className="text-xl font-bold text-white tracking-tight">CryptoVault</h1>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  id={`nav-${item.id}`}
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === item.id 
                      ? 'bg-blue-600/10 text-blue-500 border border-blue-600/20 shadow-[0_0_15px_rgba(37,99,235,0.1)]' 
                      : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                  }`}
                >
                  <Icon size={20} className={activeTab === item.id ? 'text-blue-500' : ''} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-gray-700">
          <div className="flex items-center space-x-3 mb-6 p-2 rounded-lg bg-gray-900/50" id="user-profile">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold">
              {username?.substring(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{username}</p>
              <p className="text-xs text-gray-500 truncate">Pro Account</p>
            </div>
          </div>
          
          <button 
            id="logout-btn"
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all duration-200"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-8">
          <h2 className="text-lg font-semibold text-gray-200">
            {menuItems.find(i => i.id === activeTab)?.label}
          </h2>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Settings size={16} className="text-gray-500" />
              </div>
              <input 
                className="bg-gray-700/50 border border-gray-600 rounded-lg py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-64"
                placeholder="Search assets..."
              />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-900 p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <Chatbot />
    </div>
  );
}