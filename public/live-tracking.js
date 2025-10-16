// --- Configuration ---
const TRACKING_ID = '60c72b1f9b1e8b0015b67890'; // Replace with a real tracking ID
const API_BASE_URL = 'http://localhost:5000/api/v2/tracking';
const POLLING_INTERVAL_MS = 10000; // 10 seconds

document.addEventListener('DOMContentLoaded', function() {
    const updateIndicator = document.getElementById('updateIndicator');
    const lastUpdate = document.getElementById('last-update');
    const nextUpdate = document.getElementById('next-update');
    const progressFill = document.getElementById('progress-fill');
    const statusText = document.getElementById('status-text'); // Assuming a status element

    updateIndicator.style.display = 'none';

    // Function to fetch the tracking data from the backend
    async function fetchTrackingData() {
        // Show update indicator
        updateIndicator.style.display = 'flex';

        try {
            // Replace with your actual authentication token if needed
            const token = 'YOUR_AUTH_TOKEN';
            
            const response = await fetch(`${API_BASE_URL}/${TRACKING_ID}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // The backend requires authMiddleware for this route:
                    'Authorization': `Bearer ${token}` 
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error:', errorData.message);
                // Handle 404, 401, etc.
                return;
            }

            const data = await response.json();
            const tracking = data.data; // Assuming 'data' contains the tracking object

            // --- Update UI with Real Data ---
            
            // 1. Update last update time
            const now = new Date(tracking.lastUpdated || Date.now());
            lastUpdate.textContent = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

            // 2. Update progress (requires logic to calculate progress based on route/location)
            // For a simple demo, let's update status and simulate a small progress change
            
            // Note: Real progress calculation requires complex geospatial logic.
            // Here, we'll keep the simple simulation but link it to the real status.
            
            if (statusText) {
                 statusText.textContent = `Status: ${tracking.status.toUpperCase()}`;
            }

            // Simulate progress (you'd replace this with a real calculation)
            const currentProgress = parseInt(progressFill.style.width) || 0;
            const newProgress = tracking.status === 'completed' ? 100 : Math.min(currentProgress + 5, 95);
            progressFill.style.width = `${newProgress}%`;
            
            // Move the active point
            const activePoint = document.querySelector('.progress-point.active');
            if (activePoint) {
                 activePoint.style.left = `${newProgress}%`;
            }

            // 3. Check for completion and stop polling
            if (tracking.status === 'completed' || tracking.status === 'delivered') {
                clearInterval(pollingInterval); // Stop the periodic updates
                nextUpdate.textContent = 'Delivery Completed!';
                console.log("Tracking complete, polling stopped.");
                return;
            }

        } catch (error) {
            console.error("Failed to fetch tracking data:", error);
        } finally {
            // Hide update indicator whether successful or failed
            updateIndicator.style.display = 'none';
        }
    }

    // --- Start Polling and Countdown ---
    
    // Initial call
    fetchTrackingData();
    
    // Set up periodic polling
    const pollingInterval = setInterval(() => {
        fetchTrackingData();
    }, POLLING_INTERVAL_MS);

    // Update next update countdown (optional, but good UX)
    let countdown = POLLING_INTERVAL_MS / 1000;
    const countdownInterval = setInterval(() => {
        countdown--;
        nextUpdate.textContent = `${countdown} seconds`;
        
        if (countdown <= 0) {
            countdown = POLLING_INTERVAL_MS / 1000;
        }
    }, 1000);
});