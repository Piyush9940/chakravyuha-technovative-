// --- Global Configuration & Utilities ---
const API_BASE_URL = 'http://localhost:5000/api/v2/delivery';
const TRACKING_API_BASE_URL = '/api/v2/tracking';

// !!! REPLACE WITH A REAL TOKEN UPON LOGIN !!!
const AUTH_TOKEN = 'mock_admin_dispatcher_jwt'; 

let allDeliveries = [];
let currentTrackingSocket = null; // Manages the active Socket.IO connection

// Utility function to make authenticated fetch requests
async function authFetch(url, options = {}) {
    const defaultHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`,
    };
    
    options.headers = { ...defaultHeaders, ...options.headers };

    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!response.ok) {
        console.error("API Error:", data.message || "Something went wrong");
        throw new Error(data.message || "Failed to fetch data");
    }
    return data;
}

// Global page navigation function
function showPage(pageId) {
    const pages = document.querySelectorAll('.page-content');
    pages.forEach(page => page.style.display = 'none');
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.style.display = 'block';
        targetPage.classList.add('fade-in');
        
        // Clean up Socket.IO if navigating away from the details page
        if (currentTrackingSocket) {
            currentTrackingSocket.disconnect();
            currentTrackingSocket = null;
        }

        // Update active nav link
        const navLinks = document.querySelectorAll('.sidebar .nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === pageId.replace('-page', '')) {
                link.classList.add('active');
            }
        });
    }
}

function initializeMaps(locationData = null) {
    // Placeholder for real map library initialization (e.g., Leaflet or Google Maps)
    console.log("Maps initialized with mock data. Real integration uses Leaflet/Google Maps.");
    if (locationData) {
         // Example of map logic if data is passed
         console.log("Map would center on coordinates:", locationData.coordinates);
    }
}


// --- DOM Ready & Event Listeners ---
document.addEventListener('DOMContentLoaded', function() {
    // Start by showing the delivery list and fetching data
    fetchAndRenderDeliveries();
    
    // Set up navigation links
    const navLinks = document.querySelectorAll('.nav-link, [data-page]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetPage = this.getAttribute('data-page');
            if (targetPage) {
                showPage(targetPage + '-page');
                if (targetPage === 'delivery-list') fetchAndRenderDeliveries();
            }
        });
    });
    
    // Set up delivery row clicks using event delegation
    const deliveryListContainer = document.getElementById('delivery-list-container');
    if (deliveryListContainer) {
        deliveryListContainer.addEventListener('click', function(e) {
            const row = e.target.closest('.delivery-row');
            if (row && !e.target.closest('.btn-action')) {
                const deliveryId = row.getAttribute('data-delivery-id');
                if (deliveryId) {
                    fetchAndRenderDeliveryDetails(deliveryId);
                }
            }
        });
    }

    // Set up add delivery form submission
    const addDeliveryForm = document.getElementById('add-delivery-form');
    if (addDeliveryForm) {
        addDeliveryForm.addEventListener('submit', handleCreateDelivery);
    }
    
    // UI/UX Enhancements (from original script)
    const driverCards = document.querySelectorAll('.driver-card');
    driverCards.forEach(card => {
        card.addEventListener('click', function() {
            driverCards.forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
    const statusBadges = document.querySelectorAll('.status-badge');
    statusBadges.forEach(badge => {
        badge.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
        });
        badge.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = 'none';
        });
    });
    
    initializeMaps();
});


// ----------------------------------------
// --- BACKEND INTEGRATION FUNCTIONS (CRUD) ---
// ----------------------------------------

/**
 * 1. Fetches all deliveries and updates the 'delivery-list-page'.
 */
async function fetchAndRenderDeliveries() {
    const container = document.getElementById('delivery-list-container');
    if (!container) return;
    
    container.innerHTML = '<tr><td colspan="7">Loading deliveries...</td></tr>';

    try {
        const response = await authFetch(`${API_BASE_URL}/`);
        allDeliveries = response.data; 
        
        let html = '';
        if (allDeliveries.length === 0) {
            html = '<tr><td colspan="7">No deliveries found.</td></tr>';
        } else {
            html = allDeliveries.map(delivery => `
                <tr class="delivery-row" data-delivery-id="${delivery._id}">
                    <td>${delivery.deliveryId}</td>
                    <td>${delivery.customerName}</td>
                    <td>${delivery.deliveryAddress}</td>
                    <td>${delivery.driverId?.name || 'Unassigned'}</td>
                    <td><span class="status-badge status-${delivery.deliveryStatus.toLowerCase().replace(' ', '-')}">${delivery.deliveryStatus}</span></td>
                    <td>${new Date(delivery.createdAt).toLocaleDateString()}</td>
                    <td>
                        <button class="btn-action btn-assign" data-id="${delivery._id}">Assign</button>
                    </td>
                </tr>
            `).join('');
        }

        container.innerHTML = html;
        showPage('delivery-list-page'); 

    } catch (error) {
        container.innerHTML = `<tr><td colspan="7" class="error-text">Failed to load data: ${error.message}</td></tr>`;
    }
}


/**
 * 2. Fetches details for a single delivery and sets up Socket.IO for tracking.
 */
async function fetchAndRenderDeliveryDetails(deliveryId) {
    const detailsContainer = document.getElementById('delivery-details-page');
    if (!detailsContainer) return;

    detailsContainer.innerHTML = '<h2>Loading Delivery Details...</h2>'; 

    try {
        const response = await authFetch(`${API_BASE_URL}/${deliveryId}`);
        const delivery = response.data;
        
        // Find the active tracking record for this delivery (Requires separate API call)
        let trackingResponse = await authFetch(`${TRACKING_API_BASE_URL}/active`);
        let activeTracking = trackingResponse.data.find(t => t.deliveryId._id === delivery._id);
        let trackingId = activeTracking ? activeTracking._id : null;
        
        // --- Render Initial Details ---
        detailsContainer.innerHTML = `
            <h2>Delivery #${delivery.deliveryId}</h2>
            <div id="tracking-info">
                <p><strong>Status:</strong> <span id="detail-status">${delivery.deliveryStatus}</span></p>
                <p><strong>Last Update:</strong> <span id="last-update">${activeTracking?.lastUpdated ? new Date(activeTracking.lastUpdated).toLocaleTimeString() : '--'}</span></p>
                <p><strong>Driver:</strong> ${delivery.driverId?.name || 'Unassigned'}</p>
                <p><strong>Current Coords:</strong> <span id="current-coords">${activeTracking?.currentLocation ? `${activeTracking.currentLocation.latitude.toFixed(4)}, ${activeTracking.currentLocation.longitude.toFixed(4)}` : '--'}</span></p>
            </div>
            <div id="tracking-map" style="height: 500px; margin-top: 20px;"></div>
        `;

        showPage('delivery-details-page');
        initializeMaps(delivery.customerLocation); 
        
        // Setup Live Tracking via Socket.IO
        if (trackingId && delivery.deliveryStatus === 'In Transit') {
            setupLiveTracking(trackingId);
        } else {
            console.log("Live tracking inactive for this delivery.");
            document.getElementById('current-coords').style.color = 'gray';
        }

    } catch (error) {
        detailsContainer.innerHTML = `<p class="error-text">Failed to load details: ${error.message}</p>`;
    }
}


/**
 * 3. Handles form submission to create a new delivery.
 */
async function handleCreateDelivery(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Payload construction, mocking driver/location data for simplicity
    const payload = {
        deliveryId: data.deliveryId,
        driverId: data.driverId || '60c72b1f9b1e8b0015b67001', // Mock Driver ID
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        deliveryAddress: data.deliveryAddress,
        customerLocation: { latitude: 40.7128, longitude: -74.006 }, 
        geoFenceArea: [ { latitude: 40.713, longitude: -74.007 }, { latitude: 40.712, longitude: -74.005 } ], 
    };

    try {
        const createButton = form.querySelector('.btn-add-delivery');
        const originalText = createButton.textContent;
        createButton.textContent = 'Adding...';
        createButton.disabled = true;

        await authFetch(`${API_BASE_URL}/create`, {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        alert('Delivery added successfully!');
        form.reset();
        await fetchAndRenderDeliveries(); 
        
    } catch (error) {
        alert(`Failed to add delivery: ${error.message}`);
    } finally {
        const createButton = form.querySelector('.btn-add-delivery');
        createButton.textContent = originalText;
        createButton.disabled = false;
    }
}


// ----------------------------------------
// --- REAL-TIME SOCKET.IO INTEGRATION ---
// ----------------------------------------

function setupLiveTracking(trackingId) {
    if (typeof io === 'undefined') {
        console.error("Socket.IO client library not loaded. Cannot set up live tracking.");
        return;
    }

    if (currentTrackingSocket) currentTrackingSocket.disconnect();

    currentTrackingSocket = io(); // Connects to the server
    currentTrackingSocket.emit('joinTracking', { trackingId }); // Subscribe to the room

    const statusEl = document.getElementById('detail-status');
    const lastUpdateEl = document.getElementById('last-update');
    const coordsEl = document.getElementById('current-coords');
    const mapEl = document.getElementById('tracking-map');

    // Listener for location updates
    currentTrackingSocket.on('locationUpdate', (data) => {
        if (data.trackingId === trackingId) {
            const now = new Date(data.timestamp);
            lastUpdateEl.textContent = now.toLocaleTimeString();
            coordsEl.textContent = `${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)} (Speed: ${data.speed} km/h)`;
            statusEl.textContent = 'IN TRANSIT (LIVE)';
            
            // Highlight map area to indicate live update
            mapEl.style.border = '2px solid #007bff'; 
            setTimeout(() => mapEl.style.border = '1px solid #ccc', 500);
            
            // NOTE: In a real app, you would update the map marker here:
            // updateMapMarker(data.latitude, data.longitude); 
        }
    });

    // Listener for tracking completion
    currentTrackingSocket.on('trackingStopped', (data) => {
        if (data.trackingId === trackingId) {
            statusEl.textContent = 'DELIVERED (COMPLETED)';
            coordsEl.textContent = 'Final location recorded.';
            currentTrackingSocket.disconnect();
            currentTrackingSocket = null;
            mapEl.style.border = '2px solid green';
            alert(`Delivery ${trackingId} has been successfully delivered.`);
            
            // Refresh delivery list to show the updated status
            fetchAndRenderDeliveries();
        }
    });
}
