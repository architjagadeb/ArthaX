// Initialize Chart.js when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeChart();
  initializeMarketCards();
});

// Initialize Chart (supports both line and bar charts)
function initializeChart() {
  const canvas = document.getElementById('marketChart');
  if (!canvas) return;

  // Get chart data from global variable (set in home.html) or use default
  let chartData = window.chartData;
  
  // Default chart data if not found
  if (!chartData) {
    chartData = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'SENSEX',
          data: [71000, 71500, 71800, 72000, 72200, 72400, 72500],
          color: '#60a5fa'
        },
        {
          label: 'NIFTY',
          data: [21000, 21100, 21200, 21300, 21400, 21500, 21800],
          color: '#34d399'
        }
      ]
    };
  }

  // Determine chart type: bar for spending categories, line for time series
  const isSpendingChart = chartData.labels && 
    (chartData.labels.includes('Food') || chartData.labels.includes('Transport') || 
     chartData.labels.includes('Entertainment') || chartData.labels.includes('Study Materials'));
  const chartType = isSpendingChart ? 'bar' : 'line';

  const ctx = canvas.getContext('2d');
  
  const chartConfig = {
    type: chartType,
    data: {
      labels: chartData.labels,
      datasets: chartData.datasets.map((dataset, index) => {
        const baseConfig = {
          label: dataset.label,
          data: dataset.data,
          borderColor: dataset.color || (index === 0 ? '#60a5fa' : '#34d399'),
          backgroundColor: dataset.color ? 
            (chartType === 'bar' ? dataset.color : `${dataset.color}20`) : 
            (index === 0 ? (chartType === 'bar' ? '#60a5fa' : '#60a5fa20') : (chartType === 'bar' ? '#34d399' : '#34d39920')),
          borderWidth: chartType === 'bar' ? 2 : 3,
        };
        
        if (chartType === 'line') {
          baseConfig.tension = 0.4;
          baseConfig.fill = true;
          baseConfig.pointRadius = 4;
          baseConfig.pointHoverRadius = 6;
          baseConfig.pointBackgroundColor = '#ffffff';
          baseConfig.pointBorderColor = dataset.color || (index === 0 ? '#60a5fa' : '#34d399');
          baseConfig.pointBorderWidth = 2;
        } else {
          baseConfig.borderRadius = 8;
        }
        
        return baseConfig;
      })
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          labels: {
            color: '#ffffff',
            font: {
              family: 'Inter',
              size: 14,
              weight: '600'
            },
            padding: 20,
            usePointStyle: true,
            pointStyle: 'circle',
            display: chartType === 'line'
          },
          position: 'top',
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#ffffff',
          bodyColor: '#e5e7eb',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          borderWidth: 1,
          padding: 12,
          titleFont: {
            family: 'Inter',
            size: 14,
            weight: '600'
          },
          bodyFont: {
            family: 'Inter',
            size: 13
          },
          cornerRadius: 8,
          displayColors: true,
          callbacks: {
            label: function(context) {
              if (isSpendingChart) {
                return context.dataset.label + ': ₹' + context.parsed.y.toLocaleString();
              }
              return context.dataset.label + ': ' + context.parsed.y.toLocaleString();
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#cbd5f5',
            font: {
              family: 'Inter',
              size: 12
            }
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.05)',
            drawBorder: false
          }
        },
        y: {
          ticks: {
            color: '#cbd5f5',
            font: {
              family: 'Inter',
              size: 12
            },
            callback: function(value) {
              if (isSpendingChart) {
                return '₹' + value.toLocaleString();
              }
              return value.toLocaleString();
            }
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.05)',
            drawBorder: false
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      },
      animation: {
        duration: 1000,
        easing: 'easeInOutQuart'
      }
    }
  };
  
  new Chart(ctx, chartConfig);
}

// Initialize Market Cards with hover effects
function initializeMarketCards() {
  const marketCards = document.querySelectorAll('.market-card');
  
  marketCards.forEach(card => {
    card.addEventListener('click', function() {
      const symbol = this.getAttribute('data-symbol');
      const type = this.getAttribute('data-type');
      
      if (symbol && type) {
        // Navigate to markets page (could add filtering in the future)
        window.location.href = '/markets';
      }
    });
  });
}

// Add smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Add loading animation for cards
function animateCards() {
  const cards = document.querySelectorAll('.glass');
  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      card.style.transition = 'all 0.5s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, index * 100);
  });
}

// Run animations when page loads
window.addEventListener('load', animateCards);

// Portfolio Page Functionality
document.addEventListener('DOMContentLoaded', function() {
  initializePortfolio();
});

