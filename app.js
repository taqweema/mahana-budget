const { useState, useEffect } = React;

// Simple SVG Icons
const PlusCircle = () => React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, 
  React.createElement('circle', { cx: 12, cy: 12, r: 10 }),
  React.createElement('path', { d: 'M12 8v8M8 12h8' })
);

const TrendingUp = () => React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, 
  React.createElement('polyline', { points: '22,7 13.5,15.5 8.5,10.5 2,17' }),
  React.createElement('polyline', { points: '16,7 22,7 22,13' })
);

const TrendingDown = () => React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, 
  React.createElement('polyline', { points: '22,17 13.5,8.5 8.5,13.5 2,7' }),
  React.createElement('polyline', { points: '16,17 22,17 22,11' })
);

const Wallet = () => React.createElement('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, 
  React.createElement('path', { d: 'M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z' })
);

const Smartphone = () => React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, 
  React.createElement('rect', { x: 5, y: 2, width: 14, height: 20, rx: 2, ry: 2 }),
  React.createElement('line', { x1: 12, y1: 18, x2: 12.01, y2: 18 })
);

const Home = () => React.createElement('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, 
  React.createElement('path', { d: 'M3 9.5L12 1l9 8.5v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-11z' }),
  React.createElement('polyline', { points: '9,22 9,12 15,12 15,22' })
);

const Receipt = () => React.createElement('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, 
  React.createElement('path', { d: 'M14,2H6A2,2 0 0,0 4,4V20L7,18L10,20L13,18L16,20V4A2,2 0 0,0 14,2M16,16H8V14H16M16,12H8V10H16M12,8H8V6H12V8Z' })
);

const BarChart3 = () => React.createElement('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, 
  React.createElement('path', { d: 'M3 3v18h18M7 16V9M12 16V6M17 16v-2' })
);

const Target = () => React.createElement('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, 
  React.createElement('circle', { cx: 12, cy: 12, r: 10 }),
  React.createElement('circle', { cx: 12, cy: 12, r: 6 }),
  React.createElement('circle', { cx: 12, cy: 12, r: 2 })
);

const X = () => React.createElement('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, 
  React.createElement('path', { d: 'M18 6L6 18M6 6l12 12' })
);

const Settings = () => React.createElement('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, 
  React.createElement('circle', { cx: 12, cy: 12, r: 3 }),
  React.createElement('path', { d: 'M12 1v6m0 10v6m11-7h-6m-10 0H1m15.5-3.5L19 10l-1.5-1.5M5 14l-1.5 1.5L2 14l1.5-1.5L5 14z' })
);

// localStorage Helper Functions
const STORAGE_KEYS = {
  TRANSACTIONS: 'mahana_budget_transactions',
  SETTINGS: 'mahana_budget_settings'
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

const clearStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
    return false;
  }
};

const BudgetApp = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  
  const [transactions, setTransactions] = useState(() => {
  // Load from localStorage or use default data
  const savedTransactions = loadFromStorage(STORAGE_KEYS.TRANSACTIONS);
  return savedTransactions || [
    { id: 1, type: 'expense', amount: 4500, category: 'Food', description: 'Weekly grocery shopping', date: '2025-07-20' },
    { id: 2, type: 'income', amount: 85000, category: 'Salary', description: 'Monthly salary', date: '2025-07-15' },
    { id: 3, type: 'expense', amount: 45000, category: 'Housing', description: 'Monthly rent payment', date: '2025-07-01' },
    { id: 4, type: 'expense', amount: 1200, category: 'Entertainment & Leisure', description: 'Netflix and Spotify', date: '2025-07-18' },
    { id: 5, type: 'expense', amount: 2500, category: 'Transportation', description: 'Fuel for car', date: '2025-07-19' }
  ];
});

  const [newTransaction, setNewTransaction] = useState({
    type: 'expense', amount: '', category: '', description: ''
  });

  const [budgetLimits, setBudgetLimits] = useState(() => {
    const savedLimits = loadFromStorage(STORAGE_KEYS.SETTINGS);
    return savedLimits || {
      'Housing': 45000, 'Food': 25000, 'Transportation': 15000, 
      'Entertainment & Leisure': 8000, 'Personal Care': 5000, 
      'Health & Insurance': 12000, 'Technology & Gadgets': 6000
    };
  });

  const [showSettings, setShowSettings] = useState(false);
  
