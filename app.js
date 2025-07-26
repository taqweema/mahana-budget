const { useState, useEffect } = React;

// localStorage Helper Functions
const STORAGE_KEYS = {
  TRANSACTIONS: 'mahana_budget_transactions',
  BUDGET_LIMITS: 'mahana_budget_limits',
  BUDGET_CYCLE: 'mahana_budget_cycle',
  SETTINGS: 'mahana_budget_settings',
  CUSTOM_CATEGORIES: 'mahana_budget_custom_categories'
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

// Helper function for ordinal numbers
const getOrdinal = (num) => {
  const suffix = ["th", "st", "nd", "rd"];
  const v = num % 100;
  return num + (suffix[(v - 20) % 10] || suffix[v] || suffix[0]);
};

// Helper function for number formatting with commas
const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US').format(Math.round(num));
};

// Default categories
const DEFAULT_CATEGORIES = {
  income: ['Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Other'],
  expense: ['Food', 'Transport', 'Entertainment', 'Bills', 'Shopping', 'Health', 'Education', 'Other']
};

// Currency options
const CURRENCY_OPTIONS = [
  { code: 'PKR', symbol: 'Rs.', name: 'Pakistani Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' }
];

const BudgetApp = () => {
  // State management
  const [currentView, setCurrentView] = useState('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCalendarPicker, setShowCalendarPicker] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showTransactionDetail, setShowTransactionDetail] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  
  // Data states
  const [transactions, setTransactions] = useState([]);
  const [budgetLimits, setBudgetLimits] = useState({});
  const [budgetCycle, setBudgetCycle] = useState(1); // Default to 1st of month
  const [customCategories, setCustomCategories] = useState(DEFAULT_CATEGORIES);
  const [settings, setSettings] = useState({
    currency: 'PKR',
    currencySymbol: 'Rs.'
  });
  
  // Form states
  const [newTransaction, setNewTransaction] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [newCategory, setNewCategory] = useState({
    type: 'expense',
    name: ''
  });

  // Load data on component mount
  useEffect(() => {
    const savedTransactions = loadFromStorage(STORAGE_KEYS.TRANSACTIONS, []);
    const savedLimits = loadFromStorage(STORAGE_KEYS.BUDGET_LIMITS, {});
    const savedCycle = loadFromStorage(STORAGE_KEYS.BUDGET_CYCLE, 1);
    const savedCategories = loadFromStorage(STORAGE_KEYS.CUSTOM_CATEGORIES, DEFAULT_CATEGORIES);
    const savedSettings = loadFromStorage(STORAGE_KEYS.SETTINGS, {
      currency: 'PKR',
      currencySymbol: 'Rs.'
    });
    
    setTransactions(savedTransactions);
    setBudgetLimits(savedLimits);
    setBudgetCycle(savedCycle);
    setCustomCategories(savedCategories);
    setSettings(savedSettings);
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
      startDate = new Date(currentYear, currentMonth, budgetCycle);
      endDate = new Date(currentYear, currentMonth + 1, budgetCycle - 1);
    } else {
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

  // Add new category
  const addCategory = () => {
    if (!newCategory.name.trim()) return;
    
    const updatedCategories = {
      ...customCategories,
      [newCategory.type]: [...customCategories[newCategory.type], newCategory.name.trim()]
    };
    
    setCustomCategories(updatedCategories);
    saveToStorage(STORAGE_KEYS.CUSTOM_CATEGORIES, updatedCategories);
    
    setNewCategory({
      type: 'expense',
      name: ''
    });
    setShowCategoryModal(false);
  };

  // Reset transactions
  const resetTransactions = () => {
    setTransactions([]);
    saveToStorage(STORAGE_KEYS.TRANSACTIONS, []);
    setShowResetModal(false);
  };

  // Update budget cycle
  const updateBudgetCycle = (day) => {
    setBudgetCycle(day);
    saveToStorage(STORAGE_KEYS.BUDGET_CYCLE, day);
    setShowCalendarPicker(false);
  };

  // Update currency
  const updateCurrency = (currencyCode) => {
    const currency = CURRENCY_OPTIONS.find(c => c.code === currencyCode);
    const newSettings = {
      ...settings,
      currency: currency.code,
      currencySymbol: currency.symbol
    };
    setSettings(newSettings);
    saveToStorage(STORAGE_KEYS.SETTINGS, newSettings);
  };

  // Handle transaction click
  const handleTransactionClick = (transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionDetail(true);
  };

  // Enhanced Pie Chart Component with Labels
  const PieChart = ({ data, total }) => {
    if (!data || Object.keys(data).length === 0) return null;
    
    const colors = ['#DC2626', '#EA580C', '#D97706', '#65A30D', '#0891B2', '#7C3AED', '#BE185D', '#374151'];
    let currentAngle = 0;
    
    const slices = Object.entries(data)
      .sort(([,a], [,b]) => b - a)
      .map(([category, amount], index) => {
        const percentage = (amount / total) * 100;
        const angle = (amount / total) * 360;
        const color = colors[index % colors.length];
        
        const slice = {
          category,
          amount,
          percentage,
          color,
          startAngle: currentAngle,
          endAngle: currentAngle + angle
        };
        
        currentAngle += angle;
        return slice;
      });
    
    return (
      <div className="space-y-4">
        <div className="flex justify-center">
          <div className="relative w-48 h-48">
            <svg width="192" height="192" className="transform -rotate-90">
              {slices.map((slice, index) => {
                const radius = 85;
                const centerX = 96;
                const centerY = 96;
                
                const startAngleRad = (slice.startAngle * Math.PI) / 180;
                const endAngleRad = (slice.endAngle * Math.PI) / 180;
                
                const x1 = centerX + radius * Math.cos(startAngleRad);
                const y1 = centerY + radius * Math.sin(startAngleRad);
                const x2 = centerX + radius * Math.cos(endAngleRad);
                const y2 = centerY + radius * Math.sin(endAngleRad);
                
                const largeArcFlag = slice.endAngle - slice.startAngle > 180 ? 1 : 0;
                
                const pathData = [
                  `M ${centerX} ${centerY}`,
                  `L ${x1} ${y1}`,
                  `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  'Z'
                ].join(' ');
                
                // Calculate label position
                const labelAngle = (slice.startAngle + slice.endAngle) / 2;
                const labelRadius = radius * 0.7;
                const labelX = centerX + labelRadius * Math.cos((labelAngle * Math.PI) / 180);
                const labelY = centerY + labelRadius * Math.sin((labelAngle * Math.PI) / 180);
                
                return (
                  <g key={index}>
                    <path
                      d={pathData}
                      fill={slice.color}
                      className="hover:opacity-80 transition-opacity"
                      stroke="white"
                      strokeWidth="2"
                    />
                    {slice.percentage > 5 && (
                      <text
                        x={labelX}
                        y={labelY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-white text-xs font-bold transform rotate-90"
                        style={{ fontSize: '11px' }}
                      >
                        {slice.percentage.toFixed(0)}%
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
        
        <div className="space-y-2">
          {slices.map((slice, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: slice.color }}
                />
                <span className="font-medium">{slice.category}</span>
              </div>
              <div className="text-right">
                <div className="font-semibold">{settings.currencySymbol} {formatNumber(slice.amount)}</div>
                <div className="text-xs text-gray-500">{slice.percentage.toFixed(1)}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Transaction Detail Modal
  const TransactionDetailModal = () => {
    if (!selectedTransaction) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Transaction Details</h3>
            <button 
              onClick={() => setShowTransactionDetail(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {/* Transaction Type Badge */}
            <div className="flex justify-center">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                selectedTransaction.type === 'income' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {selectedTransaction.type === 'income' ? '📈 Income' : '📉 Expense'}
              </span>
            </div>

            {/* Amount */}
            <div className="text-center">
              <p className="text-sm text-gray-600">Amount</p>
              <p className={`text-3xl font-bold ${
                selectedTransaction.type === 'income' ? 'text-green-600' : 'text-red-600'
              }`}>
                {settings.currencySymbol} {formatNumber(selectedTransaction.amount)}
              </p>
            </div>

            {/* Details */}
            <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
              <div className="flex justify-between">
                <span className="text-gray-600">Category</span>
                <span className="font-medium">{selectedTransaction.category}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Date</span>
                <span className="font-medium">{new Date(selectedTransaction.date).toLocaleDateString()}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Description</span>
                <span className="font-medium text-right flex-1 ml-4">
                  {selectedTransaction.description || 'No description'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Added on</span>
                <span className="font-medium">
                  {new Date(selectedTransaction.timestamp).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowTransactionDetail(false)}
            className="w-full mt-6 py-3 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  // Calendar Picker Component (Mobile Optimized)
  const CalendarPicker = () => {
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-4 w-full max-w-sm shadow-2xl max-h-screen overflow-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Budget Cycle Start</h3>
            <button 
              onClick={() => setShowCalendarPicker(false)}
              className="text-gray-500 hover:text-gray-700 p-2"
            >
              ✕
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Choose which day of the month your budget period starts
          </p>
          
          <div className="grid grid-cols-7 gap-1 mb-4">
            {days.map(day => (
              <button
                key={day}
                onClick={() => updateBudgetCycle(day)}
                className={`h-12 w-full rounded-lg text-sm font-medium transition-all duration-200 ${
                  budgetCycle === day 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-600'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
          
          <div className="p-3 bg-blue-50 rounded-lg text-center">
            <p className="text-sm text-blue-700">
              Current: {getOrdinal(budgetCycle)} of each month
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Add Category Modal
  const AddCategoryModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Add Category</h3>
          <button 
            onClick={() => setShowCategoryModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Category Type */}
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setNewCategory({...newCategory, type: 'expense'})}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                newCategory.type === 'expense' 
                  ? 'bg-white text-red-600 shadow-sm' 
                  : 'text-gray-600'
              }`}
            >
              Expense
            </button>
            <button
              onClick={() => setNewCategory({...newCategory, type: 'income'})}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                newCategory.type === 'income' 
                  ? 'bg-white text-green-600 shadow-sm' 
                  : 'text-gray-600'
              }`}
            >
              Income
            </button>
          </div>

          {/* Category Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
            <input
              type="text"
              value={newCategory.name}
              onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter category name"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setShowCategoryModal(false)}
            className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={addCategory}
            className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Add Category
          </button>
        </div>
      </div>
    </div>
  );
// Reset Confirmation Modal
  const ResetModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Reset All Transactions?</h3>
          <p className="text-gray-600 mb-6">
            This will permanently delete all your transactions. Your settings and categories will be kept.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowResetModal(false)}
            className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={resetTransactions}
            className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
          >
            Reset All
          </button>
        </div>
      </div>
    </div>
  );

  // Add Transaction Modal
  const AddTransactionModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-screen overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Add Transaction</h3>
          <button 
            onClick={() => setShowAddModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
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
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">{settings.currencySymbol}</span>
              <input
                type="number"
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                className="w-full p-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <button
                onClick={() => setShowCategoryModal(true)}
                className="text-blue-600 text-sm hover:text-blue-700"
              >
                + Add New
              </button>
            </div>
            <select
              value={newTransaction.category}
              onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select category</option>
              {customCategories[newTransaction.type].map(cat => (
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
                <span className="text-2xl">📱</span>
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
                  ✕
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
            📅 Change Cycle
          </button>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Income</p>
                <p className="text-2xl font-bold text-green-600">{settings.currencySymbol} {formatNumber(totals.income)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <span className="text-green-600 text-2xl">📈</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Expenses</p>
                <p className="text-2xl font-bold text-red-600">{settings.currencySymbol} {formatNumber(totals.expenses)}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <span className="text-red-600 text-2xl">📉</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Balance</p>
                <p className={`text-2xl font-bold ${totals.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {settings.currencySymbol} {formatNumber(totals.balance)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <span className="text-blue-600 text-2xl">💰</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Add Transaction */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Quick Actions</h3>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors"
          >
            ➕ Add Transaction
          </button>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
          {totals.currentPeriodTransactions.length > 0 ? (
            <div className="space-y-3">
              {totals.currentPeriodTransactions.slice(-5).reverse().map(transaction => (
                <div 
                  key={transaction.id} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleTransactionClick(transaction)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{transaction.category}</p>
                    <p className="text-sm text-gray-600 truncate">{transaction.description || 'No description'}</p>
                  </div>
                  <div className="text-right ml-3">
                    <p className={`font-medium text-sm ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {settings.currencySymbol} {formatNumber(transaction.amount)}
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

  // Transactions View (No Emojis, Date on Right)
  const TransactionsView = () => {
    return (
      <div className="p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Transactions</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
          >
            ➕ Add
          </button>
        </div>

        {transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.slice().reverse().map(transaction => (
              <div 
                key={transaction.id} 
                className="bg-white p-4 rounded-xl shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleTransactionClick(transaction)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="font-medium text-lg truncate">{transaction.category}</p>
                    <p className="text-sm text-gray-600 truncate">{transaction.description || 'No description'}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold text-base ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {settings.currencySymbol} {formatNumber(transaction.amount)}
                    </p>
                    <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <span className="text-6xl">💰</span>
            <p className="text-gray-500 mb-4 mt-4">No transactions yet</p>
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

        {/* Category Pie Chart */}
        {Object.keys(totals.categoryTotals).length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
            <PieChart data={totals.categoryTotals} total={totals.expenses} />
          </div>
        )}

        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Category Details</h3>
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
                        <span className="text-gray-600">{settings.currencySymbol} {formatNumber(amount)} ({percentage.toFixed(1)}%)</span>
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
        <span className="text-6xl">🎯</span>
        <p className="text-gray-500 mb-2 mt-4">Goals feature coming soon!</p>
        <p className="text-sm text-gray-400">Set and track your financial goals</p>
      </div>
    </div>
  );

  // Settings View (Mobile Optimized)
  const SettingsView = () => (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>
      
      <div className="bg-white rounded-2xl shadow-lg divide-y">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Budget Cycle</h3>
              <p className="text-sm text-gray-600">Starts on the {getOrdinal(budgetCycle)} of each month</p>
            </div>
            <button
              onClick={() => setShowCalendarPicker(true)}
              className="text-blue-600 hover:text-blue-700 p-2"
            >
              📅
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-medium mb-3">Currency</h3>
          <select
            value={settings.currency}
            onChange={(e) => updateCurrency(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {CURRENCY_OPTIONS.map(currency => (
              <option key={currency.code} value={currency.code}>
                {currency.symbol} {currency.name} ({currency.code})
              </option>
            ))}
          </select>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Manage Categories</h3>
              <p className="text-sm text-gray-600">Add custom income and expense categories</p>
            </div>
            <button
              onClick={() => setShowCategoryModal(true)}
              className="text-blue-600 hover:text-blue-700 p-2"
            >
              ➕
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Reset Transactions</h3>
              <p className="text-sm text-gray-600">Delete all transaction data</p>
            </div>
            <button
              onClick={() => setShowResetModal(true)}
              className="text-red-600 hover:text-red-700 p-2"
            >
              🗑️
            </button>
          </div>
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
      { id: 'dashboard', icon: '🏠', label: 'Home' },
      { id: 'transactions', icon: '➕', label: 'Transactions' },
      { id: 'reports', icon: '📊', label: 'Reports' },
      { id: 'goals', icon: '🎯', label: 'Goals' },
      { id: 'settings', icon: '⚙️', label: 'Settings' }
    ];

    return (
      <nav className="bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          {navItems.map(item => {
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex flex-col items-center p-2 min-w-0 ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
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
      {showCategoryModal && <AddCategoryModal />}
      {showResetModal && <ResetModal />}
      {showTransactionDetail && <TransactionDetailModal />}
    </div>
  );
};

// Render the app
ReactDOM.render(<BudgetApp />, document.getElementById('root'));
