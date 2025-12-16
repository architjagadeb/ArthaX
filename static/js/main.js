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
  initializeSavings();
  initializeSavingsGoalEdit();
  initializeWithdrawals();
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

function initializeSavings() {
  // Initialize savings modal (works on both home and portfolio pages)
  const addSavingsBtn = document.getElementById('addSavingsBtn');
  const savingsModal = document.getElementById('savingsModal');
  const closeSavingsModal = document.getElementById('closeSavingsModal');
  const cancelSavingsBtn = document.getElementById('cancelSavingsBtn');
  const savingsForm = document.getElementById('savingsForm');

  if (!savingsModal) return;

  // Open modal
  if (addSavingsBtn) {
    addSavingsBtn.addEventListener('click', () => {
      savingsModal.classList.add('active');
      // Set today's date as default
      const today = new Date().toISOString().split('T')[0];
      document.getElementById('savingsDate').value = today;
    });
  }

  // Close modal
  function closeSavingsModalFunc() {
    savingsModal.classList.remove('active');
    if (savingsForm) savingsForm.reset();
  }

  if (closeSavingsModal) closeSavingsModal.addEventListener('click', closeSavingsModalFunc);
  if (cancelSavingsBtn) cancelSavingsBtn.addEventListener('click', closeSavingsModalFunc);
  
  // Close on overlay click
  savingsModal.addEventListener('click', (e) => {
    if (e.target === savingsModal) {
      closeSavingsModalFunc();
    }
  });

  // Handle form submission
  if (savingsForm) {
    savingsForm.addEventListener('submit', handleSavingsSubmit);
  }
}

function initializeWithdrawals() {
  const withdrawBtn = document.getElementById('withdrawSavingsBtn');
  const withdrawModal = document.getElementById('withdrawModal');
  const closeWithdrawModal = document.getElementById('closeWithdrawModal');
  const cancelWithdrawBtn = document.getElementById('cancelWithdrawBtn');
  const withdrawForm = document.getElementById('withdrawForm');

  if (!withdrawModal) return;

  const openModal = () => {
    withdrawModal.classList.add('active');
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('withdrawDate');
    if (dateInput) dateInput.value = today;
  };

  if (withdrawBtn) withdrawBtn.addEventListener('click', openModal);

  const closeModal = () => {
    withdrawModal.classList.remove('active');
    if (withdrawForm) withdrawForm.reset();
  };

  if (closeWithdrawModal) closeWithdrawModal.addEventListener('click', closeModal);
  if (cancelWithdrawBtn) cancelWithdrawBtn.addEventListener('click', closeModal);

  withdrawModal.addEventListener('click', (e) => {
    if (e.target === withdrawModal) {
      closeModal();
    }
  });

  if (withdrawForm) {
    withdrawForm.addEventListener('submit', handleWithdrawSubmit);
  }
}

function initializeSavingsGoalEdit() {
  const editButton = document.getElementById('editSavingsGoalBtn');
  const editModal = document.getElementById('editGoalModal');
  const closeEditModal = document.getElementById('closeEditGoalModal');
  const cancelEditGoalBtn = document.getElementById('cancelEditGoalBtn');
  const editGoalForm = document.getElementById('editGoalForm');
  const newSavingsGoalInput = document.getElementById('newSavingsGoal');

  if (!editModal || !editGoalForm) return;

  const openEditModal = () => {
    editModal.classList.add('active');
    if (newSavingsGoalInput && window.portfolioData && window.portfolioData.savings) {
      newSavingsGoalInput.value = window.portfolioData.savings.goal;
    }
  };

  if (editButton) editButton.addEventListener('click', openEditModal);

  const closeModal = () => {
    editModal.classList.remove('active');
    editGoalForm.reset();
  };

  if (closeEditModal) closeEditModal.addEventListener('click', closeModal);
  if (cancelEditGoalBtn) cancelEditGoalBtn.addEventListener('click', closeModal);

  editModal.addEventListener('click', (e) => {
    if (e.target === editModal) {
      closeModal();
    }
  });

  editGoalForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(editGoalForm);

    fetch('/api/savings-goal/update', {
      method: 'POST',
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          editModal.classList.remove('active');
          editGoalForm.reset();
          setTimeout(() => window.location.reload(), 300);
        } else {
          alert('Error: ' + (data.error || 'Failed to update savings goal'));
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
      });
  });
}

