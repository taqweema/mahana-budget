const { useState, useEffect } = React;

// Lucide React icons as simple SVG components
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

const BudgetApp = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

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

  return React.createElement('div', { 
    style: { minHeight: '100vh', backgroundColor: '#E9F4FF' } 
  },
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

    // Main Content
    React.createElement('main', { style: { padding: '20px', textAlign: 'center' } },
      React.createElement('h2', { 
        style: { color: '#3C3F58', marginBottom: '20px' } 
      }, 'Welcome to Mahana Budget!'),
      React.createElement('p', { 
        style: { color: '#6B7280', marginBottom: '20px' } 
      }, 'Your personal budget management app is ready to use.'),
      React.createElement('div', {
        style: {
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          margin: '20px auto',
          maxWidth: '400px'
        }
      },
        React.createElement('h3', { 
          style: { color: '#3C3F58', marginBottom: '16px' } 
        }, 'Quick Stats'),
        React.createElement('div', { 
          style: { 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '12px' 
          } 
        },
          React.createElement('div', {
            style: {
              padding: '12px',
              backgroundColor: '#F0FDF4',
              borderRadius: '8px',
              border: '1px solid #A6FFC8'
            }
          },
            React.createElement(TrendingUp),
            React.createElement('p', { style: { margin: '8px 0 0 0', color: '#3C3F58', fontWeight: 'bold' } }, '₨90k'),
            React.createElement('p', { style: { margin: 0, fontSize: '12px', color: '#A6FFC8' } }, 'Income')
          ),
          React.createElement('div', {
            style: {
              padding: '12px',
              backgroundColor: '#FDF2F8',
              borderRadius: '8px',
              border: '1px solid #FD830D'
            }
          },
            React.createElement(TrendingDown),
            React.createElement('p', { style: { margin: '8px 0 0 0', color: '#3C3F58', fontWeight: 'bold' } }, '₨72k'),
            React.createElement('p', { style: { margin: 0, fontSize: '12px', color: '#FD830D' } }, 'Expenses')
          ),
          React.createElement('div', {
            style: {
              padding: '12px',
              backgroundColor: '#F0F9FF',
              borderRadius: '8px',
              border: '1px solid #4C51C6'
            }
          },
            React.createElement(Wallet),
            React.createElement('p', { style: { margin: '8px 0 0 0', color: '#3C3F58', fontWeight: 'bold' } }, '₨18k'),
            React.createElement('p', { style: { margin: 0, fontSize: '12px', color: '#4C51C6' } }, 'Balance')
          )
        )
      )
    )
  );
};

ReactDOM.render(React.createElement(BudgetApp), document.getElementById('root'));
