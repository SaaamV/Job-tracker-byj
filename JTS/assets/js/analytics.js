// analytics.js - Fixed chart sizing and performance issues

let statusChart = null;
let timeChart = null;
let portalChart = null;
let successChart = null;

function updateAnalytics() {
  const totalApps = applications.length;
  const interviewStatuses = ['Phone Screen', 'Interview Scheduled', 'Final Interview', 'Technical Assessment'];
  const interviewApps = applications.filter(app => interviewStatuses.includes(app.status)).length;
  const responseStatuses = ['Under Review', 'Phone Screen', 'Interview Scheduled', 'Final Interview', 'Offer', 'Rejected', 'Technical Assessment'];
  const responseApps = applications.filter(app => responseStatuses.includes(app.status)).length;
  const offerApps = applications.filter(app => app.status === 'Offer').length;

  // Calculate metrics safely
  const avgResponseTime = calculateAverageResponseTime();
  const pendingFollowUps = calculatePendingFollowUps();

  // Update stats with null checks
  const totalAppsEl = document.getElementById('totalApps');
  const interviewRateEl = document.getElementById('interviewRate');
  const responseRateEl = document.getElementById('responseRate');
  const offerRateEl = document.getElementById('offerRate');
  const avgResponseTimeEl = document.getElementById('avgResponseTime');
  const pendingFollowUpsEl = document.getElementById('pendingFollowUps');

  if (totalAppsEl) totalAppsEl.textContent = totalApps;
  if (interviewRateEl) interviewRateEl.textContent = totalApps > 0 ? Math.round((interviewApps / totalApps) * 100) + '%' : '0%';
  if (responseRateEl) responseRateEl.textContent = totalApps > 0 ? Math.round((responseApps / totalApps) * 100) + '%' : '0%';
  if (offerRateEl) offerRateEl.textContent = totalApps > 0 ? Math.round((offerApps / totalApps) * 100) + '%' : '0%';
  if (avgResponseTimeEl) avgResponseTimeEl.textContent = avgResponseTime;
  if (pendingFollowUpsEl) pendingFollowUpsEl.textContent = pendingFollowUps;

  // Update charts with delay to ensure DOM is ready
  setTimeout(() => {
    updateCharts();
  }, 100);
}

function calculateAverageResponseTime() {
  const responsedApps = applications.filter(app => 
    app.status !== 'Applied' && app.status !== 'Withdrawn' && app.status !== 'On Hold'
  );
  
  if (responsedApps.length === 0) return '0';
  
  const totalDays = responsedApps.reduce((sum, app) => {
    const daysDiff = Math.floor(
      (new Date() - new Date(app.applicationDate)) / (1000 * 60 * 60 * 24)
    );
    return sum + daysDiff;
  }, 0);
  
  return Math.round(totalDays / responsedApps.length);
}

function calculatePendingFollowUps() {
  const today = new Date().toISOString().split('T')[0];
  
  const appFollowUps = applications.filter(app => 
    app.followUpDate && app.followUpDate <= today && 
    !['Offer', 'Rejected', 'Withdrawn'].includes(app.status)
  ).length;
  
  const contactFollowUps = contacts.filter(contact => 
    contact.nextFollowUpDate && contact.nextFollowUpDate <= today
  ).length;
  
  return appFollowUps + contactFollowUps;
}

function updateCharts() {
  // Destroy existing charts first
  if (statusChart) {
    statusChart.destroy();
    statusChart = null;
  }
  if (timeChart) {
    timeChart.destroy();
    timeChart = null;
  }
  if (portalChart) {
    portalChart.destroy();
    portalChart = null;
  }
  if (successChart) {
    successChart.destroy();
    successChart = null;
  }

  if (applications.length === 0) {
    return;
  }

  // Create charts with fixed sizing
  createStatusChart();
  createTimeChart();
  createPortalChart();
  createSuccessChart();
}

