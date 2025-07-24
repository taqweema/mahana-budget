import React, { useState, useEffect } from 'react';
import { 
  Home, Plus, BarChart3, Target, Settings, Calendar, 
  TrendingUp, TrendingDown, Wallet, PieChart, 
  ChevronLeft, ChevronRight, Check, X, Download
} from 'lucide-react';

// localStorage Helper Functions
const STORAGE_KEYS = {
  TRANSACTIONS: 'mahana_budget_transactions',
  BUDGET_LIMITS: 'mahana_budget_limits',
  BUDGET_CYCLE: 'mahana_budget_cycle'
};

const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    return false;
  }
};

const loadFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return defaultValue;
  }
};

// Default categories
const DEFAULT_CATEGORIES = {
  income: ['Salary', 'Freelance', 'Investment', 'Other'],
  expense: ['Food', 'Transport', 'Entertainment', 'Bills', 'Shopping', 'Health', 'Other']
};

const BudgetApp = () => {
  // State management
  const [currentView, setCurrentView] = useState('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCalendarPicker, setShowCalendarPicker] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  
  // Data states
  const [transactions, setTransactions] = useState([]);
  const [budgetLimits, setBudgetLimits] = useState({});
  const [budgetCycle, setBudgetCycle] = useState(1); // Default to 1st of month
  
  // Form states
  const [newTransaction, setNewTransaction] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Load data on component mount
  useEffect(() => {
    const savedTransactions = loadFromStorage(STORAGE_KEYS.TRANSACTIONS, []);
    const savedLimits = loadFromStorage(STORAGE_KEYS.BUDGET_LIMITS, {});
    const savedCycle = loadFromStorage(STORAGE_KEYS.BUDGET_CYCLE, 1);
    
    setTransactions(savedTransactions);
    setBudgetLimits(savedLimits);
    setBudgetCycle(savedCycle);
  }, []);

  // PWA Installation Logic
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  // Calculate current budget period
  const getCurrentPeriod = () => {
    const now = new Date();
    const currentDay = now.getDate();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    let startDate, endDate;
    
    if (currentDay >= budgetCycle) {
      // Current period: this month's cycle day to next month's cycle day - 1
      startDate = new Date(currentYear, currentMonth, budgetCycle);
      endDate = new Date(currentYear, currentMonth + 1, budgetCycle - 1);
    } else {
      // Current period: last month's cycle day to this month's cycle day - 1
      startDate = new Date(currentYear, currentMonth - 1, budgetCycle);
      endDate = new Date(currentYear, currentMonth, budgetCycle - 1);
    }
    
    return { startDate, endDate };
  };

  // Calculate totals for current period
  const calculateTotals = () => {
    const { startDate, endDate } = getCurrentPeriod();
    
    const currentPeriodTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
    
    const income = currentPeriodTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const expenses = currentPeriodTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const categoryTotals = {};
    currentPeriodTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + parseFloat(t.amount);
      });
    
    return {
      income,
      expenses,
      balance: income - expenses,
      categoryTotals,
      currentPeriodTransactions
    };
  };

  // Add new transaction
  const addTransaction = () => {
    if (!newTransaction.amount || !newTransaction.category) return;
    
    const transaction = {
      id: Date.now().toString(),
      ...newTransaction,
      amount: parseFloat(newTransaction.amount),
      timestamp: new Date().toISOString()
    };
    
    const updatedTransactions = [...transactions, transaction];
    setTransactions(updatedTransactions);
    saveToStorage(STORAGE_KEYS.TRANSACTIONS, updatedTransactions);
    
    setNewTransaction({
      type: 'expense',
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowAddModal(false);
  };

  // Update budget cycle
  const updateBudgetCycle = (day) => {
    setBudgetCycle(day);
    saveToStorage(STORAGE_KEYS.BUDGET_CYCLE, day);
    setShowCalendarPicker(false);
  };

  // Calendar Picker Component
  const CalendarPicker = () => {
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Budget Cycle Start</h3>
            <button 
              onClick={() => setShowCalendarPicker(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Choose which day of the month your budget period starts
          </p>
          
          <div className="grid grid-cols-7 gap-2">
            {days.map(day => (
              <button
                key={day}
                onClick={() => updateBudgetCycle(day)}
                className={`
                  h-10 w-10 rounded-full text-sm font-medium transition-all duration-200
                  ${budgetCycle === day 
                    ? 'bg-blue-600 text-white shadow-lg scale-110' 
                    : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-600'
                  }
                `}
              >
                {day}
              </button>
            ))}
          </div>
          
          <div className="mt-6 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">
              Current: {budgetCycle}th of each month
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Add Transaction Modal
  const AddTransactionModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Add Transaction</h3>
          <button 
            onClick={() => setShowAddModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Transaction Type */}
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setNewTransaction({...newTransaction, type: 'expense', category: ''})}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                newTransaction.type === 'expense' 
                  ? 'bg-white text-red-600 shadow-sm' 
                  : 'text-gray-600'
              }`}
            >
              Expense
            </button>
            <button
              onClick={() => setNewTransaction({...newTransaction, type: 'income', category: ''})}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                newTransaction.type === 'income' 
                  ? 'bg-white text-green-600 shadow-sm' 
                  : 'text-gray-600'
              }`}
            >
              Income
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
            <input
              type="number"
              value={newTransaction.amount}
              onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={newTransaction.category}
              onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select category</option>
              {DEFAULT_CATEGORIES[newTransaction.type].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <input
              type="text"
              value={newTransaction.description}
              onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Optional description"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={newTransaction.date}
              onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setShowAddModal(false)}
            className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={addTransaction}
            className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Add Transaction
          </button>
        </div>
      </div>
    </div>
  );

  // Dashboard View
  const DashboardView = () => {
    const totals = calculateTotals();
    const { startDate, endDate } = getCurrentPeriod();

    return (
      <div className="p-4 space-y-6">
        {/* Install Prompt */}
        {showInstallPrompt && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Download size={24} />
                <div>
                  <h3 className="font-semibold">Install Mahana Budget</h3>
                  <p className="text-sm opacity-90">Add to home screen for quick access</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowInstallPrompt(false)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg"
                >
                  <X size={20} />
                </button>
                <button 
                  onClick={handleInstallClick}
                  className="px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                >
                  Install
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Period Info */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold mb-2">Current Budget Period</h2>
          <p className="opacity-90">
            {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
          </p>
          <button
            onClick={() => setShowCalendarPicker(true)}
            className="mt-3 flex items-center gap-2 text-sm bg-white bg-opacity-20 px-3 py-2 rounded-lg hover:bg-opacity-30 transition-colors"
          >
            <Calendar size={16} />
            Change Cycle
          </button>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Income</p>
                <p className="text-2xl font-bold text-green-600">${totals.income.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <TrendingUp className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Expenses</p>
                <p className="text-2xl font-bold text-red-600">${totals.expenses.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <TrendingDown className="text-red-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Balance</p>
                <p className={`text-2xl font-bold ${totals.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  ${totals.balance.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Wallet className="text-blue-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
          {totals.currentPeriodTransactions.length > 0 ? (
            <div className="space-y-3">
              {totals.currentPeriodTransactions.slice(-5).reverse().map(transaction => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {transaction.type === 'income' ? 
                        <TrendingUp className={`${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`} size={16} /> :
                        <TrendingDown className={`${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`} size={16} />
                      }
                    </div>
                    <div>
                      <p className="font-medium">{transaction.category}</p>
                      <p className="text-sm text-gray-600">{transaction.description || 'No description'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No transactions yet</p>
          )}
        </div>
      </div>
    );
  };

  // Transactions View
  const TransactionsView = () => {
    const totals = calculateTotals();

    return (
      <div className="p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Transactions</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Add
          </button>
        </div>

        {transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.slice().reverse().map(transaction => (
              <div key={transaction.id} className="bg-white p-4 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {transaction.type === 'income' ? 
                        <TrendingUp className="text-green-600" size={16} /> :
                        <TrendingDown className="text-red-600" size={16} />
                      }
                    </div>
                    <div>
                      <p className="font-medium">{transaction.category}</p>
                      <p className="text-sm text-gray-600">{transaction.description || 'No description'}</p>
                      <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className={`font-bold text-lg ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Wallet className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 mb-4">No transactions yet</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Add Your First Transaction
            </button>
          </div>
        )}
      </div>
    );
  };

  // Reports View
  const ReportsView = () => {
    const totals = calculateTotals();

    return (
      <div className="p-4 space-y-6">
        <h2 className="text-2xl font-bold">Reports</h2>

        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
          {Object.keys(totals.categoryTotals).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(totals.categoryTotals)
                .sort(([,a], [,b]) => b - a)
                .map(([category, amount]) => {
                  const percentage = totals.expenses > 0 ? (amount / totals.expenses) * 100 : 0;
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{category}</span>
                        <span className="text-gray-600">${amount.toFixed(2)} ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No expense data available</p>
          )}
        </div>

        {/* Summary Stats */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Period Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <p className="text-2xl font-bold text-green-600">{totals.currentPeriodTransactions.filter(t => t.type === 'income').length}</p>
              <p className="text-sm text-gray-600">Income Transactions</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-xl">
              <p className="text-2xl font-bold text-red-600">{totals.currentPeriodTransactions.filter(t => t.type === 'expense').length}</p>
              <p className="text-sm text-gray-600">Expense Transactions</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Goals View (Placeholder)
  const GoalsView = () => (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold">Goals</h2>
      <div className="text-center py-16">
        <Target className="mx-auto text-gray-400 mb-4" size={48} />
        <p className="text-gray-500 mb-2">Goals feature coming soon!</p>
        <p className="text-sm text-gray-400">Set and track your financial goals</p>
      </div>
    </div>
  );

  // Settings View
  const SettingsView = () => (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>
      
      <div className="bg-white rounded-2xl shadow-lg divide-y">
        <div className="p-4 flex items-center justify-between">
          <div>
            <h3 className="font-medium">Budget Cycle</h3>
            <p className="text-sm text-gray-600">Starts on the {budgetCycle}th of each month</p>
          </div>
          <button
            onClick={() => setShowCalendarPicker(true)}
            className="text-blue-600 hover:text-blue-700"
          >
            <Calendar size={20} />
          </button>
        </div>
        
        <div className="p-4">
          <h3 className="font-medium mb-2">App Version</h3>
          <p className="text-sm text-gray-600">Mahana Budget v2.0</p>
        </div>
      </div>
    </div>
  );

  // Navigation
  const Navigation = () => {
    const navItems = [
      { id: 'dashboard', icon: Home, label: 'Home' },
      { id: 'transactions', icon: Plus, label: 'Transactions' },
      { id: 'reports', icon: BarChart3, label: 'Reports' },
      { id: 'goals', icon: Target, label: 'Goals' },
      { id: 'settings', icon: Settings, label: 'Settings' }
    ];

    return (
      <nav className="bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex flex-col items-center p-2 min-w-0 ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-blue-600' : 'text-gray-500'} />
                <span className="text-xs mt-1 truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    );
  };

  // Render current view
  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView />;
      case 'transactions': return <TransactionsView />;
      case 'reports': return <ReportsView />;
      case 'goals': return <GoalsView />;
      case 'settings': return <SettingsView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm p-4">
        <h1 className="text-2xl font-bold text-gray-800">Mahana Budget</h1>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        {renderCurrentView()}
      </main>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0">
        <Navigation />
      </div>

      {/* Modals */}
      {showAddModal && <AddTransactionModal />}
      {showCalendarPicker && <CalendarPicker />}
    </div>
  );
};

export default BudgetApp;
