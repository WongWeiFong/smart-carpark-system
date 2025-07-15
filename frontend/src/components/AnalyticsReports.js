import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useParking } from '../contexts/ParkingContext';
import './ParkingComponents.css';
import './AnalyticsReports.css';

const AnalyticsReports = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { getAllTransactions } = useParking();
  const [transactions, setTransactions] = useState([]);
  const [dateFilter, setDateFilter] = useState('monthly');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [topupData, setTopupData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [topupCurrentPage, setTopupCurrentPage] = useState(1);
  const [revenueCurrentPage, setRevenueCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const chartRef = useRef(null);

  useEffect(() => {
    loadAnalyticsData();
    // Reset pagination when filters change
    setTopupCurrentPage(1);
    setRevenueCurrentPage(1);
  }, [dateFilter, customDateRange]);

  const loadAnalyticsData = () => {
    setLoading(true);
    try {
      const allTransactions = getAllTransactions();
      setTransactions(allTransactions);
      processAnalyticsData(allTransactions);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (transactionData) => {
    const filteredTransactions = filterTransactionsByDate(transactionData);
    
    // Process topup data (credits)
    const topups = filteredTransactions.filter(t => t.type === 'topup' || t.amount > 0);
    const processedTopupData = groupDataByPeriod(topups, 'amount');
    setTopupData(processedTopupData);

    // Process revenue data (debits - parking fees)
    const revenues = filteredTransactions.filter(t => t.type === 'deduction' || t.amount < 0);
    const processedRevenueData = groupDataByPeriod(revenues, 'amount', true); // true for absolute values
    setRevenueData(processedRevenueData);
  };

  const filterTransactionsByDate = (transactions) => {
    const now = new Date();
    let startDate = new Date();

    switch (dateFilter) {
      case 'weekly':
        // For weekly, show all data from the beginning (don't filter by date)
        return transactions;
      case 'monthly':
        // For monthly, show all data from the beginning (don't filter by date)
        return transactions;
      case 'yearly':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'custom':
        if (customDateRange.startDate && customDateRange.endDate) {
          startDate = new Date(customDateRange.startDate);
          const endDate = new Date(customDateRange.endDate);
          return transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= startDate && transactionDate <= endDate;
          });
        }
        return transactions;
      default:
        return transactions;
    }

    return transactions.filter(t => new Date(t.date) >= startDate);
  };

  // Helper function to get week number of year
  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  // Helper function to get start date of week
  const getWeekStartDate = (date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(date.setDate(diff));
  };

  const groupDataByPeriod = (transactions, amountField, useAbsolute = false) => {
    const groupedData = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      let periodKey;

      switch (dateFilter) {
        case 'weekly':
          const weekNumber = getWeekNumber(date);
          const year = date.getFullYear();
          // Create a more readable week format: "2024-W01 (Jan 1-7)"
          const weekStart = getWeekStartDate(new Date(date));
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          
          const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' });
          const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short' });
          const startDay = weekStart.getDate();
          const endDay = weekEnd.getDate();
          
          if (startMonth === endMonth) {
            periodKey = `${year}-W${String(weekNumber).padStart(2, '0')} (${startMonth} ${startDay}-${endDay})`;
          } else {
            periodKey = `${year}-W${String(weekNumber).padStart(2, '0')} (${startMonth} ${startDay}-${endMonth} ${endDay})`;
          }
          break;
        case 'monthly':
          const monthYear = date.getFullYear();
          const monthNumber = date.getMonth() + 1;
          const monthName = date.toLocaleDateString('en-US', { month: 'long' });
          periodKey = `${monthYear}-${String(monthNumber).padStart(2, '0')} (${monthName} ${monthYear})`;
          break;
        case 'yearly':
          periodKey = `${date.getFullYear()}`;
          break;
        case 'custom':
          periodKey = date.toISOString().split('T')[0]; // Daily for custom range
          break;
        default:
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!groupedData[periodKey]) {
        groupedData[periodKey] = 0;
      }
      
      const amount = useAbsolute ? Math.abs(transaction[amountField]) : transaction[amountField];
      groupedData[periodKey] += amount;
    });

    // For weekly data, ensure we have all weeks from first to last transaction
    if (dateFilter === 'weekly' && transactions.length > 0) {
      const sortedTransactions = transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
      const firstDate = new Date(sortedTransactions[0].date);
      const lastDate = new Date(sortedTransactions[sortedTransactions.length - 1].date);
      
      // Fill in missing weeks with zero values
      const currentDate = new Date(firstDate);
      currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Start from Monday of first week
      
      while (currentDate <= lastDate) {
        const weekNumber = getWeekNumber(new Date(currentDate));
        const year = currentDate.getFullYear();
        
        const weekStart = new Date(currentDate);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' });
        const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short' });
        const startDay = weekStart.getDate();
        const endDay = weekEnd.getDate();
        
        let weekKey;
        if (startMonth === endMonth) {
          weekKey = `${year}-W${String(weekNumber).padStart(2, '0')} (${startMonth} ${startDay}-${endDay})`;
        } else {
          weekKey = `${year}-W${String(weekNumber).padStart(2, '0')} (${startMonth} ${startDay}-${endMonth} ${endDay})`;
        }
        
        if (!groupedData[weekKey]) {
          groupedData[weekKey] = 0;
        }
        
        currentDate.setDate(currentDate.getDate() + 7); // Move to next week
      }
    }

    return Object.entries(groupedData)
      .map(([period, amount]) => ({ period, amount }))
      .sort((a, b) => {
        // Special sorting for weekly data
        if (dateFilter === 'weekly') {
          const extractWeekInfo = (period) => {
            const match = period.match(/(\d{4})-W(\d{2})/);
            if (match) {
              return { year: parseInt(match[1]), week: parseInt(match[2]) };
            }
            return { year: 0, week: 0 };
          };
          
          const aInfo = extractWeekInfo(a.period);
          const bInfo = extractWeekInfo(b.period);
          
          if (aInfo.year !== bInfo.year) {
            return aInfo.year - bInfo.year;
          }
          return aInfo.week - bInfo.week;
        }
        
        return a.period.localeCompare(b.period);
      });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatPeriodLabel = (period) => {
    if (dateFilter === 'yearly') {
      return period;
    } else if (dateFilter === 'monthly') {
      const [year, month] = period.split('-');
      return new Date(year, month - 1).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    } else if (dateFilter === 'weekly') {
      // Return the already formatted week label (e.g., "2024-W01 (Jan 1-7)")
      return period;
    } else {
      return new Date(period).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const exportToPDF = () => {
    // Create a printable version
    const printWindow = window.open('', '_blank');
    const printContent = generatePrintableReport();
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Analytics Report - ${new Date().toLocaleDateString()}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 30px; }
            .chart-container { border: 1px solid #ddd; padding: 15px; margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .summary { background-color: #f8f9fa; padding: 15px; border-radius: 5px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          ${printContent}
          <div class="no-print" style="margin-top: 20px; text-align: center;">
            <button onclick="window.print()">Print as PDF</button>
            <button onclick="window.close()">Close</button>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  const exportToCSV = () => {
    const csvData = [];
    
    // Add header
    csvData.push(['Analytics Report - ' + new Date().toLocaleDateString()]);
    csvData.push(['']);
    
    // Add topup data
    csvData.push(['Topup Balance Report']);
    csvData.push(['Period', 'Amount']);
    topupData.forEach(item => {
      csvData.push([formatPeriodLabel(item.period), item.amount.toFixed(2)]);
    });
    
    csvData.push(['']);
    
    // Add revenue data
    csvData.push(['Parking Revenue Report']);
    csvData.push(['Period', 'Amount']);
    revenueData.forEach(item => {
      csvData.push([formatPeriodLabel(item.period), item.amount.toFixed(2)]);
    });

    // Convert to CSV string
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `analytics-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatePrintableReport = () => {
    const totalTopup = topupData.reduce((sum, item) => sum + item.amount, 0);
    const totalRevenue = revenueData.reduce((sum, item) => sum + item.amount, 0);

    return `
      <div class="header">
        <h1>Smart Carpark System - Analytics Report</h1>
        <p>Generated on: ${new Date().toLocaleDateString()} | Filter: ${dateFilter.toUpperCase()}</p>
      </div>

      <div class="summary">
        <h3>Summary</h3>
        <p><strong>Total Topup Balance:</strong> ${formatCurrency(totalTopup)}</p>
        <p><strong>Total Parking Revenue:</strong> ${formatCurrency(totalRevenue)}</p>
        <p><strong>Net Balance:</strong> ${formatCurrency(totalTopup - totalRevenue)}</p>
      </div>

      <div class="section">
        <h3>Topup Balance by ${dateFilter}</h3>
        <table>
          <thead>
            <tr><th>Period</th><th>Amount</th></tr>
          </thead>
          <tbody>
            ${topupData.map(item => `
              <tr>
                <td>${formatPeriodLabel(item.period)}</td>
                <td>${formatCurrency(item.amount)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="section">
        <h3>Parking Revenue by ${dateFilter}</h3>
        <table>
          <thead>
            <tr><th>Period</th><th>Amount</th></tr>
          </thead>
          <tbody>
            ${revenueData.map(item => `
              <tr>
                <td>${formatPeriodLabel(item.period)}</td>
                <td>${formatCurrency(item.amount)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  };

  const getTotalTopup = () => topupData.reduce((sum, item) => sum + item.amount, 0);
  const getTotalRevenue = () => revenueData.reduce((sum, item) => sum + item.amount, 0);
  const getMaxValue = () => Math.max(
    ...topupData.map(item => item.amount),
    ...revenueData.map(item => item.amount)
  );

  // Pagination functions
  const getPaginatedData = (data, currentPage) => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (dataLength) => {
    return Math.ceil(dataLength / rowsPerPage);
  };

  const handleTopupPageChange = (newPage) => {
    setTopupCurrentPage(newPage);
  };

  const handleRevenuePageChange = (newPage) => {
    setRevenueCurrentPage(newPage);
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner">Loading analytics data...</div>
      </div>
    );
  }

  return (
    <div className="analytics-reports">
      <header className="analytics-header">
        <div className="header-content">
          <div className="header-left">
            <button onClick={() => navigate('/home')} className="back-button">
              ← Back to Dashboard
            </button>
            <h1 className="page-title">📊 Analytics & Reports</h1>
          </div>
          <div className="user-info">
            <span className="welcome-text">Staff: {user?.staffId || user?.email}</span>
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <div className="analytics-content">
        {/* Filter Controls */}
        <div className="filter-controls">
          <div className="filter-section">
            <h3>📅 Date Filter</h3>
            <div className="filter-buttons">
              {['weekly', 'monthly', 'yearly', 'custom'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setDateFilter(filter)}
                  className={`filter-btn ${dateFilter === filter ? 'active' : ''}`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
            
            {dateFilter === 'custom' && (
              <div className="custom-date-range">
                <input
                  type="date"
                  value={customDateRange.startDate}
                  onChange={(e) => setCustomDateRange({...customDateRange, startDate: e.target.value})}
                  className="date-input"
                />
                <span>to</span>
                <input
                  type="date"
                  value={customDateRange.endDate}
                  onChange={(e) => setCustomDateRange({...customDateRange, endDate: e.target.value})}
                  className="date-input"
                />
              </div>
            )}
          </div>

          <div className="export-section">
            <h3>📄 Export Options</h3>
            <div className="export-buttons">
              <button onClick={exportToPDF} className="export-btn pdf-btn">
                📄 Export PDF
              </button>
              <button onClick={exportToCSV} className="export-btn csv-btn">
                📊 Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card topup-card">
            <div className="card-icon">💰</div>
            <div className="card-content">
              <h3>Total Topup Balance</h3>
              <div className="card-value">{formatCurrency(getTotalTopup())}</div>
              <div className="card-period">{dateFilter} period</div>
            </div>
          </div>
          
          <div className="summary-card revenue-card">
            <div className="card-icon">🚗</div>
            <div className="card-content">
              <h3>Total Parking Revenue</h3>
              <div className="card-value">{formatCurrency(getTotalRevenue())}</div>
              <div className="card-period">{dateFilter} period</div>
            </div>
          </div>
          
          <div className="summary-card net-card">
            <div className="card-icon">📈</div>
            <div className="card-content">
              <h3>Net Balance</h3>
              <div className="card-value">{formatCurrency(getTotalTopup() - getTotalRevenue())}</div>
              <div className="card-period">Total difference</div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-section">
          <div className="chart-container">
            <h3>💰 Topup Balance Trend</h3>
            <div className="chart-wrapper">
              <SimpleBarChart 
                data={topupData} 
                color="#28a745" 
                maxValue={getMaxValue()}
                formatLabel={formatPeriodLabel}
                formatValue={formatCurrency}
              />
            </div>
          </div>

          <div className="chart-container">
            <h3>🚗 Parking Revenue Trend</h3>
            <div className="chart-wrapper">
              <SimpleBarChart 
                data={revenueData} 
                color="#ffc107" 
                maxValue={getMaxValue()}
                formatLabel={formatPeriodLabel}
                formatValue={formatCurrency}
              />
            </div>
          </div>
        </div>

        {/* Data Tables */}
        <div className="data-tables">
          <div className="table-container">
            <h3>📊 Detailed Topup Data</h3>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Amount</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {getPaginatedData(topupData, topupCurrentPage).map((item, index) => (
                    <tr key={index}>
                      <td>{formatPeriodLabel(item.period)}</td>
                      <td className="amount positive">{formatCurrency(item.amount)}</td>
                      <td>{((item.amount / getTotalTopup()) * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Pagination Controls for Topup */}
              {topupData.length > rowsPerPage && (
                <div className="pagination-controls">
                  <div className="pagination-info">
                    Showing {((topupCurrentPage - 1) * rowsPerPage) + 1} to {Math.min(topupCurrentPage * rowsPerPage, topupData.length)} of {topupData.length} entries
                  </div>
                  <div className="pagination-buttons">
                    <button 
                      onClick={() => handleTopupPageChange(topupCurrentPage - 1)}
                      disabled={topupCurrentPage === 1}
                      className="pagination-btn"
                    >
                      ← Previous
                    </button>
                    
                    {Array.from({ length: getTotalPages(topupData.length) }, (_, i) => i + 1).map(pageNum => (
                      <button
                        key={pageNum}
                        onClick={() => handleTopupPageChange(pageNum)}
                        className={`pagination-btn ${topupCurrentPage === pageNum ? 'active' : ''}`}
                      >
                        {pageNum}
                      </button>
                    ))}
                    
                    <button 
                      onClick={() => handleTopupPageChange(topupCurrentPage + 1)}
                      disabled={topupCurrentPage === getTotalPages(topupData.length)}
                      className="pagination-btn"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="table-container">
            <h3>📊 Detailed Revenue Data</h3>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Amount</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {getPaginatedData(revenueData, revenueCurrentPage).map((item, index) => (
                    <tr key={index}>
                      <td>{formatPeriodLabel(item.period)}</td>
                      <td className="amount revenue">{formatCurrency(item.amount)}</td>
                      <td>{((item.amount / getTotalRevenue()) * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Pagination Controls for Revenue */}
              {revenueData.length > rowsPerPage && (
                <div className="pagination-controls">
                  <div className="pagination-info">
                    Showing {((revenueCurrentPage - 1) * rowsPerPage) + 1} to {Math.min(revenueCurrentPage * rowsPerPage, revenueData.length)} of {revenueData.length} entries
                  </div>
                  <div className="pagination-buttons">
                    <button 
                      onClick={() => handleRevenuePageChange(revenueCurrentPage - 1)}
                      disabled={revenueCurrentPage === 1}
                      className="pagination-btn"
                    >
                      ← Previous
                    </button>
                    
                    {Array.from({ length: getTotalPages(revenueData.length) }, (_, i) => i + 1).map(pageNum => (
                      <button
                        key={pageNum}
                        onClick={() => handleRevenuePageChange(pageNum)}
                        className={`pagination-btn ${revenueCurrentPage === pageNum ? 'active' : ''}`}
                      >
                        {pageNum}
                      </button>
                    ))}
                    
                    <button 
                      onClick={() => handleRevenuePageChange(revenueCurrentPage + 1)}
                      disabled={revenueCurrentPage === getTotalPages(revenueData.length)}
                      className="pagination-btn"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple Bar Chart Component (CSS-based)
const SimpleBarChart = ({ data, color, maxValue, formatLabel, formatValue }) => {
  if (!data || data.length === 0) {
    return <div className="no-data">No data available for the selected period</div>;
  }

  return (
    <div className="simple-bar-chart">
      <div className="chart-scroll-container">
        <div className="chart-bars" style={{ minWidth: `${Math.max(data.length * 80, 400)}px` }}>
          {data.map((item, index) => {
            const height = maxValue > 0 ? (item.amount / maxValue) * 100 : 0;
            return (
              <div key={index} className="bar-container">
                <div className="bar-wrapper">
                  <div 
                    className="bar" 
                    style={{ 
                      height: `${height}%`, 
                      backgroundColor: color 
                    }}
                    title={`${formatLabel(item.period)}: ${formatValue(item.amount)}`}
                  />
                </div>
                <div className="bar-label">{formatLabel(item.period)}</div>
                <div className="bar-value">{formatValue(item.amount)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsReports; 