function createStatusChart() {
  const canvas = document.getElementById('statusChart');
  if (!canvas) return;

  const statusCounts = {};
  applications.forEach(app => {
    statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
  });

  const ctx = canvas.getContext('2d');
  
  statusChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(statusCounts),
      datasets: [{
        data: Object.values(statusCounts),
        backgroundColor: [
          '#3498db', '#f39c12', '#27ae60', '#e74c3c', 
          '#9b59b6', '#1abc9c', '#34495e', '#95a5a6',
          '#e67e22', '#2ecc71'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 1.5,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 12,
            font: {
              size: 11
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((context.parsed / total) * 100);
              return `${context.label}: ${context.parsed} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

function createTimeChart() {
  const canvas = document.getElementById('timeChart');
  if (!canvas) return;

  const monthCounts = {};
  applications.forEach(app => {
    const month = new Date(app.applicationDate).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
    monthCounts[month] = (monthCounts[month] || 0) + 1;
  });

  const sortedMonths = Object.keys(monthCounts).sort((a, b) => 
    new Date(a + ' 1') - new Date(b + ' 1')
  );

  const ctx = canvas.getContext('2d');
  
  timeChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: sortedMonths,
      datasets: [{
        label: 'Applications',
        data: sortedMonths.map(month => monthCounts[month]),
        borderColor: '#3498db',
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#3498db',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            font: {
              size: 11
            }
          }
        },
        x: {
          ticks: {
            font: {
              size: 11
            }
          }
        }
      }
    }
  });
}

function createPortalChart() {
  const canvas = document.getElementById('portalChart');
  if (!canvas) return;

  const portalCounts = {};
  applications.forEach(app => {
    if (app.jobPortal) {
      portalCounts[app.jobPortal] = (portalCounts[app.jobPortal] || 0) + 1;
    }
  });

  if (Object.keys(portalCounts).length === 0) return;

  const ctx = canvas.getContext('2d');
  
  portalChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(portalCounts),
      datasets: [{
        label: 'Applications',
        data: Object.values(portalCounts),
        backgroundColor: '#3498db',
        borderColor: '#2980b9',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            font: {
              size: 11
            }
          }
        },
        x: {
          ticks: {
            font: {
              size: 11
            }
          }
        }
      }
    }
  });
}

function createSuccessChart() {
  const canvas = document.getElementById('successChart');
  if (!canvas) return;

  const portalSuccess = {};
  
  applications.forEach(app => {
    if (!app.jobPortal) return;
    
    if (!portalSuccess[app.jobPortal]) {
      portalSuccess[app.jobPortal] = { total: 0, responses: 0 };
    }
    
    portalSuccess[app.jobPortal].total++;
    
    if (['Under Review', 'Phone Screen', 'Interview Scheduled', 'Final Interview', 'Offer'].includes(app.status)) {
      portalSuccess[app.jobPortal].responses++;
    }
  });

  const successRates = Object.keys(portalSuccess).map(portal => ({
    portal,
    rate: portalSuccess[portal].total > 0 ? 
      Math.round((portalSuccess[portal].responses / portalSuccess[portal].total) * 100) : 0
  }));

  if (successRates.length === 0) return;

  const ctx = canvas.getContext('2d');
  
  successChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: successRates.map(item => item.portal),
      datasets: [{
        label: 'Response Rate (%)',
        data: successRates.map(item => item.rate),
        backgroundColor: successRates.map(item => 
          item.rate >= 50 ? '#27ae60' : 
          item.rate >= 25 ? '#f39c12' : '#e74c3c'
        ),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.label}: ${context.parsed.y}% response rate`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function(value) {
              return value + '%';
            },
            font: {
              size: 11
            }
          }
        },
        x: {
          ticks: {
            font: {
              size: 11
            }
          }
        }
      }
    }
  });
}

// Safely initialize analytics when page loads
function initializeAnalytics() {
  // Only update if we're on the analytics tab
  const analyticsTab = document.getElementById('analytics');
  if (analyticsTab && analyticsTab.classList.contains('active')) {
    updateAnalytics();
  }
}

// Add resize handler to maintain chart responsiveness
window.addEventListener('resize', function() {
  setTimeout(() => {
    if (statusChart) statusChart.resize();
    if (timeChart) timeChart.resize();
    if (portalChart) portalChart.resize();
    if (successChart) successChart.resize();
  }, 100);
});