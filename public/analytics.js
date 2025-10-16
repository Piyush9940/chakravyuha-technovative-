// Initialize animations
        document.addEventListener('DOMContentLoaded', function() {
            const fadeElements = document.querySelectorAll('.fade-in');
            
            const fadeInObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, { threshold: 0.1 });
            
            fadeElements.forEach(element => {
                fadeInObserver.observe(element);
            });
            
            // Initialize charts
            initializeCharts();
            
            // Initialize map
            initializeMap();
        });

        // Chart initialization
        function initializeCharts() {
            // Delivery Rate Chart
            const deliveryRateCtx = document.getElementById('deliveryRateChart').getContext('2d');
            new Chart(deliveryRateCtx, {
                type: 'line',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Delivery Rate (%)',
                        data: [92, 94, 96, 95, 97, 94, 96],
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            min: 90,
                            max: 100
                        }
                    }
                }
            });

            // Average Time Chart
            const avgTimeCtx = document.getElementById('avgTimeChart').getContext('2d');
            new Chart(avgTimeCtx, {
                type: 'bar',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Avg. Delivery Time (min)',
                        data: [35, 32, 30, 31, 29, 34, 33],
                        backgroundColor: '#2ecc71',
                        borderColor: '#27ae60',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });

            // On-Time Percentage Chart
            const onTimeCtx = document.getElementById('onTimeChart').getContext('2d');
            new Chart(onTimeCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'On-Time Percentage',
                        data: [85, 87, 86, 89, 88, 90],
                        borderColor: '#f39c12',
                        backgroundColor: 'rgba(243, 156, 18, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });

            // Distribution Chart
            const distributionCtx = document.getElementById('distributionChart').getContext('2d');
            new Chart(distributionCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Morning (6AM-12PM)', 'Afternoon (12PM-6PM)', 'Evening (6PM-12AM)', 'Night (12AM-6AM)'],
                    datasets: [{
                        data: [35, 40, 20, 5],
                        backgroundColor: [
                            '#3498db',
                            '#2ecc71',
                            '#f39c12',
                            '#e74c3c'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }

        // Map initialization
        function initializeMap() {
            // Default location (center of a city)
            const defaultLocation = { lat: 40.7128, lng: -74.0060 }; // New York City
            
            // Create map
            const map = new google.maps.Map(document.getElementById('map'), {
                zoom: 12,
                center: defaultLocation,
                mapTypeId: 'roadmap',
                styles: [
                    {
                        featureType: 'poi',
                        stylers: [{ visibility: 'off' }]
                    }
                ]
            });
            
            // Generate sample heatmap data (in a real app, this would come from your API)
            const heatmapData = generateHeatmapData(defaultLocation, 100);
            
            // Create heatmap layer
            const heatmap = new google.maps.visualization.HeatmapLayer({
                data: heatmapData,
                map: map,
                radius: 20,
                opacity: 0.6
            });
        }

        // Generate sample heatmap data
        function generateHeatmapData(center, count) {
            const data = [];
            for (let i = 0; i < count; i++) {
                // Generate random points around the center
                const lat = center.lat + (Math.random() - 0.5) * 0.05;
                const lng = center.lng + (Math.random() - 0.5) * 0.05;
                data.push(new google.maps.LatLng(lat, lng));
            }
            return data;
        }