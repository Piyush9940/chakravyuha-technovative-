     const deliveries = [
            {
                id: "TRK-78451",
                status: "in-transit",
                address: "123 Main St, New York, NY 10001",
                estimatedDelivery: "2023-06-15",
                progress: 65,
                items: 2,
                carrier: "UPS"
            },
            {
                id: "TRK-78452",
                status: "delivered",
                address: "456 Oak Ave, Los Angeles, CA 90210",
                estimatedDelivery: "2023-06-10",
                progress: 100,
                items: 1,
                carrier: "FedEx"
            },
            {
                id: "TRK-78453",
                status: "pending",
                address: "789 Pine Rd, Chicago, IL 60616",
                estimatedDelivery: "2023-06-20",
                progress: 0,
                items: 3,
                carrier: "USPS"
            },
            {
                id: "TRK-78454",
                status: "in-transit",
                address: "321 Elm St, Miami, FL 33101",
                estimatedDelivery: "2023-06-14",
                progress: 40,
                items: 1,
                carrier: "DHL"
            },
            {
                id: "TRK-78455",
                status: "delivered",
                address: "654 Maple Dr, Seattle, WA 98101",
                estimatedDelivery: "2023-06-08",
                progress: 100,
                items: 4,
                carrier: "UPS"
            }
        ];

        // DOM elements
        const deliveryList = document.getElementById('delivery-list');
        const emptyState = document.getElementById('empty-state');
        const filterButtons = document.querySelectorAll('.filter-btn');
        const searchInput = document.querySelector('.search-box');

        // Initialize the dashboard
        document.addEventListener('DOMContentLoaded', function() {
            renderDeliveries(deliveries);
            setupEventListeners();
        });

        // Render deliveries to the page
        function renderDeliveries(deliveriesToRender) {
            deliveryList.innerHTML = '';
            
            if (deliveriesToRender.length === 0) {
                emptyState.classList.remove('d-none');
                return;
            }
            
            emptyState.classList.add('d-none');
            
            deliveriesToRender.forEach((delivery, index) => {
                const deliveryElement = createDeliveryElement(delivery, index);
                deliveryList.appendChild(deliveryElement);
            });
        }

        // Create HTML for a single delivery
        function createDeliveryElement(delivery, index) {
            const statusClass = `status-${delivery.status}`;
            const badgeClass = `badge-${delivery.status}`;
            const statusText = delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1).replace('-', ' ');
            
            // Format the date
            const deliveryDate = new Date(delivery.estimatedDelivery);
            const formattedDate = deliveryDate.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
            });
            
            return document.createRange().createContextualFragment(`
                <div class="card status-card ${statusClass} animate-fade-in" style="animation-delay: ${index * 0.1}s">
                    <div class="card-body">
                        <div class="row align-items-center">
                            <div class="col-md-1 text-center">
                                <i class="fas fa-box delivery-icon"></i>
                            </div>
                            <div class="col-md-3">
                                <h5 class="card-title mb-1">${delivery.id}</h5>
                                <p class="text-muted mb-0">${delivery.carrier}</p>
                            </div>
                            <div class="col-md-4">
                                <p class="mb-1"><i class="fas fa-map-marker-alt me-2"></i>${delivery.address}</p>
                                <small class="text-muted"><i class="far fa-calendar me-2"></i>Est. delivery: ${formattedDate}</small>
                            </div>
                            <div class="col-md-2 text-center">
                                <span class="status-badge ${badgeClass}">${statusText}</span>
                            </div>
                            <div class="col-md-2 text-end">
                                <button class="btn btn-outline-primary btn-sm">View Details</button>
                            </div>
                        </div>
                        <div class="row mt-3">
                            <div class="col-12">
                                <div class="d-flex justify-content-between mb-1">
                                    <small>Order processed</small>
                                    <small>${delivery.progress === 100 ? 'Delivered' : 'In transit'}</small>
                                </div>
                                <div class="progress">
                                    <div class="progress-bar ${getProgressBarClass(delivery.status)}" 
                                         role="progressbar" 
                                         style="width: ${delivery.progress}%" 
                                         aria-valuenow="${delivery.progress}" 
                                         aria-valuemin="0" 
                                         aria-valuemax="100">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `);
        }

        // Get appropriate class for progress bar based on status
        function getProgressBarClass(status) {
            switch(status) {
                case 'in-transit': return 'bg-warning';
                case 'delivered': return 'bg-success';
                case 'pending': return 'bg-danger';
                default: return 'bg-primary';
            }
        }

        // Set up event listeners for filters and search
        function setupEventListeners() {
            // Filter buttons
            filterButtons.forEach(button => {
                button.addEventListener('click', function() {
                    // Update active button
                    filterButtons.forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');
                    
                    // Filter deliveries
                    const status = this.getAttribute('data-status');
                    filterDeliveries(status);
                });
            });
            
            // Search input
            searchInput.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                filterDeliveries('all', searchTerm);
            });
        }

        // Filter deliveries based on status and search term
        function filterDeliveries(status, searchTerm = '') {
            let filteredDeliveries = deliveries;
            
            // Filter by status
            if (status !== 'all') {
                filteredDeliveries = filteredDeliveries.filter(delivery => delivery.status === status);
            }
            
            // Filter by search term
            if (searchTerm) {
                filteredDeliveries = filteredDeliveries.filter(delivery => 
                    delivery.id.toLowerCase().includes(searchTerm) || 
                    delivery.address.toLowerCase().includes(searchTerm)
                );
            }
            
            // Render filtered deliveries
            renderDeliveries(filteredDeliveries);
        }