function handleExpenseSubmit(e) {
  e.preventDefault();

  const expenseDate = document.getElementById('expenseDate').value;
  const expenseCategory = document.getElementById('expenseCategory').value;
  const expenseAmount = document.getElementById('expenseAmount').value;
  const expenseNote = document.getElementById('expenseNote').value;

  const parsedAmount = expenseAmount ? parseFloat(expenseAmount) : 0;

  // Validation
  if (!expenseDate || !expenseCategory || !parsedAmount || parsedAmount <= 0) {
    alert('Please fill in all required fields with valid values.');
    return;
  }

  const formData = new FormData();
  formData.append('date', expenseDate);
  formData.append('category', expenseCategory);
  formData.append('amount', expenseAmount);
  formData.append('note', expenseNote || '');

  // Submit to backend
  fetch('/api/expenses', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Add expense to table
      addExpenseToTable(data.expense);

      // Update totals
      updateTotals(data.expense.amount);

      // Close modal and reset form
      document.getElementById('expenseModal').classList.remove('active');
      e.target.reset();

      // Reload page to get updated totals from backend
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } else {
      alert('Error: ' + (data.error || 'Failed to add expense'));
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('An error occurred. Please try again.');
  });
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
  if (window.portfolioData.savings) {
    updateProgressBar(window.portfolioData.savings.progress);
  }
}

function handleSavingsSubmit(e) {
  e.preventDefault();

  const formData = {
    date: document.getElementById('savingsDate').value,
    amount: parseFloat(document.getElementById('savingsAmount').value),
    note: document.getElementById('savingsNote').value || null
  };

  // Validation
  if (!formData.date || !formData.amount || formData.amount <= 0) {
    alert('Please fill in all required fields with valid values.');
    return;
  }

  // Submit to backend
  fetch('/api/savings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData)
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Add savings to table if table exists
      const savingsTableBody = document.getElementById('savingsTableBody');
      if (savingsTableBody) {
        addSavingsToTable(data.saving);
      }

      updateSavingsUI({
        total_savings: data.total_savings,
        savings_progress: data.savings_progress,
        savings_goal: window.portfolioData?.savings?.goal
      });

      // Close modal and reset form
      document.getElementById('savingsModal').classList.remove('active');
      e.target.reset();
    } else {
      alert('Error: ' + (data.error || 'Failed to add savings'));
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('An error occurred. Please try again.');
  });
}

function handleWithdrawSubmit(e) {
  e.preventDefault();

  const withdrawDate = document.getElementById('withdrawDate').value;
  const withdrawAmount = document.getElementById('withdrawAmount').value;
  const withdrawNote = document.getElementById('withdrawNote').value;

  const parsedAmount = withdrawAmount ? parseFloat(withdrawAmount) : 0;

  if (!withdrawDate || !parsedAmount || parsedAmount <= 0) {
    alert('Please fill in all required fields with valid values.');
    return;
  }

  const formData = new FormData();
  formData.append('date', withdrawDate);
  formData.append('amount', withdrawAmount);
  formData.append('note', withdrawNote || '');

  fetch('/api/savings/withdraw', {
    method: 'POST',
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        addSavingsToTable(data.saving);
        updateSavingsUI({
          total_savings: data.total_savings,
          savings_progress: data.savings_progress,
          savings_goal: window.portfolioData?.savings?.goal
        });

        document.getElementById('withdrawModal').classList.remove('active');
        e.target.reset();
      } else {
        alert('Error: ' + (data.error || 'Failed to withdraw savings'));
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    });
}

function addSavingsToTable(saving) {
  const tbody = document.getElementById('savingsTableBody');
  if (!tbody) return;

  const row = document.createElement('tr');
  const isNegative = saving.amount < 0;
  const displayAmount = Math.abs(saving.amount).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  const amountSign = isNegative ? '-' : '+';
  const amountColor = isNegative ? '#f87171' : '#4ade80';

  row.innerHTML = `
    <td>${saving.date}</td>
    <td class="expense-amount" style="color: ${amountColor};">${amountSign}₹${displayAmount}</td>
    <td class="expense-note">${saving.note || '-'}</td>
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

function updateProgressBar(progress) {
  if (progress === undefined || progress === null) return;

  const progressBar = document.getElementById('savingsProgressBar');
  if (progressBar) {
    progressBar.style.width = '0%';
    setTimeout(() => {
      progressBar.style.width = `${progress}%`;
      const progressText = progressBar.querySelector('.progress-text');
      if (progressText) {
        progressText.textContent = `${Math.round(progress)}%`;
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

function updateSavingsUI({ total_savings, savings_progress, savings_goal }) {
  if (window.portfolioData && window.portfolioData.savings) {
    if (total_savings !== undefined) window.portfolioData.savings.current = total_savings;
    if (savings_progress !== undefined) window.portfolioData.savings.progress = savings_progress;
    if (savings_goal) window.portfolioData.savings.goal = savings_goal;
  }

  const totalSavingsValue = document.getElementById('totalSavingsValue');
  if (totalSavingsValue && total_savings !== undefined) {
    totalSavingsValue.textContent = `₹${Number(total_savings).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  }

  const progressTotal = document.getElementById('progressTotalSavings');
  if (progressTotal && total_savings !== undefined) {
    progressTotal.textContent = `₹${Number(total_savings).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  }

  const progressGoal = document.getElementById('progressGoalValue');
  if (progressGoal && savings_goal !== undefined && savings_goal !== null) {
    progressGoal.textContent = `₹${Number(savings_goal).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  }

  updateProgressBar(savings_progress);
}