function initializePortfolio() {
  // Only run on portfolio page
  if (!document.getElementById('expenseModal')) return;

  // Initialize modal
  const addExpenseBtn = document.getElementById('addExpenseBtn');
  const expenseModal = document.getElementById('expenseModal');
  const closeModal = document.getElementById('closeModal');
  const cancelBtn = document.getElementById('cancelBtn');
  const expenseForm = document.getElementById('expenseForm');

  // Open modal
  if (addExpenseBtn) {
    addExpenseBtn.addEventListener('click', () => {
      expenseModal.classList.add('active');
      // Set today's date as default
      const today = new Date().toISOString().split('T')[0];
      document.getElementById('expenseDate').value = today;
    });
  }

  // Close modal
  function closeModalFunc() {
    expenseModal.classList.remove('active');
    expenseForm.reset();
  }

  if (closeModal) closeModal.addEventListener('click', closeModalFunc);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModalFunc);
  
  // Close on overlay click
  expenseModal.addEventListener('click', (e) => {
    if (e.target === expenseModal) {
      closeModalFunc();
    }
  });

  // Handle form submission
  if (expenseForm) {
    expenseForm.addEventListener('submit', handleExpenseSubmit);
  }

  // Animate progress bar on load
  animateProgressBar();
}

function handleExpenseSubmit(e) {
  e.preventDefault();

  const formData = {
    date: document.getElementById('expenseDate').value,
    category: document.getElementById('expenseCategory').value,
    amount: parseFloat(document.getElementById('expenseAmount').value),
    note: document.getElementById('expenseNote').value || null
  };

  // Validation
  if (!formData.date || !formData.category || !formData.amount || formData.amount <= 0) {
    alert('Please fill in all required fields with valid values.');
    return;
  }

  // Add expense to table
  addExpenseToTable(formData);

  // Update totals
  updateTotals(formData.amount);

  // Close modal and reset form
  document.getElementById('expenseModal').classList.remove('active');
  e.target.reset();
}

function addExpenseToTable(expense) {
  const tbody = document.getElementById('expensesTableBody');
  const row = document.createElement('tr');

  const categoryEmoji = {
    'Food': '🍔',
    'Transport': '🚗',
    'Entertainment': '🎬',
    'Study': '📚',
    'Utilities': '💡',
    'Other': '📝'
  };

  const categoryLower = expense.category.toLowerCase();
  const emoji = categoryEmoji[expense.category] || '📝';

  row.innerHTML = `
    <td>${expense.date}</td>
    <td>
      <span class="category-badge category-${categoryLower}">
        ${emoji} ${expense.category}
      </span>
    </td>
    <td class="expense-amount">₹${expense.amount.toLocaleString('en-IN', {maximumFractionDigits: 0})}</td>
    <td class="expense-note">${expense.note || '-'}</td>
  `;

  // Insert at the top
  tbody.insertBefore(row, tbody.firstChild);

  // Add hover effect
  row.style.opacity = '0';
  row.style.transform = 'translateX(-20px)';
  setTimeout(() => {
    row.style.transition = 'all 0.3s ease';
    row.style.opacity = '1';
    row.style.transform = 'translateX(0)';
  }, 10);
}

function updateTotals(amount) {
  if (!window.portfolioData) return;

  // Update total spent
  window.portfolioData.totalSpent += amount;
  const totalSpentElement = document.querySelector('.metric-value');
  if (totalSpentElement && totalSpentElement.textContent.includes('₹')) {
    totalSpentElement.textContent = `₹${window.portfolioData.totalSpent.toLocaleString('en-IN', {maximumFractionDigits: 0})}`;
  }

  // Update progress (assuming savings goal stays the same)
  // In a real app, you'd calculate this based on income - expenses
  // For now, we'll just update the display
  updateProgressBar();
  
  // Note: In a production app, you'd also update the monthlySpending data
  // and refresh the chart. For this demo, the chart shows initial data.
}

function updateProgressBar() {
  if (!window.portfolioData) return;

  const progress = window.portfolioData.savings.progress;
  const progressBar = document.getElementById('savingsProgressBar');
  if (progressBar) {
    // Animate progress bar
    progressBar.style.width = '0%';
    setTimeout(() => {
      progressBar.style.width = `${progress}%`;
      const progressText = progressBar.querySelector('.progress-text');
      if (progressText) {
        progressText.textContent = `${progress}%`;
      }
    }, 100);
  }
}

function animateProgressBar() {
  const progressBar = document.getElementById('savingsProgressBar');
  if (progressBar) {
    const targetWidth = progressBar.style.width || window.getComputedStyle(progressBar).width;
    progressBar.style.width = '0%';
    setTimeout(() => {
      progressBar.style.width = targetWidth;
    }, 300);
  }
}

