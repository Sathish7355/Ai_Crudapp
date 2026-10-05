import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Database, Layers, CheckCircle, AlertCircle } from 'lucide-react';
import { healthService } from '../services/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [dbHealthy, setDbHealthy] = useState(null);

  useEffect(() => {
    let mounted = true;
    const checkStatus = async () => {
      try {
        const res = await healthService.checkHealth();
        if (mounted) {
          setDbHealthy(res.data.database === 'connected');
        }
      } catch {
        if (mounted) setDbHealthy(false);
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-gray-900 tracking-tight flex items-center gap-1.5">
                AI_Crudapp
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  Full-Stack
                </span>
              </span>
              <p className="text-xs text-gray-500">React • Express • MySQL • JWT</p>
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-4">
            {/* DB status pill */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                dbHealthy === true
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : dbHealthy === false
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-gray-50 text-gray-600 border-gray-200'
              }`}
              title={
                dbHealthy === true
                  ? 'MySQL Database Connected'
                  : 'MySQL Not Connected - Check backend/.env'
              }
            >
              <Database className="w-3.5 h-3.5" />
              <span>
                {dbHealthy === true ? 'MySQL Connected' : dbHealthy === false ? 'DB Action Needed' : 'Checking DB...'}
              </span>
              {dbHealthy === true ? (
                <CheckCircle className="w-3 h-3 text-emerald-600" />
              ) : (
                <AlertCircle className="w-3 h-3 text-amber-600" />
              )}
            </div>

            {/* User Profile */}
            {user && (
              <div className="flex items-center space-x-3 pl-2 border-l border-gray-200">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                  {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-semibold text-gray-800 leading-tight">
                    {user.name}
                  </div>
                  <div className="text-xs text-gray-500 leading-tight">
                    {user.email}
                  </div>
                </div>

                {/* Logout button */}
                <button
                  onClick={logout}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-150"
                  title="Sign out of your account"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