const categories = {
    expense: Object.keys(budgetLimits).concat(['Gifts & Donations', 'Miscellaneous']),
    income: ['Salary', 'Bonus/Commission', 'Freelance/Side Income', 'Investments/Dividends', 'Other Income']
  };
  
    // Auto-save transactions whenever they change
  useEffect(() => {
    if (transactions.length > 0) {
      saveToStorage(STORAGE_KEYS.TRANSACTIONS, transactions);
    }
  }, [transactions]);

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
    const updatedTransactions = [transaction, ...transactions];
    setTransactions(updatedTransactions);
    saveToStorage(STORAGE_KEYS.TRANSACTIONS, updatedTransactions);
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

  const { totalIncome, totalExpenses, balance } = calculateTotals();

  return React.createElement('div', { style: { minHeight: '100vh', backgroundColor: '#E9F4FF' } },
    // Header
    React.createElement('header', { 
      style: { 
        backgroundColor: 'white', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
        borderBottom: '1px solid #e5e7eb',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      } 
    },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center' } },
        React.createElement('div', { 
          style: { 
            backgroundColor: '#4C51C6', 
            padding: '8px', 
            borderRadius: '8px', 
            marginRight: '12px' 
          } 
        }, React.createElement(Wallet)),
        React.createElement('h1', { 
          style: { 
            fontSize: '18px', 
            fontWeight: 'bold', 
            color: '#3C3F58',
            margin: 0
          } 
        }, 'Mahana Budget')
      ),
      
      // PWA Install Button
      isInstallable && !isInstalled && React.createElement('button', {
        onClick: handleInstallClick,
        style: {
          display: 'flex',
          alignItems: 'center',
          padding: '8px 12px',
          borderRadius: '8px',
          backgroundColor: '#4C51C6',
          color: 'white',
          fontSize: '14px',
          fontWeight: '500',
          border: 'none',
          cursor: 'pointer'
        }
      },
        React.createElement(Smartphone),
        React.createElement('span', { style: { marginLeft: '8px' } }, 'Install')
      )
    ),

    // Main Content Area
    React.createElement('main', { style: { paddingBottom: '80px' } },
      // Stats Cards
      React.createElement('div', { 
        style: { 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '8px', 
          padding: '16px' 
        } 
      },
        React.createElement('div', {
          style: {
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #A6FFC8'
          }
        },
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' } },
            React.createElement(TrendingUp),
            React.createElement('span', { style: { fontSize: '12px', color: '#A6FFC8', fontWeight: '500' } }, 'Income')
          ),
          React.createElement('p', { style: { fontSize: '18px', fontWeight: 'bold', color: '#3C3F58', margin: 0 } }, `₨${(totalIncome/1000).toFixed(0)}k`)
        ),
        React.createElement('div', {
          style: {
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #FD830D'
          }
        },
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' } },
            React.createElement(TrendingDown),
            React.createElement('span', { style: { fontSize: '12px', color: '#FD830D', fontWeight: '500' } }, 'Expenses')
          ),
          React.createElement('p', { style: { fontSize: '18px', fontWeight: 'bold', color: '#3C3F58', margin: 0 } }, `₨${(totalExpenses/1000).toFixed(0)}k`)
        ),
        React.createElement('div', {
          style: {
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: `1px solid ${balance >= 0 ? '#4C51C6' : '#FD830D'}`
          }
        },
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' } },
            React.createElement(Wallet),
            React.createElement('span', { style: { fontSize: '12px', color: balance >= 0 ? '#4C51C6' : '#FD830D', fontWeight: '500' } }, 'Balance')
          ),
          React.createElement('p', { style: { fontSize: '18px', fontWeight: 'bold', color: '#3C3F58', margin: 0 } }, `₨${(Math.abs(balance)/1000).toFixed(0)}k`)
        )
      ),

      // Quick Add Section
      React.createElement('div', { style: { padding: '0 16px' } },
        React.createElement('div', {
          style: {
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginBottom: '16px'
          }
        },
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' } },
            React.createElement('h3', { style: { fontWeight: '600', color: '#3C3F58', margin: 0 } }, 'Quick Add'),
            React.createElement('button', {
              onClick: () => setShowAddModal(true),
              style: {
                backgroundColor: '#4C51C6',
                color: 'white',
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer'
              }
            }, React.createElement(PlusCircle))
          ),
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' } },
            React.createElement('button', {
              onClick: () => { setNewTransaction({...newTransaction, type: 'expense'}); setShowAddModal(true); },
              style: {
                display: 'flex',
                alignItems: 'center',
                padding: '12px',
                backgroundColor: '#FDF2F8',
                borderRadius: '8px',
                border: '1px solid #FD830D',
                cursor: 'pointer'
              }
            },
              React.createElement(TrendingDown),
              React.createElement('span', { style: { fontSize: '14px', fontWeight: '500', color: '#3C3F58', marginLeft: '8px' } }, 'Expense')
            ),
            React.createElement('button', {
              onClick: () => { setNewTransaction({...newTransaction, type: 'income'}); setShowAddModal(true); },
              style: {
                display: 'flex',
                alignItems: 'center',
                padding: '12px',
                backgroundColor: '#F0FDF4',
                borderRadius: '8px',
                border: '1px solid #A6FFC8',
                cursor: 'pointer'
              }
            },
              React.createElement(TrendingUp),
              React.createElement('span', { style: { fontSize: '14px', fontWeight: '500', color: '#3C3F58', marginLeft: '8px' } }, 'Income')
            )
          )
        )
      ),

      // Recent Transactions
      React.createElement('div', { style: { padding: '0 16px' } },
        React.createElement('div', {
          style: {
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }
        },
          React.createElement('div', { 
            style: { 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              padding: '16px', 
              borderBottom: '1px solid #f3f4f6' 
            } 
          },
            React.createElement('h3', { style: { fontWeight: '600', color: '#3C3F58', margin: 0 } }, 'Recent'),
            React.createElement('button', {
              onClick: () => setCurrentView('transactions'),
              style: {
                fontSize: '14px',
                fontWeight: '500',
                color: '#4C51C6',
                border: 'none',
                background: 'none',
                cursor: 'pointer'
              }
            }, 'View All')
          ),
          ...transactions.slice(0, 5).map(transaction => 
            React.createElement('div', { 
              key: transaction.id,
              style: { 
                padding: '16px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                borderBottom: '1px solid #f9fafb'
              } 
            },
              React.createElement('div', { style: { display: 'flex', alignItems: 'center' } },
                React.createElement('div', {
                  style: {
                    padding: '8px',
                    borderRadius: '8px',
                    backgroundColor: transaction.type === 'income' ? '#F0FDF4' : '#FDF2F8',
                    marginRight: '12px'
                  }
                }, transaction.type === 'income' ? React.createElement(TrendingUp) : React.createElement(TrendingDown)),
                React.createElement('div', {},
                  React.createElement('p', { style: { fontWeight: '500', color: '#3C3F58', fontSize: '14px', margin: 0 } }, transaction.description),
                  React.createElement('p', { style: { fontSize: '12px', color: '#6b7280', margin: 0 } }, transaction.category)
                )
              ),
              React.createElement('div', { style: { textAlign: 'right' } },
                React.createElement('p', { 
                  style: { 
                    fontWeight: '600', 
                    fontSize: '14px', 
                    color: transaction.type === 'income' ? '#A6FFC8' : '#FD830D',
                    margin: 0
                  } 
                }, `${transaction.type === 'income' ? '+' : '-'}₨${(transaction.amount/1000).toFixed(1)}k`),
                React.createElement('p', { style: { fontSize: '12px', color: '#6b7280', margin: 0 } }, new Date(transaction.date).toLocaleDateString())
              )
            )
          )
        )
      )
    ),

    // Add Transaction Modal
    showAddModal && React.createElement('div', {
      style: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'end',
        zIndex: 50
      }
    },
      React.createElement('div', {
        style: {
          backgroundColor: 'white',
          width: '100%',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          padding: '24px'
        }
      },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' } },
          React.createElement('h2', { style: { fontSize: '20px', fontWeight: 'bold', color: '#3C3F58', margin: 0 } }, 'Add Transaction'),
          React.createElement('button', {
            onClick: () => setShowAddModal(false),
            style: {
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#f3f4f6',
              cursor: 'pointer'
            }
          }, React.createElement(X))
        ),
        
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
          // Type Selection
          React.createElement('div', {},
            React.createElement('label', { style: { display: 'block', fontSize: '14px', fontWeight: '500', color: '#3C3F58', marginBottom: '8px' } }, 'Type'),
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' } },
              React.createElement('button', {
                onClick: () => setNewTransaction({...newTransaction, type: 'expense'}),
                style: {
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  backgroundColor: newTransaction.type === 'expense' ? '#FDF2F8' : '#F8F9FA',
                  borderColor: newTransaction.type === 'expense' ? '#FD830D' : '#E5E7EB',
                  color: newTransaction.type === 'expense' ? '#FD830D' : '#6B7280'
                }
              }, 'Expense'),
              React.createElement('button', {
                onClick: () => setNewTransaction({...newTransaction, type: 'income'}),
                style: {
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  backgroundColor: newTransaction.type === 'income' ? '#F0FDF4' : '#F8F9FA',
                  borderColor: newTransaction.type === 'income' ? '#A6FFC8' : '#E5E7EB',
                  color: newTransaction.type === 'income' ? '#A6FFC8' : '#6B7280'
                }
              }, 'Income')
            )
          ),

          // Amount Input
          React.createElement('div', {},
            React.createElement('label', { style: { display: 'block', fontSize: '14px', fontWeight: '500', color: '#3C3F58', marginBottom: '8px' } }, 'Amount (₨)'),
            React.createElement('input', {
              type: 'number',
              value: newTransaction.amount,
              onChange: (e) => setNewTransaction({...newTransaction, amount: e.target.value}),
              placeholder: '0',
              style: {
                width: '100%',
                padding: '12px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none'
              }
            })
          ),

          // Category Select
          React.createElement('div', {},
            React.createElement('label', { style: { display: 'block', fontSize: '14px', fontWeight: '500', color: '#3C3F58', marginBottom: '8px' } }, 'Category'),
            React.createElement('select', {
              value: newTransaction.category,
              onChange: (e) => setNewTransaction({...newTransaction, category: e.target.value}),
              style: {
                width: '100%',
                padding: '12px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none'
              }
            },
              React.createElement('option', { value: '' }, 'Select category'),
              ...categories[newTransaction.type].map(cat => 
                React.createElement('option', { key: cat, value: cat }, cat)
              )
            )
          ),

          // Description Input
          React.createElement('div', {},
            React.createElement('label', { style: { display: 'block', fontSize: '14px', fontWeight: '500', color: '#3C3F58', marginBottom: '8px' } }, 'Description'),
            React.createElement('input', {
              type: 'text',
              value: newTransaction.description,
              onChange: (e) => setNewTransaction({...newTransaction, description: e.target.value}),
              placeholder: 'What was this for?',
              style: {
                width: '100%',
                padding: '12px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none'
              }
            })
          ),

          // Add Button
          React.createElement('button', {
            onClick: addTransaction,
            style: {
              width: '100%',
              backgroundColor: '#4C51C6',
              color: 'white',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              marginTop: '8px'
            }
          }, 'Add Transaction')
        )
      )
    ),

    // Bottom Navigation
    React.createElement('nav', {
      style: {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTop: '1px solid #e5e7eb',
        padding: '8px 16px'
      }
    },
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-around' } },
        React.createElement('button', {
          onClick: () => setCurrentView('dashboard'),
          style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '8px 12px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: currentView === 'dashboard' ? '#E9F4FF' : 'transparent',
            color: currentView === 'dashboard' ? '#4C51C6' : '#6B7280',
            cursor: 'pointer'
          }
        },
          React.createElement(Home),
          React.createElement('span', { style: { fontSize: '12px', fontWeight: '500', marginTop: '4px' } }, 'Home')
        ),
        React.createElement('button', {
          onClick: () => setCurrentView('transactions'),
          style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '8px 12px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: currentView === 'transactions' ? '#E9F4FF' : 'transparent',
            color: currentView === 'transactions' ? '#4C51C6' : '#6B7280',
            cursor: 'pointer'
          }
        },
          React.createElement(Receipt),
          React.createElement('span', { style: { fontSize: '12px', fontWeight: '500', marginTop: '4px' } }, 'Transactions')
        ),
        React.createElement('button', {
          onClick: () => setCurrentView('reports'),
          style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '8px 12px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: currentView === 'reports' ? '#E9F4FF' : 'transparent',
            color: currentView === 'reports' ? '#4C51C6' : '#6B7280',
            cursor: 'pointer'
          }
        },
          React.createElement(BarChart3),
          React.createElement('span', { style: { fontSize: '12px', fontWeight: '500', marginTop: '4px' } }, 'Reports')
        ),
        React.createElement('button', {
          onClick: () => setCurrentView('goals'),
          style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '8px 12px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: currentView === 'goals' ? '#E9F4FF' : 'transparent',
            color: currentView === 'goals' ? '#4C51C6' : '#6B7280',
            cursor: 'pointer'
          }
        },
          React.createElement(Target),
          React.createElement('span', { style: { fontSize: '12px', fontWeight: '500', marginTop: '4px' } }, 'Goals')
        )

        ,
        React.createElement('button', {
          onClick: () => setCurrentView('settings'),
          style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '8px 12px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: currentView === 'settings' ? '#E9F4FF' : 'transparent',
            color: currentView === 'settings' ? '#4C51C6' : '#6B7280',
            cursor: 'pointer'
          }
        },
          React.createElement(Settings),
          React.createElement('span', { style: { fontSize: '12px', fontWeight: '500', marginTop: '4px' } }, 'Settings')
        )
      )
    )
  );
};

ReactDOM.render(React.createElement(BudgetApp), document.getElementById('root'));
