import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, FileBarChart, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../contexts/ProfileContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { profile } = useProfile();
  const { theme, toggleTheme } = useTheme();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'To-Do', href: '/todo', icon: CheckSquare },
    { name: 'Reports', href: '/reports', icon: FileBarChart },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-white dark:bg-gray-800 shadow-lg transition-colors">
          <div className="flex flex-col h-full">
            <div className="flex-1 flex flex-col pt-5 pb-4">
              <div className="flex items-center flex-shrink-0 px-4">
                <CheckSquare className="h-8 w-8 text-primary" />
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white transition-colors">TaskMaster</span>
              </div>
              <nav className="mt-8 flex-1 space-y-1 px-2">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all ${
                        isActive
                          ? 'bg-primary text-white'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <item.icon
                        className={`mr-3 h-5 w-5 ${
                          isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                        }`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* User profile */}
            <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4 transition-colors">
              <div className="flex items-center w-full">
                <button
                  onClick={() => navigate('/profile')}
                  className="relative h-10 w-10 flex-shrink-0 group"
                >
                  <img
                    src={profile?.avatar_url || `https://api.dicebear.com/7.x/personas/svg?seed=${profile?.username || 'Anonymous'}`}
                    alt={profile?.username || 'User'}
                    className="h-full w-full rounded-full object-cover ring-2 ring-white dark:ring-gray-700 group-hover:ring-primary transition-all"
                  />
                  <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/10 transition-colors" />
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  className="ml-3 flex-1 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md px-2 py-1 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{profile?.username || 'Anonymous'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Edit Profile</p>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleTheme}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                    title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                  >
                    {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 p-8 transition-colors">
          {children}
        </main>
      </div>
    </div>
  );
}