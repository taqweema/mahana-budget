import React, { useState, useEffect } from 'react';
import { PlusCircle, TrendingUp, TrendingDown, Wallet, Target, BarChart3, Receipt, Home, X, Smartphone } from 'lucide-react';

const BudgetApp = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  
  const [transactions, setTransactions] = useState([
    { id: 1, type: 'expense', amount: 4500, category: 'Food', description: 'Weekly grocery shopping', date: '2025-07-20' },
    { id: 2, type: 'income', amount: 85000, category: 'Salary', description: 'Monthly salary', date: '2025-07-15' },
    { id: 3, type: 'expense', amount: 45000, category: 'Housing', description: 'Monthly rent payment', date: '2025-07-01' },
    { id: 4, type: 'expense', amount: 1200, category: 'Entertainment & Leisure', description: 'Netflix and Spotify', date: '2025-07-18' },
    { id: 5, type: 'expense', amount: 2500, category: 'Transportation', description: 'Fuel for car', date: '2025-07-19' },
    { id: 6, type: 'expense', amount: 1500, category: 'Health & Insurance', description: 'Medical checkup', date: '2025-07-17' },
    { id: 7, type: 'expense', amount: 800, category: 'Food', description: 'Lunch with colleagues', date: '2025-07-19' },
    { id: 8, type: 'income', amount: 5000, category: 'Freelance/Side Income', description: 'Website design', date: '2025-07-18' },
    { id: 9, type: 'expense', amount: 3000, category: 'Personal Care', description: 'Haircut and grooming', date: '2025-07-16' },
    { id: 10, type: 'expense', amount: 15000, category: 'Technology & Gadgets', description: 'Phone case', date: '2025-07-14' }
  ]);
  
  const [savingsGoals] = useState([
    { id: 1, name: 'Emergency Fund', target: 500000, current: 120000, deadline: '2025-12-31' },
    { id: 2, name: 'House Down Payment', target: 2000000, current: 450000, deadline: '2026-06-01' },
    { id: 3, name: 'Umrah Trip', target: 300000, current: 85000, deadline: '2025-11-15' }
  ]);

  const [budgetLimits] = useState({
    'Housing': 45000, 'Food': 25000, 'Transportation': 15000, 'Entertainment & Leisure': 8000,
    'Personal Care': 5000, 'Health & Insurance': 12000, 'Technology & Gadgets': 6000
  });

  const [newTransaction, setNewTransaction] = useState({
    type: 'expense', amount: '', category: '', description: ''
  });

  const categories = {
    expense: ['Housing', 'Transportation', 'Food', 'Health & Insurance', 'Personal Care', 'Entertainment & Leisure', 'Technology & Gadgets', 'Gifts & Donations', 'Miscellaneous'],
    income: ['Salary', 'Bonus/Commission', 'Freelance/Side Income', 'Investments/Dividends', 'Other Income']
  };

  // PWA Installation Logic
  useEffect(() => {
    const checkInstalled = () => {
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }
    };

    checkInstalled();

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const addTransaction = () => {
    if (newTransaction.amount && newTransaction.description) {
      const transaction = {
        id: Date.now(),
        ...newTransaction,
        amount: parseFloat(newTransaction.amount),
        date: new Date().toISOString().split('T')[0]
      };
      setTransactions([transaction, ...transactions]);
      setNewTransaction({ type: 'expense', amount: '', category: '', description: '' });
      setShowAddModal(false);
    }
  };

  const calculateTotals = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
    });

    const totalIncome = monthlyTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = monthlyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    return { totalIncome, totalExpenses, balance: totalIncome - totalExpenses };
  };

  const getCategorySpending = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyExpenses = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return t.type === 'expense' && transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
    });

    const categoryTotals = {};
    monthlyExpenses.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    return categoryTotals;
  };

  const { totalIncome, totalExpenses, balance } = calculateTotals();
  const categorySpending = getCategorySpending();

  const renderDashboard = () => (
    <div className="space-y-4 pb-20" style={{ backgroundColor: '#E9F4FF' }}>
      {/* Compact Stats */}
      <div className="grid grid-cols-3 gap-2 px-4 pt-4">
        <div className="bg-white rounded-xl p-3 shadow-sm" style={{ borderColor: '#A6FFC8', borderWidth: '1px' }}>
          <div className="flex items-center justify-between mb-1">
            <TrendingUp className="h-4 w-4" style={{ color: '#A6FFC8' }} />
            <span className="text-xs font-medium" style={{ color: '#A6FFC8' }}>Income</span>
          </div>
          <p className="text-lg font-bold" style={{ color: '#3C3F58' }}>₨{(totalIncome/1000).toFixed(0)}k</p>
        </div>
        
        <div className="bg-white rounded-xl p-3 shadow-sm" style={{ borderColor: '#FD830D', borderWidth: '1px' }}>
          <div className="flex items-center justify-between mb-1">
            <TrendingDown className="h-4 w-4" style={{ color: '#FD830D' }} />
            <span className="text-xs font-medium" style={{ color: '#FD830D' }}>Expenses</span>
          </div>
          <p className="text-lg font-bold" style={{ color: '#3C3F58' }}>₨{(totalExpenses/1000).toFixed(0)}k</p>
        </div>
        
        <div className={`bg-white rounded-xl p-3 shadow-sm`} style={{ borderColor: balance >= 0 ? '#4C51C6' : '#FD830D', borderWidth: '1px' }}>
          <div className="flex items-center justify-between mb-1">
            <Wallet className={`h-4 w-4`} style={{ color: balance >= 0 ? '#4C51C6' : '#FD830D' }} />
            <span className={`text-xs font-medium`} style={{ color: balance >= 0 ? '#4C51C6' : '#FD830D' }}>Balance</span>
          </div>
          <p className={`text-lg font-bold`} style={{ color: '#3C3F58' }}>
            ₨{(Math.abs(balance)/1000).toFixed(0)}k
          </p>
        </div>
      </div>

      {/* Quick Add */}
      <div className="px-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold" style={{ color: '#3C3F58' }}>Quick Add</h3>
            <button onClick={() => setShowAddModal(true)} className="text-white p-2 rounded-lg" style={{ backgroundColor: '#4C51C6' }}>
              <PlusCircle className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => { setNewTransaction({...newTransaction, type: 'expense'}); setShowAddModal(true); }}
              className="flex items-center p-3 rounded-lg border"
              style={{ backgroundColor: '#FDF2F8', borderColor: '#FD830D' }}
            >
              <TrendingDown className="h-4 w-4 mr-2" style={{ color: '#FD830D' }} />
              <span className="text-sm font-medium" style={{ color: '#3C3F58' }}>Expense</span>
            </button>
            <button 
              onClick={() => { setNewTransaction({...newTransaction, type: 'income'}); setShowAddModal(true); }}
              className="flex items-center p-3 rounded-lg border"
              style={{ backgroundColor: '#F0FDF4', borderColor: '#A6FFC8' }}
            >
              <TrendingUp className="h-4 w-4 mr-2" style={{ color: '#A6FFC8' }} />
              <span className="text-sm font-medium" style={{ color: '#3C3F58' }}>Income</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="px-4">
        <div className="bg-white rounded-xl shadow-sm">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="font-semibold" style={{ color: '#3C3F58' }}>Recent</h3>
            <button onClick={() => setCurrentView('transactions')} className="text-sm font-medium" style={{ color: '#4C51C6' }}>
              View All
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {transactions.slice(0, 5).map(transaction => (
              <div key={transaction.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg`} style={{ backgroundColor: transaction.type === 'income' ? '#F0FDF4' : '#FDF2F8' }}>
                    {transaction.type === 'income' ? 
                      <TrendingUp className="h-4 w-4" style={{ color: '#A6FFC8' }} /> : 
                      <TrendingDown className="h-4 w-4" style={{ color: '#FD830D' }} />
                    }
                  </div>
                  <div>
                    <p className="font-medium text-sm" style={{ color: '#3C3F58' }}>{transaction.description}</p>
                    <p className="text-xs text-gray-500">{transaction.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold text-sm`} style={{ color: transaction.type === 'income' ? '#A6FFC8' : '#FD830D' }}>
                    {transaction.type === 'income' ? '+' : '-'}₨{(transaction.amount/1000).toFixed(1)}k
                  </p>
                  <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTransactions = () => (
    <div className="space-y-4 px-4 pb-20 pt-4" style={{ backgroundColor: '#E9F4FF' }}>
      <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-50">
        {transactions.map(transaction => (
          <div key={transaction.id} className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg`} style={{ backgroundColor: transaction.type === 'income' ? '#F0FDF4' : '#FDF2F8' }}>
                {transaction.type === 'income' ? 
                  <TrendingUp className="h-4 w-4" style={{ color: '#A6FFC8' }} /> : 
                  <TrendingDown className="h-4 w-4" style={{ color: '#FD830D' }} />
                }
              </div>
              <div>
                <p className="font-medium text-sm" style={{ color: '#3C3F58' }}>{transaction.description}</p>
                <p className="text-xs text-gray-500">{transaction.category}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-semibold text-sm`} style={{ color: transaction.type === 'income' ? '#A6FFC8' : '#FD830D' }}>
                {transaction.type === 'income' ? '+' : '-'}₨{transaction.amount.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-4 px-4 pb-20 pt-4" style={{ backgroundColor: '#E9F4FF' }}>
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold mb-4" style={{ color: '#3C3F58' }}>Category Spending</h3>
        <div className="space-y-3">
          {Object.entries(categorySpending).sort(([,a], [,b]) => b - a).map(([category, amount]) => {
            const budget = budgetLimits[category] || 0;
            const percentage = budget > 0 ? (amount / budget) * 100 : 0;
            
            return (
              <div key={category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm" style={{ color: '#3C3F58' }}>{category}</span>
                  <span className="text-sm font-semibold" style={{ color: '#3C3F58' }}>₨{amount.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full`}
                    style={{ 
                      width: `${Math.min(percentage, 100)}%`,
                      backgroundColor: percentage > 90 ? '#FD830D' : percentage > 75 ? '#FD830D' : '#A6FFC8'
                    }}
                  />
                </div>
                {budget > 0 && (
                  <p className="text-xs text-gray-500">{Math.round(percentage)}% of ₨{budget.toLocaleString()} budget</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderGoals = () => (
    <div className="space-y-4 px-4 pb-20 pt-4" style={{ backgroundColor: '#E9F4FF' }}>
      {savingsGoals.map(goal => {
        const percentage = (goal.current / goal.target) * 100;
        const remaining = goal.target - goal.current;
        const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
        
        return (
          <div key={goal.id} className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold" style={{ color: '#3C3F58' }}>{goal.name}</h3>
                <p className="text-sm text-gray-500">{daysLeft} days left</p>
              </div>
              <span className="text-xs text-white px-2 py-1 rounded-full" style={{ backgroundColor: '#4C51C6' }}>
                {Math.round(percentage)}%
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium" style={{ color: '#3C3F58' }}>₨{goal.current.toLocaleString()} / ₨{goal.target.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="h-3 rounded-full"
                  style={{ 
                    width: `${Math.min(percentage, 100)}%`,
                    backgroundColor: '#4C51C6'
                  }}
                />
              </div>
              <p className="text-xs text-gray-500">₨{remaining.toLocaleString()} remaining</p>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#E9F4FF' }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: '#4C51C6' }}>
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-lg font-bold" style={{ color: '#3C3F58' }}>Mahana Budget</h1>
          </div>
          
          {/* PWA Install Button */}
          {isInstallable && !isInstalled && (
            <button
              onClick={handleInstallClick}
              className="flex items-center px-3 py-2 rounded-lg text-white text-sm font-medium transition-colors"
              style={{ backgroundColor: '#4C51C6' }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#607FF2'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#4C51C6'}
            >
              <Smartphone className="h-4 w-4 mr-2" />
              Install
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {currentView === 'dashboard' && renderDashboard()}
        {currentView === 'transactions' && renderTransactions()}
        {currentView === 'reports' && renderReports()}
        {currentView === 'goals' && renderGoals()}
      </main>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
          <div className="bg-white w-full rounded-t-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold" style={{ color: '#3C3F58' }}>Add Transaction</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#3C3F58' }}>Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setNewTransaction({...newTransaction, type: 'expense'})}
                    className={`p-3 rounded-lg border text-sm font-medium`}
                    style={{
                      backgroundColor: newTransaction.type === 'expense' ? '#FDF2F8' : '#F8F9FA',
                      borderColor: newTransaction.type === 'expense' ? '#FD830D' : '#E5E7EB',
                      color: newTransaction.type === 'expense' ? '#FD830D' : '#6B7280'
                    }}
                  >
                    Expense
                  </button>
                  <button
                    onClick={() => setNewTransaction({...newTransaction, type: 'income'})}
                    className={`p-3 rounded-lg border text-sm font-medium`}
                    style={{
                      backgroundColor: newTransaction.type === 'income' ? '#F0FDF4' : '#F8F9FA',
                      borderColor: newTransaction.type === 'income' ? '#A6FFC8' : '#E5E7EB',
                      color: newTransaction.type === 'income' ? '#A6FFC8' : '#6B7280'
                    }}
                  >
                    Income
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#3C3F58' }}>Amount (₨)</label>
                <input
                  type="number"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                  placeholder="0"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ 
                    '--tw-ring-color': '#4C51C6',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#4C51C6'}
                  onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#3C3F58' }}>Category</label>
                <select 
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ 
                    '--tw-ring-color': '#4C51C6',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#4C51C6'}
                  onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                >
                  <option value="">Select category</option>
                  {categories[newTransaction.type].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#3C3F58' }}>Description</label>
                <input
                  type="text"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                  placeholder="What was this for?"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ 
                    '--tw-ring-color': '#4C51C6',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#4C51C6'}
                  onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                />
              </div>

              <button
                onClick={addTransaction}
                className="w-full text-white py-3 rounded-lg font-semibold transition-colors"
                style={{ backgroundColor: '#4C51C6' }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#607FF2'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#4C51C6'}
              >
                Add Transaction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          {[
            { id: 'dashboard', label: 'Home', icon: Home },
            { id: 'transactions', label: 'Transactions', icon: Receipt },
            { id: 'reports', label: 'Reports', icon: BarChart3 },
            { id: 'goals', label: 'Goals', icon: Target }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCurrentView(tab.id)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors`}
              style={{
                color: currentView === tab.id ? '#4C51C6' : '#6B7280',
                backgroundColor: currentView === tab.id ? '#E9F4FF' : 'transparent'
              }}
            >
              <tab.icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default BudgetApp;
