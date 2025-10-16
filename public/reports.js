// API Configuration
const API_BASE_URL = 'http://localhost:5000/api/v2';
let authToken = localStorage.getItem('authToken');

// Headers configuration
const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`
});

/**
 * 🎯 Utility Functions
 */
const showNotification = (message, type = 'success') => {
    // Using Toastify or similar library
    if (typeof Toastify !== 'undefined') {
        Toastify({
            text: message,
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: type === 'success' ? "#2ecc71" : type === 'error' ? "#e74c3c" : "#f39c12",
        }).showToast();
    } else {
        alert(message);
    }
};

const handleApiError = (error) => {
    console.error('API Error:', error);
    if (error.status === 401) {
        showNotification('Session expired. Please login again.', 'error');
        logout();
    } else {
        showNotification(error.message || 'Something went wrong', 'error');
    }
};

const checkAuth = () => {
    if (!authToken) {
        window.location.href = '/login.html';
        return false;
    }
    return true;
};

const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    window.location.href = '/login.html';
};

/**
 * 📊 Fetch Reports from Backend
 */
async function fetchReports(filters = {}) {
    if (!checkAuth()) return [];

    try {
        // Build query string from filters
        const queryParams = new URLSearchParams();
        if (filters.driver) queryParams.append('driverId', filters.driver);
        if (filters.date) queryParams.append('date', filters.date);
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.type) queryParams.append('type', filters.type);
        if (filters.startDate) queryParams.append('startDate', filters.startDate);
        if (filters.endDate) queryParams.append('endDate', filters.endDate);

        const response = await fetch(`${API_BASE_URL}/reports?${queryParams}`, {
            method: 'GET',
            headers: getHeaders()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
            return data.data.reports || [];
        } else {
            throw new Error(data.message || 'Failed to fetch reports');
        }
    } catch (error) {
        console.error('Error fetching reports:', error);
        handleApiError(error);
        return [];
    }
}

/**
 * 📈 Fetch Report Statistics
 */
async function fetchReportStats() {
    if (!checkAuth()) return null;

    try {
        const response = await fetch(`${API_BASE_URL}/reports/stats`, {
            method: 'GET',
            headers: getHeaders()
        });

        const data = await response.json();
        
        if (data.success) {
            return data.data;
        }
        return null;
    } catch (error) {
        console.error('Error fetching report stats:', error);
        return null;
    }
}

/**
 * 🎨 Populate Reports Table with Real Data
 */
async function populateReportsTable(filters = {}) {
    const tableBody = document.getElementById('reportsTableBody');
    const loadingRow = document.getElementById('loadingRow');
    
    // Show loading
    if (loadingRow) loadingRow.style.display = 'table-row';
    tableBody.innerHTML = '';

    try {
        const reports = await fetchReports(filters);
        
        if (loadingRow) loadingRow.style.display = 'none';

        if (reports.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4 text-muted">
                        <i class="fas fa-inbox fa-2x mb-2"></i>
                        <p>No reports found</p>
                    </td>
                </tr>
            `;
            document.getElementById('showingCount').textContent = '0';
            return;
        }

        reports.forEach((report, index) => {
            const row = document.createElement('tr');
            row.className = `report-item fade-in`;
            row.style.animationDelay = `${index * 0.1}s`;

            const statusBadge = getStatusBadge(report.status);
            const actions = getActionButtons(report);

            row.innerHTML = `
                <td>${report.reportId || report._id}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <img src="${report.driver?.profileImage || '/default-avatar.png'}" 
                             alt="${report.driver?.name}" 
                             class="rounded-circle me-2" 
                             width="32" height="32">
                        <div>
                            <div class="fw-semibold">${report.driver?.name || 'N/A'}</div>
                            <small class="text-muted">${report.driver?.driverId || ''}</small>
                        </div>
                    </div>
                </td>
                <td>${formatDate(report.createdAt)}</td>
                <td>
                    <span class="report-type-badge">${report.reportType}</span>
                </td>
                <td>${report.period || 'N/A'}</td>
                <td>${statusBadge}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        ${actions}
                    </div>
                </td>
            `;

            tableBody.appendChild(row);
        });

        // Add event listeners to action buttons
        addActionEventListeners();

        document.getElementById('showingCount').textContent = reports.length;
        
    } catch (error) {
        if (loadingRow) loadingRow.style.display = 'none';
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4 text-danger">
                    <i class="fas fa-exclamation-triangle fa-2x mb-2"></i>
                    <p>Failed to load reports</p>
                    <button class="btn btn-sm btn-outline-primary" onclick="populateReportsTable()">
                        <i class="fas fa-redo"></i> Retry
                    </button>
                </td>
            </tr>
        `;
    }
}

/**
 * 🎨 Get Status Badge HTML
 */
function getStatusBadge(status) {
    const statusConfig = {
        completed: { class: 'success', text: 'Completed', icon: 'check' },
        pending: { class: 'warning', text: 'Pending', icon: 'clock' },
        failed: { class: 'danger', text: 'Failed', icon: 'times' },
        generating: { class: 'info', text: 'Generating', icon: 'sync' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    
    return `
        <span class="status-badge status-${config.class}">
            <i class="fas fa-${config.icon} me-1"></i>
            ${config.text}
        </span>
    `;
}

/**
 * 🔘 Get Action Buttons HTML
 */
function getActionButtons(report) {
    const baseActions = `
        <button class="btn btn-outline-primary download-btn" 
                data-id="${report._id}" 
                data-type="pdf"
                title="Download PDF">
            <i class="fas fa-file-pdf"></i>
        </button>
        <button class="btn btn-outline-success download-btn" 
                data-id="${report._id}" 
                data-type="excel"
                title="Download Excel">
            <i class="fas fa-file-excel"></i>
        </button>
    `;

    if (report.status === 'failed') {
        return baseActions + `
            <button class="btn btn-outline-warning retry-btn" 
                    data-id="${report._id}"
                    title="Retry Generation">
                <i class="fas fa-redo"></i>
            </button>
        `;
    }

    if (report.status === 'pending' || report.status === 'generating') {
        return `
            <button class="btn btn-outline-secondary" disabled title="Report is being generated">
                <i class="fas fa-spinner fa-spin"></i>
            </button>
        `;
    }

    return baseActions;
}

/**
 * 📥 Download Report File
 */
async function downloadReport(reportId, fileType) {
    if (!checkAuth()) return;

    try {
        const button = document.querySelector(`.download-btn[data-id="${reportId}"][data-type="${fileType}"]`);
        const originalContent = button.innerHTML;
        
        // Show loading state
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        button.disabled = true;

        const response = await fetch(`${API_BASE_URL}/reports/${reportId}/download?format=${fileType}`, {
            method: 'GET',
            headers: getHeaders()
        });

        if (!response.ok) {
            throw new Error(`Download failed: ${response.status}`);
        }

        // Get filename from response headers
        const contentDisposition = response.headers.get('content-disposition');
        const filename = contentDisposition 
            ? contentDisposition.split('filename=')[1].replace(/"/g, '')
            : `report-${reportId}.${fileType}`;

        // Create blob and download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        showNotification(`Report downloaded as ${fileType.toUpperCase()}`);

    } catch (error) {
        console.error('Download error:', error);
        showNotification('Failed to download report', 'error');
    } finally {
        // Restore button state
        const button = document.querySelector(`.download-btn[data-id="${reportId}"][data-type="${fileType}"]`);
        if (button) {
            button.innerHTML = originalContent;
            button.disabled = false;
        }
    }
}

/**
 * 🔄 Retry Report Generation
 */
async function retryReportGeneration(reportId) {
    if (!checkAuth()) return;

    try {
        const button = document.querySelector(`.retry-btn[data-id="${reportId}"]`);
        const originalContent = button.innerHTML;
        
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        button.disabled = true;

        const response = await fetch(`${API_BASE_URL}/reports/${reportId}/retry`, {
            method: 'POST',
            headers: getHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Retry failed');
        }

        showNotification('Report generation restarted');
        
        // Refresh the table after a short delay
        setTimeout(() => populateReportsTable(), 2000);

    } catch (error) {
        console.error('Retry error:', error);
        showNotification('Failed to retry report generation', 'error');
    } finally {
        const button = document.querySelector(`.retry-btn[data-id="${reportId}"]`);
        if (button) {
            button.innerHTML = '<i class="fas fa-redo"></i>';
            button.disabled = false;
        }
    }
}

/**
 * 📊 Initialize Report Chart with Real Data
 */
async function initializeReportChart() {
    try {
        const stats = await fetchReportStats();
        const chartData = stats?.statusDistribution || { completed: 118, pending: 18, failed: 6 };

        const ctx = document.getElementById('reportChart').getContext('2d');
        const reportChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'Pending', 'Failed'],
                datasets: [{
                    data: [chartData.completed || 0, chartData.pending || 0, chartData.failed || 0],
                    backgroundColor: ['#2ecc71', '#f39c12', '#e74c3c'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
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
    } catch (error) {
        console.error('Error initializing chart:', error);
        // Fallback to static data
        initializeFallbackChart();
    }
}

/**
 * 📋 Add Event Listeners to Action Buttons
 */
function addActionEventListeners() {
    // Download buttons
    document.querySelectorAll('.download-btn').forEach(button => {
        button.addEventListener('click', function() {
            const reportId = this.getAttribute('data-id');
            const fileType = this.getAttribute('data-type');
            downloadReport(reportId, fileType);
        });
    });

    // Retry buttons
    document.querySelectorAll('.retry-btn').forEach(button => {
        button.addEventListener('click', function() {
            const reportId = this.getAttribute('data-id');
            retryReportGeneration(reportId);
        });
    });
}

/**
 * 📅 Format Date for Display
 */
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * 🚀 Initialize the Page
 */
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) return;

    // Initialize components
    populateReportsTable();
    initializeReportChart();

    // Event listeners for filters
    document.getElementById('applyFilters').addEventListener('click', async function() {
        const filters = {
            driver: document.getElementById('driverFilter').value,
            date: document.getElementById('dateFilter').value,
            status: document.getElementById('statusFilter').value,
            type: document.getElementById('typeFilter').value,
            startDate: document.getElementById('startDateFilter').value,
            endDate: document.getElementById('endDateFilter').value
        };

        await populateReportsTable(filters);
        
        // Add animation
        const tableBody = document.getElementById('reportsTableBody');
        tableBody.classList.add('animate__animated', 'animate__fadeIn');
        setTimeout(() => {
            tableBody.classList.remove('animate__animated', 'animate__fadeIn');
        }, 1000);
    });

    document.getElementById('resetFilters').addEventListener('click', function() {
        document.getElementById('driverFilter').value = '';
        document.getElementById('dateFilter').value = '';
        document.getElementById('statusFilter').value = '';
        document.getElementById('typeFilter').value = '';
        document.getElementById('startDateFilter').value = '';
        document.getElementById('endDateFilter').value = '';
        
        populateReportsTable();
        
        const tableBody = document.getElementById('reportsTableBody');
        tableBody.classList.add('animate__animated', 'animate__fadeIn');
        setTimeout(() => {
            tableBody.classList.remove('animate__animated', 'animate__fadeIn');
        }, 1000);
    });

    // Generate new report
    document.getElementById('generateReport').addEventListener('click', function() {
        window.location.href = '/generate-report.html';
    });

    // Export all buttons
    document.getElementById('exportAllPdf').addEventListener('click', function() {
        showNotification('Bulk PDF export feature coming soon!', 'info');
    });

    document.getElementById('exportAllExcel').addEventListener('click', function() {
        showNotification('Bulk Excel export feature coming soon!', 'info');
    });
});

/**
 * 📉 Fallback Chart (if API fails)
 */
function initializeFallbackChart() {
    const ctx = document.getElementById('reportChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Pending', 'Failed'],
            datasets: [{
                data: [118, 18, 6],
                backgroundColor: ['#2ecc71', '#f39c12', '#e74c3c'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}