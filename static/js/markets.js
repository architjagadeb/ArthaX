// Markets Page - Interactive Chart Functionality
(function() {
  'use strict';

  // Store chart instances
  const chartInstances = {};
  let currentOpenRow = null;

  // Initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    initializeMarketCharts();
  });

  /**
   * Initialize all market chart interactions
   */
  function initializeMarketCharts() {
    const clickableRows = document.querySelectorAll('.market-row-clickable');
    
    clickableRows.forEach(row => {
      row.addEventListener('click', handleRowClick);
    });

    // Initialize time range button handlers
    document.addEventListener('click', handleTimeRangeClick);
  }

  /**
   * Handle row click - toggle chart dropdown
   */
  function handleRowClick(e) {
    const row = e.currentTarget;
    const symbol = row.getAttribute('data-symbol');
    const chartRow = document.querySelector(`.chart-dropdown-row[data-symbol="${symbol}"]`);

    if (!chartRow) return;

    // Close previously open chart
    if (currentOpenRow && currentOpenRow !== chartRow) {
      closeChart(currentOpenRow);
    }

    // Toggle current chart
    if (chartRow.style.display === 'none' || chartRow.style.display === '') {
      openChart(row, chartRow, symbol);
    } else {
      closeChart(chartRow);
    }
  }

  /**
   * Open chart dropdown
   */
  function openChart(dataRow, chartRow, symbol) {
    // Mark row as active
    dataRow.classList.add('active');
    
    // Show chart row
    chartRow.style.display = 'table-row';
    currentOpenRow = chartRow;

    // Initialize chart if not already initialized
    const canvas = chartRow.querySelector('.price-chart');
    if (canvas && !chartInstances[symbol]) {
      initializeChart(canvas, symbol, '5D');
    } else if (canvas && chartInstances[symbol]) {
      // Update chart with current range
      const activeBtn = chartRow.querySelector('.time-range-btn.active');
      const range = activeBtn ? activeBtn.getAttribute('data-range') : '5D';
      updateChart(symbol, range);
    }
  }

  /**
   * Close chart dropdown
   */
  function closeChart(chartRow) {
    const symbol = chartRow.getAttribute('data-symbol');
    const dataRow = document.querySelector(`.market-row-clickable[data-symbol="${symbol}"]`);
    
    if (dataRow) {
      dataRow.classList.remove('active');
    }
    
    chartRow.style.display = 'none';
    
    if (currentOpenRow === chartRow) {
      currentOpenRow = null;
    }
  }

  /**
   * Handle time range button clicks
   */
  function handleTimeRangeClick(e) {
    if (!e.target.classList.contains('time-range-btn')) return;

    const btn = e.target;
    const range = btn.getAttribute('data-range');
    const chartRow = btn.closest('.chart-dropdown-row');
    
    if (!chartRow) return;

    const symbol = chartRow.getAttribute('data-symbol');
    
    // Update active button
    const buttons = chartRow.querySelectorAll('.time-range-btn');
    buttons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Update chart
    updateChart(symbol, range);
  }

  /**
   * Generate dummy historical price data
   */
  function generatePriceData(symbol, range, currentPrice) {
    const data = {
      labels: [],
      prices: []
    };

    let points = 0;
    let daysBack = 0;

    switch(range) {
      case '1D':
        points = 24; // Hourly data
        daysBack = 1;
        break;
      case '5D':
        points = 5;
        daysBack = 5;
        break;
      case '1M':
        points = 30;
        daysBack = 30;
        break;
      case '1Y':
        points = 12;
        daysBack = 365;
        break;
      case '5Y':
        points = 60;
        daysBack = 1825;
        break;
      case 'MAX':
        points = 100;
        daysBack = 1825;
        break;
    }

    // Generate base price with some variation
    const basePrice = currentPrice || 100;
    const variation = basePrice * 0.15; // 15% variation

    for (let i = points; i >= 0; i--) {
      // Generate date label
      const date = new Date();
      date.setDate(date.getDate() - (daysBack * i / points));
      
      if (range === '1D') {
        data.labels.push(date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
      } else if (range === '5D') {
        data.labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      } else if (range === '1M') {
        data.labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      } else {
        data.labels.push(date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
      }

      // Generate price with trend
      const progress = (points - i) / points;
      const trend = Math.sin(progress * Math.PI * 2) * 0.1; // Sine wave trend
      const random = (Math.random() - 0.5) * 0.05; // Random variation
      const price = basePrice * (1 + trend + random);
      
      data.prices.push(Math.max(price, basePrice * 0.7)); // Ensure price doesn't go too low
    }

    return data;
  }

  /**
   * Initialize Chart.js chart
   */
  function initializeChart(canvas, symbol, range) {
    const row = canvas.closest('.chart-dropdown-row');
    const dataRow = document.querySelector(`.market-row-clickable[data-symbol="${symbol}"]`);
    
    if (!dataRow) return;

    const currentPrice = parseFloat(dataRow.getAttribute('data-price')) || 100;
    const change = parseFloat(dataRow.getAttribute('data-change')) || 0;
    const isPositive = change >= 0;

    const chartData = generatePriceData(symbol, range, currentPrice);
    const lineColor = isPositive ? '#4ade80' : '#f87171';

    // Destroy existing chart if any
    if (chartInstances[symbol]) {
      chartInstances[symbol].destroy();
    }

    chartInstances[symbol] = new Chart(canvas, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: 'Price',
          data: chartData.prices,
          borderColor: lineColor,
          backgroundColor: lineColor + '20',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: lineColor,
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            titleColor: '#ffffff',
            bodyColor: '#e5e7eb',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            borderWidth: 1,
            padding: 12,
            titleFont: {
              family: 'Inter',
              size: 13,
              weight: '600'
            },
            bodyFont: {
              family: 'Inter',
              size: 12
            },
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              title: function(context) {
                return context[0].label;
              },
              label: function(context) {
                const value = context.parsed.y;
                return '$' + value.toFixed(2);
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false,
              drawBorder: false
            },
            ticks: {
              color: '#94a3b8',
              font: {
                family: 'Inter',
                size: 11
              },
              maxRotation: 45,
              minRotation: 0
            }
          },
          y: {
            position: 'right',
            grid: {
              color: 'rgba(255, 255, 255, 0.05)',
              drawBorder: false
            },
            ticks: {
              color: '#94a3b8',
              font: {
                family: 'Inter',
                size: 11
              },
              callback: function(value) {
                return '$' + value.toFixed(2);
              }
            }
          }
        },
        animation: {
          duration: 750,
          easing: 'easeInOutQuart'
        }
      }
    });
  }

  /**
   * Update chart with new time range
   */
  function updateChart(symbol, range) {
    const chartRow = document.querySelector(`.chart-dropdown-row[data-symbol="${symbol}"]`);
    if (!chartRow) return;

    const canvas = chartRow.querySelector('.price-chart');
    if (!canvas) return;

    const dataRow = document.querySelector(`.market-row-clickable[data-symbol="${symbol}"]`);
    if (!dataRow) return;

    const currentPrice = parseFloat(dataRow.getAttribute('data-price')) || 100;
    const change = parseFloat(dataRow.getAttribute('data-change')) || 0;
    const isPositive = change >= 0;

    const chartData = generatePriceData(symbol, range, currentPrice);
    const lineColor = isPositive ? '#4ade80' : '#f87171';

    if (chartInstances[symbol]) {
      // Update existing chart
      chartInstances[symbol].data.labels = chartData.labels;
      chartInstances[symbol].data.datasets[0].data = chartData.prices;
      chartInstances[symbol].data.datasets[0].borderColor = lineColor;
      chartInstances[symbol].data.datasets[0].backgroundColor = lineColor + '20';
      chartInstances[symbol].data.datasets[0].pointHoverBackgroundColor = lineColor;
      chartInstances[symbol].update('active');
    } else {
      // Initialize new chart
      initializeChart(canvas, symbol, range);
    }
  }

})();

