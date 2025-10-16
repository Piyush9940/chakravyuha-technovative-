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
    // You can use Toast library or custom notification
    console.log(`${type.toUpperCase()}: ${message}`);
};

const handleApiError = (error) => {
    console.error('API Error:', error);
    if (error.status === 401) {
        showNotification('Session expired. Please login again.', 'error');
        logout();
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
 * ⏰ Update current time
 */
function updateTime() {
    const now = new Date();
    const options = { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true 
    };
    document.getElementById('current-time').textContent = now.toLocaleTimeString('en-US', options);
}

setInterval(updateTime, 1000);
updateTime();

/**
 * 📊 Fetch Dashboard Statistics from Backend
 */
async function fetchDashboardStats() {
    if (!checkAuth()) return;

    try {
        const response = await fetch(`${API_BASE_URL}/delivery/dashboard/stats`, {
            method: 'GET',
            headers: getHeaders()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
            updateStatsUI(data.data);
        } else {
            throw new Error(data.message || 'Failed to fetch dashboard stats');
        }
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        handleApiError(error);
    }
}

/**
 * 🎨 Update Statistics UI
 */
function updateStatsUI(stats) {
    // Update stat cards with animation
    const statCards = {
        'total-deliveries': stats.totalDeliveries || 0,
        'pending-deliveries': stats.pendingDeliveries || 0,
        'in-transit': stats.inTransitDeliveries || 0,
        'completed-today': stats.completedToday || 0,
        'success-rate': `${stats.successRate || 0}%`,
        'avg-delivery-time': `${stats.avgDeliveryTime || 0}min`
    };

    Object.keys(statCards).forEach(statId => {
        const element = document.getElementById(statId);
        if (element) {
            animateValue(element, 0, statCards[statId], 1000);
        }
    });
}

/**
 * 🔢 Animate number values
 */
function animateValue(element, start, end, duration) {
    const startTime = performance.now();
    const value = typeof end === 'string' ? end : parseInt(end);
    
    if (typeof end === 'string') {
        element.textContent = value;
        return;
    }

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentValue = Math.floor(progress * (end - start) + start);
        element.textContent = currentValue.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = end.toLocaleString();
        }
    }
    
    requestAnimationFrame(update);
}

/**
 * 📈 Fetch and Initialize Delivery Time Chart
 */
async function initializeDeliveryTimeChart() {
    if (!checkAuth()) return;

    try {
        const response = await fetch(`${API_BASE_URL}/delivery/analytics/delivery-times`, {
            method: 'GET',
            headers: getHeaders()
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch delivery times');
        }

        const chartData = data.data || {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            averageTimes: [45, 52, 48, 55, 50, 60, 58]
        };

        const deliveryTimeCtx = document.getElementById('deliveryTimeChart').getContext('2d');
        const deliveryTimeChart = new Chart(deliveryTimeCtx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Average Delivery Time (min)',
                    data: chartData.averageTimes,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Avg Time: ${context.parsed.y} minutes`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Minutes'
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error initializing delivery time chart:', error);
        // Fallback to static data
        initializeFallbackCharts();
    }
}

/**
 * 🗺️ Fetch and Initialize Route Efficiency Chart
 */
async function initializeRouteEfficiencyChart() {
    if (!checkAuth()) return;

    try {
        const response = await fetch(`${API_BASE_URL}/delivery/analytics/route-efficiency`, {
            method: 'GET',
            headers: getHeaders()
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch route efficiency');
        }

        const efficiencyData = data.data || {
            routes: ['Route A', 'Route B', 'Route C', 'Route D', 'Route E'],
            efficiencyScores: [85, 72, 90, 65, 78]
        };

        const routeEfficiencyCtx = document.getElementById('routeEfficiencyChart').getContext('2d');
        const routeEfficiencyChart = new Chart(routeEfficiencyCtx, {
            type: 'bar',
            data: {
                labels: efficiencyData.routes,
                datasets: [{
                    label: 'Efficiency Score',
                    data: efficiencyData.efficiencyScores,
                    backgroundColor: [
                        'rgba(46, 204, 113, 0.7)',
                        'rgba(52, 152, 219, 0.7)',
                        'rgba(155, 89, 182, 0.7)',
                        'rgba(52, 73, 94, 0.7)',
                        'rgba(241, 196, 15, 0.7)'
                    ],
                    borderColor: [
                        'rgb(46, 204, 113)',
                        'rgb(52, 152, 219)',
                        'rgb(155, 89, 182)',
                        'rgb(52, 73, 94)',
                        'rgb(241, 196, 15)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Efficiency: ${context.parsed.y}%`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Efficiency (%)'
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error initializing route efficiency chart:', error);
        // Fallback will be handled by initializeFallbackCharts
    }
}

/**
 * 📦 Fetch Recent Deliveries
 */
async function fetchRecentDeliveries() {
    if (!checkAuth()) return;

    try {
        const response = await fetch(`${API_BASE_URL}/delivery?limit=5&sort=-createdAt`, {
            method: 'GET',
            headers: getHeaders()
        });

        const data = await response.json();
        
        if (data.success) {
            updateRecentDeliveriesUI(data.data.deliveries || []);
        }
    } catch (error) {
        console.error('Error fetching recent deliveries:', error);
    }
}

/**
 * 🎨 Update Recent Deliveries UI
 */
function updateRecentDeliveriesUI(deliveries) {
    const container = document.getElementById('recent-deliveries');
    if (!container) return;

    if (deliveries.length === 0) {
        container.innerHTML = '<div class="no-data">No recent deliveries found</div>';
        return;
    }

    container.innerHTML = deliveries.map(delivery => `
        <div class="delivery-item">
            <div class="delivery-info">
                <strong>${delivery.deliveryId}</strong>
                <span class="status-badge status-${delivery.deliveryStatus.toLowerCase()}">
                    ${delivery.deliveryStatus}
                </span>
            </div>
            <div class="delivery-meta">
                <span>${delivery.customerName}</span>
                <span>${new Date(delivery.createdAt).toLocaleDateString()}</span>
            </div>
        </div>
    `).join('');
}

/**
 * 🔄 Fallback Charts (if API fails)
 */
function initializeFallbackCharts() {
    // Delivery Time Chart (Fallback)
    const deliveryTimeCtx = document.getElementById('deliveryTimeChart').getContext('2d');
    new Chart(deliveryTimeCtx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Average Delivery Time (min)',
                data: [45, 52, 48, 55, 50, 60, 58],
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Minutes' }
                }
            }
        }
    });
    
    // Route Efficiency Chart (Fallback)
    const routeEfficiencyCtx = document.getElementById('routeEfficiencyChart').getContext('2d');
    new Chart(routeEfficiencyCtx, {
        type: 'bar',
        data: {
            labels: ['Route A', 'Route B', 'Route C', 'Route D', 'Route E'],
            datasets: [{
                label: 'Efficiency Score',
                data: [85, 72, 90, 65, 78],
                backgroundColor: [
                    'rgba(46, 204, 113, 0.7)',
                    'rgba(52, 152, 219, 0.7)',
                    'rgba(155, 89, 182, 0.7)',
                    'rgba(52, 73, 94, 0.7)',
                    'rgba(241, 196, 15, 0.7)'
                ],
                borderColor: [
                    'rgb(46, 204, 113)',
                    'rgb(52, 152, 219)',
                    'rgb(155, 89, 182)',
                    'rgb(52, 73, 94)',
                    'rgb(241, 196, 15)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: { display: true, text: 'Efficiency (%)' }
                }
            }
        }
    });
}

/**
 * 🎯 Initialize Scroll Animations
 */
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeIn 0.8s ease forwards';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.stat-card, .quick-action-card, .map-container, .chart-container').forEach(el => {
        observer.observe(el);
    });
}

/**
 * 🚀 Initialize Dashboard
 */
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) return;

    // Initialize all dashboard components
    Promise.all([
        fetchDashboardStats(),
        initializeDeliveryTimeChart(),
        initializeRouteEfficiencyChart(),
        fetchRecentDeliveries()
    ]).then(() => {
        console.log('Dashboard initialized successfully');
    }).catch(error => {
        console.error('Dashboard initialization failed:', error);
    });

    initializeAnimations();

    // Refresh data every 5 minutes
    setInterval(fetchDashboardStats, 5 * 60 * 1000);
});