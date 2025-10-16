const BASE_URL = "http://localhost:5000/api/v2";

// ===================== AUTH =====================

// Register User
async function registerUser(e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const role = document.getElementById("role").value;

  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, role }),
  });

  const data = await res.json();
  if (res.ok) {
    alert("✅ Registered successfully!");
    window.location.href = "login.html";
  } else {
    alert(`❌ Error: ${data.message || "Registration failed"}`);
  }
}

// Login User
async function loginUser(e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (res.ok) {
    localStorage.setItem("token", data.token);
    alert("✅ Login successful!");
    window.location.href = "dashboard.html";
  } else {
    alert(`❌ ${data.message || "Invalid credentials"}`);
  }
}

// Logout
function logoutUser() {
  localStorage.removeItem("token");
  alert("🚪 Logged out successfully!");
  window.location.href = "login.html";
}

// ===================== DELIVERIES =====================

// Create Delivery
async function createDelivery(e) {
  e.preventDefault();

  const token = localStorage.getItem("token");
  if (!token) return alert("❌ Please login first");

  const pickup = document.getElementById("pickup").value;
  const drop = document.getElementById("drop").value;
  const receiver = document.getElementById("receiver").value;

  const res = await fetch(`${BASE_URL}/delivery/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ pickup, drop, receiver }),
  });

  const data = await res.json();
  if (res.ok) {
    alert("✅ Delivery created!");
    getAllDeliveries();
  } else {
    alert(`❌ ${data.message}`);
  }
}

// Get All Deliveries
async function getAllDeliveries() {
  const token = localStorage.getItem("token");
  if (!token) return;

  const res = await fetch(`${BASE_URL}/delivery`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  const container = document.getElementById("delivery-list");
  container.innerHTML = "";

  data?.forEach((d) => {
    const div = document.createElement("div");
    div.classList.add("card", "p-3", "mb-2");
    div.innerHTML = `
      <h5>📦 ${d.receiver}</h5>
      <p><strong>Pickup:</strong> ${d.pickup}</p>
      <p><strong>Drop:</strong> ${d.drop}</p>
      <p><strong>Status:</strong> ${d.status}</p>
    `;
    container.appendChild(div);
  });
}

// Upload Proof of Delivery (POD)
async function uploadPOD(e, deliveryId) {
  e.preventDefault();

  const token = localStorage.getItem("token");
  if (!token) return alert("❌ Please login first");

  const formData = new FormData();
  formData.append("podImage", document.getElementById("podImage").files[0]);

  const res = await fetch(`${BASE_URL}/delivery/pod/${deliveryId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = await res.json();
  if (res.ok) {
    alert("✅ POD uploaded successfully!");
  } else {
    alert(`❌ ${data.message}`);
  }
}

// ===================== TRACKING =====================

// Start Tracking
async function startTracking(deliveryId) {
  const token = localStorage.getItem("token");
  if (!token) return alert("❌ Please login first");

  const res = await fetch(`${BASE_URL}/tracking/start/${deliveryId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (res.ok) alert("🛰️ Tracking started!");
  else alert(`❌ ${data.message}`);
}

// Stop Tracking
async function stopTracking(deliveryId) {
  const token = localStorage.getItem("token");
  if (!token) return alert("❌ Please login first");

  const res = await fetch(`${BASE_URL}/tracking/stop/${deliveryId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (res.ok) alert("🛑 Tracking stopped!");
  else alert(`❌ ${data.message}`);
}

// ===================== PAGE LOAD =====================

document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("dashboard.html")) {
    getAllDeliveries();
  }
});
