// Global variables for authentication and filtering
let authToken = localStorage.getItem('authToken') || '';
let userRole = localStorage.getItem('userRole') || '';

// Base URL for API calls - automatically detect if served from backend or external
const BASE_URL = window.location.origin.includes('localhost:8081') || window.location.origin.includes('localhost:8080') 
    ? window.location.origin 
    : 'http://localhost:8081';

// Complete list of all API endpoints from your controllers
const apiEndpoints = [
    // Authentication APIs
    {
        name: "Register User",
        method: "POST",
        url: "/api/auth/register",
        controller: "auth",
        inputs: [
            { name: "email", type: "email", required: true },
            { name: "password", type: "password", required: true },
            { name: "name", type: "text", required: true },
            { name: "role", type: "select", options: ["CUSTOMER", "PROVIDER", "ADMIN"], required: true },
            { name: "category", type: "text", required: false },
            { name: "subcategory", type: "text", required: false },
            { name: "skills", type: "textarea", required: false },
            { name: "location", type: "text", required: false }
        ],
        sample: {
            email: "test@example.com",
            password: "test123",
            name: "Test User",
            role: "CUSTOMER",
            location: "New York"
        }
    },
    {
        name: "Login User",
        method: "POST",
        url: "/api/auth/login",
        controller: "auth",
        inputs: [
            { name: "email", type: "email", required: true },
            { name: "password", type: "password", required: true }
        ],
        sample: {
            email: "admin@example.com",
            password: "admin123"
        }
    },

    // User Management APIs
    {
        name: "Get All Users",
        method: "GET",
        url: "/api/users/all",
        controller: "user",
        requiresAuth: true,
        requiredRole: "ADMIN",
        inputs: [],
        sample: {}
    },
    {
        name: "Get All Providers",
        method: "GET",
        url: "/api/users/providers",
        controller: "user",
        requiresAuth: true,
        requiredRole: "CUSTOMER",
        inputs: [],
        sample: {}
    },
    {
        name: "Get My Profile",
        method: "GET",
        url: "/api/users/me",
        controller: "user",
        requiresAuth: true,
        requiredRole: "PROVIDER",
        inputs: [],
        sample: {}
    },
    {
        name: "Get User by ID",
        method: "GET",
        url: "/api/users/id/{id}",
        controller: "user",
        requiresAuth: true,
        inputs: [
            { name: "id", type: "number", required: true, pathParam: true }
        ],
        sample: { id: "1" }
    },
    {
        name: "Get User by Email",
        method: "GET",
        url: "/api/users/email/{email}",
        controller: "user",
        requiresAuth: true,
        inputs: [
            { name: "email", type: "email", required: true, pathParam: true }
        ],
        sample: { email: "test@example.com" }
    },
    {
        name: "Update User",
        method: "PUT",
        url: "/api/users/{id}",
        controller: "user",
        requiresAuth: true,
        inputs: [
            { name: "id", type: "number", required: true, pathParam: true },
            { name: "name", type: "text", required: false },
            { name: "email", type: "email", required: false },
            { name: "location", type: "text", required: false }
        ],
        sample: { id: "1", name: "Updated Name", location: "Updated Location" }
    },
    {
        name: "Delete User",
        method: "DELETE",
        url: "/api/users/{id}",
        controller: "user",
        requiresAuth: true,
        inputs: [
            { name: "id", type: "number", required: true, pathParam: true }
        ],
        sample: { id: "1" }
    },

    // Service APIs
    {
        name: "Create Service",
        method: "POST",
        url: "/api/services",
        controller: "service",
        requiresAuth: true,
        requiredRole: "PROVIDER",
        inputs: [
            { name: "providerId", type: "number", required: true },
            { name: "category", type: "text", required: true },
            { name: "subcategory", type: "text", required: false },
            { name: "description", type: "textarea", required: true },
            { name: "price", type: "number", required: true },
            { name: "availability", type: "text", required: true },
            { name: "location", type: "text", required: true }
        ],
        sample: {
            providerId: 1,
            category: "Home Repair",
            subcategory: "Plumbing",
            description: "Professional plumbing services",
            price: 50.00,
            availability: "Available",
            location: "New York"
        }
    },
    {
        name: "Get All Services",
        method: "GET",
        url: "/api/services",
        controller: "service",
        requiresAuth: true,
        requiredRole: "CUSTOMER,ADMIN",
        inputs: [],
        sample: {}
    },
    {
        name: "Get Services by Provider",
        method: "GET",
        url: "/api/services/provider/{providerId}",
        controller: "service",
        requiresAuth: true,
        inputs: [
            { name: "providerId", type: "number", required: true, pathParam: true }
        ],
        sample: { providerId: "1" }
    },
    {
        name: "Update Service",
        method: "PUT",
        url: "/api/services/{id}",
        controller: "service",
        requiresAuth: true,
        requiredRole: "PROVIDER",
        inputs: [
            { name: "id", type: "number", required: true, pathParam: true },
            { name: "category", type: "text", required: false },
            { name: "subcategory", type: "text", required: false },
            { name: "description", type: "textarea", required: false },
            { name: "price", type: "number", required: false },
            { name: "availability", type: "text", required: false },
            { name: "location", type: "text", required: false }
        ],
        sample: { id: "1", price: 60.00, availability: "Busy" }
    },
    {
        name: "Delete Service",
        method: "DELETE",
        url: "/api/services/{id}",
        controller: "service",
        requiresAuth: true,
        requiredRole: "PROVIDER",
        inputs: [
            { name: "id", type: "number", required: true, pathParam: true }
        ],
        sample: { id: "1" }
    },

    // Booking APIs
    {
        name: "Create Booking",
        method: "POST",
        url: "/api/bookings",
        controller: "booking",
        inputs: [
            { name: "customerId", type: "number", required: true },
            { name: "providerId", type: "number", required: true },
            { name: "serviceId", type: "number", required: true },
            { name: "bookingDate", type: "datetime-local", required: true },
            { name: "status", type: "select", options: ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"], required: true },
            { name: "notes", type: "textarea", required: false }
        ],
        sample: {
            customerId: 1,
            providerId: 2,
            serviceId: 1,
            bookingDate: "2025-10-05T10:00",
            status: "PENDING",
            notes: "Please call before arriving"
        }
    },
    {
        name: "Get All Bookings",
        method: "GET",
        url: "/api/bookings",
        controller: "booking",
        inputs: [],
        sample: {}
    },
    {
        name: "Get Booking by ID",
        method: "GET",
        url: "/api/bookings/{id}",
        controller: "booking",
        inputs: [
            { name: "id", type: "number", required: true, pathParam: true }
        ],
        sample: { id: "1" }
    },
    {
        name: "Get Bookings by Customer",
        method: "GET",
        url: "/api/bookings/customer/{customerId}",
        controller: "booking",
        inputs: [
            { name: "customerId", type: "number", required: true, pathParam: true }
        ],
        sample: { customerId: "1" }
    },
    {
        name: "Get Bookings by Provider",
        method: "GET",
        url: "/api/bookings/provider/{providerId}",
        controller: "booking",
        inputs: [
            { name: "providerId", type: "number", required: true, pathParam: true }
        ],
        sample: { providerId: "1" }
    },
    {
        name: "Get Bookings by Service",
        method: "GET",
        url: "/api/bookings/service/{serviceId}",
        controller: "booking",
        inputs: [
            { name: "serviceId", type: "number", required: true, pathParam: true }
        ],
        sample: { serviceId: "1" }
    },
    {
        name: "Get Bookings by Status",
        method: "GET",
        url: "/api/bookings/status/{status}",
        controller: "booking",
        inputs: [
            { name: "status", type: "select", options: ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"], required: true, pathParam: true }
        ],
        sample: { status: "PENDING" }
    },
    {
        name: "Update Booking",
        method: "PUT",
        url: "/api/bookings/{id}",
        controller: "booking",
        inputs: [
            { name: "id", type: "number", required: true, pathParam: true },
            { name: "bookingDate", type: "datetime-local", required: false },
            { name: "status", type: "select", options: ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"], required: false },
            { name: "notes", type: "textarea", required: false }
        ],
        sample: { id: "1", status: "CONFIRMED" }
    },
    {
        name: "Update Booking Status",
        method: "PATCH",
        url: "/api/bookings/{id}/status",
        controller: "booking",
        inputs: [
            { name: "id", type: "number", required: true, pathParam: true },
            { name: "status", type: "select", options: ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"], required: true }
        ],
        sample: { id: "1", status: "COMPLETED" }
    },
    {
        name: "Delete Booking",
        method: "DELETE",
        url: "/api/bookings/{id}",
        controller: "booking",
        inputs: [
            { name: "id", type: "number", required: true, pathParam: true }
        ],
        sample: { id: "1" }
    },

    // Review APIs
    {
        name: "Create Review",
        method: "POST",
        url: "/api/reviews",
        controller: "review",
        requiresAuth: true,
        requiredRole: "CUSTOMER",
        inputs: [
            { name: "customerId", type: "number", required: true },
            { name: "providerId", type: "number", required: true },
            { name: "bookingId", type: "number", required: true },
            { name: "rating", type: "number", required: true, min: 1, max: 5 },
            { name: "comment", type: "textarea", required: false }
        ],
        sample: {
            customerId: 1,
            providerId: 2,
            bookingId: 1,
            rating: 5,
            comment: "Excellent service!"
        }
    },
    {
        name: "Get All Reviews",
        method: "GET",
        url: "/api/reviews",
        controller: "review",
        inputs: [],
        sample: {}
    },
    {
        name: "Get Review by ID",
        method: "GET",
        url: "/api/reviews/{id}",
        controller: "review",
        inputs: [
            { name: "id", type: "number", required: true, pathParam: true }
        ],
        sample: { id: "1" }
    },
    {
        name: "Get Reviews by Provider",
        method: "GET",
        url: "/api/reviews/provider/{providerId}",
        controller: "review",
        inputs: [
            { name: "providerId", type: "number", required: true, pathParam: true }
        ],
        sample: { providerId: "1" }
    },
    {
        name: "Get Reviews by Customer",
        method: "GET",
        url: "/api/reviews/customer/{customerId}",
        controller: "review",
        inputs: [
            { name: "customerId", type: "number", required: true, pathParam: true }
        ],
        sample: { customerId: "1" }
    },
    {
        name: "Get Reviews by Booking",
        method: "GET",
        url: "/api/reviews/booking/{bookingId}",
        controller: "review",
        inputs: [
            { name: "bookingId", type: "number", required: true, pathParam: true }
        ],
        sample: { bookingId: "1" }
    },
    {
        name: "Get Average Rating for Provider",
        method: "GET",
        url: "/api/reviews/provider/{providerId}/average-rating",
        controller: "review",
        inputs: [
            { name: "providerId", type: "number", required: true, pathParam: true }
        ],
        sample: { providerId: "1" }
    },
    {
        name: "Update Review",
        method: "PUT",
        url: "/api/reviews/{id}",
        controller: "review",
        requiresAuth: true,
        requiredRole: "CUSTOMER",
        inputs: [
            { name: "id", type: "number", required: true, pathParam: true },
            { name: "rating", type: "number", required: false, min: 1, max: 5 },
            { name: "comment", type: "textarea", required: false }
        ],
        sample: { id: "1", rating: 4, comment: "Updated review" }
    },
    {
        name: "Delete Review",
        method: "DELETE",
        url: "/api/reviews/{id}",
        controller: "review",
        requiresAuth: true,
        inputs: [
            { name: "id", type: "number", required: true, pathParam: true }
        ],
        sample: { id: "1" }
    },

    // Message APIs
    {
        name: "Send Message",
        method: "POST",
        url: "/api/messages",
        controller: "message",
        requiresAuth: true,
        inputs: [
            { name: "senderId", type: "number", required: true },
            { name: "receiverId", type: "number", required: true },
            { name: "content", type: "textarea", required: true },
            { name: "subject", type: "text", required: false }
        ],
        sample: {
            senderId: 1,
            receiverId: 2,
            content: "Hello, I need help with plumbing",
            subject: "Plumbing Service Inquiry"
        }
    },
    {
        name: "Get All Messages",
        method: "GET",
        url: "/api/messages",
        controller: "message",
        requiresAuth: true,
        requiredRole: "ADMIN",
        inputs: [],
        sample: {}
    },
    {
        name: "Get Message by ID",
        method: "GET",
        url: "/api/messages/{id}",
        controller: "message",
        inputs: [
            { name: "id", type: "number", required: true, pathParam: true }
        ],
        sample: { id: "1" }
    },
    {
        name: "Get Messages by Sender",
        method: "GET",
        url: "/api/messages/sent/{senderId}",
        controller: "message",
        inputs: [
            { name: "senderId", type: "number", required: true, pathParam: true }
        ],
        sample: { senderId: "1" }
    },
    {
        name: "Get Messages Received",
        method: "GET",
        url: "/api/messages/received/{receiverId}",
        controller: "message",
        inputs: [
            { name: "receiverId", type: "number", required: true, pathParam: true }
        ],
        sample: { receiverId: "1" }
    },
    {
        name: "Get Conversation",
        method: "GET",
        url: "/api/messages/conversation/{userId1}/{userId2}",
        controller: "message",
        inputs: [
            { name: "userId1", type: "number", required: true, pathParam: true },
            { name: "userId2", type: "number", required: true, pathParam: true }
        ],
        sample: { userId1: "1", userId2: "2" }
    },
    {
        name: "Delete Message",
        method: "DELETE",
        url: "/api/messages/{id}",
        controller: "message",
        requiresAuth: true,
        inputs: [
            { name: "id", type: "number", required: true, pathParam: true }
        ],
        sample: { id: "1" }
    },

    // Report APIs
    {
        name: "Create Report",
        method: "POST",
        url: "/api/reports",
        controller: "report",
        requiresAuth: true,
        inputs: [
            { name: "targetType", type: "select", options: ["USER", "SERVICE", "BOOKING", "REVIEW"], required: true },
            { name: "targetId", type: "number", required: true },
            { name: "reason", type: "textarea", required: true },
            { name: "description", type: "textarea", required: false }
        ],
        sample: {
            targetType: "USER",
            targetId: 1,
            reason: "Inappropriate behavior",
            description: "User was rude during service"
        }
    },
    {
        name: "Get All Reports",
        method: "GET",
        url: "/api/reports",
        controller: "report",
        requiresAuth: true,
        requiredRole: "ADMIN",
        inputs: [],
        sample: {}
    },
    {
        name: "Get Report by ID",
        method: "GET",
        url: "/api/reports/{id}",
        controller: "report",
        requiresAuth: true,
        requiredRole: "ADMIN",
        inputs: [
            { name: "id", type: "number", required: true, pathParam: true }
        ],
        sample: { id: "1" }
    },
    {
        name: "Get Reports by Target",
        method: "GET",
        url: "/api/reports/target/{targetType}/{targetId}",
        controller: "report",
        requiresAuth: true,
        requiredRole: "ADMIN",
        inputs: [
            { name: "targetType", type: "select", options: ["USER", "SERVICE", "BOOKING", "REVIEW"], required: true, pathParam: true },
            { name: "targetId", type: "number", required: true, pathParam: true }
        ],
        sample: { targetType: "USER", targetId: "1" }
    },
    {
        name: "Get Reports by Target Type",
        method: "GET",
        url: "/api/reports/target-type/{targetType}",
        controller: "report",
        requiresAuth: true,
        requiredRole: "ADMIN",
        inputs: [
            { name: "targetType", type: "select", options: ["USER", "SERVICE", "BOOKING", "REVIEW"], required: true, pathParam: true }
        ],
        sample: { targetType: "USER" }
    },
    {
        name: "Get Reports by Reporter",
        method: "GET",
        url: "/api/reports/reporter/{reporterId}",
        controller: "report",
        requiresAuth: true,
        inputs: [
            { name: "reporterId", type: "number", required: true, pathParam: true }
        ],
        sample: { reporterId: "1" }
    },
    {
        name: "Get My Reports",
        method: "GET",
        url: "/api/reports/my-reports",
        controller: "report",
        requiresAuth: true,
        inputs: [],
        sample: {}
    },
    {
        name: "Update Report",
        method: "PUT",
        url: "/api/reports/{id}",
        controller: "report",
        requiresAuth: true,
        inputs: [
            { name: "id", type: "number", required: true, pathParam: true },
            { name: "reason", type: "textarea", required: false },
            { name: "description", type: "textarea", required: false }
        ],
        sample: { id: "1", reason: "Updated reason" }
    },
    {
        name: "Delete Report",
        method: "DELETE",
        url: "/api/reports/{id}",
        controller: "report",
        requiresAuth: true,
        inputs: [
            { name: "id", type: "number", required: true, pathParam: true }
        ],
        sample: { id: "1" }
    },
    {
        name: "Get Report Count for Target",
        method: "GET",
        url: "/api/reports/count/target/{targetType}/{targetId}",
        controller: "report",
        requiresAuth: true,
        requiredRole: "ADMIN",
        inputs: [
            { name: "targetType", type: "select", options: ["USER", "SERVICE", "BOOKING", "REVIEW"], required: true, pathParam: true },
            { name: "targetId", type: "number", required: true, pathParam: true }
        ],
        sample: { targetType: "USER", targetId: "1" }
    },

    // Admin Log APIs
    {
        name: "Create Admin Log",
        method: "POST",
        url: "/api/admin-logs",
        controller: "admin",
        requiresAuth: true,
        requiredRole: "ADMIN",
        inputs: [
            { name: "action", type: "text", required: true },
            { name: "targetId", type: "number", required: false },
            { name: "targetType", type: "text", required: false }
        ],
        sample: {
            action: "Manual log entry",
            targetId: 1,
            targetType: "USER"
        }
    },
    {
        name: "Log Action",
        method: "POST",
        url: "/api/admin-logs/log-action",
        controller: "admin",
        requiresAuth: true,
        requiredRole: "ADMIN",
        inputs: [
            { name: "action", type: "text", required: true },
            { name: "targetId", type: "number", required: false },
            { name: "targetType", type: "text", required: false }
        ],
        sample: {
            action: "Test action",
            targetId: 1,
            targetType: "USER"
        }
    },
    {
        name: "Get All Admin Logs",
        method: "GET",
        url: "/api/admin-logs",
        controller: "admin",
        requiresAuth: true,
        requiredRole: "ADMIN",
        inputs: [],
        sample: {}
    },
    {
        name: "Get Admin Log by ID",
        method: "GET",
        url: "/api/admin-logs/{id}",
        controller: "admin",
        requiresAuth: true,
        requiredRole: "ADMIN",
        inputs: [
            { name: "id", type: "number", required: true, pathParam: true }
        ],
        sample: { id: "1" }
    },
    {
        name: "Get Logs by Admin",
        method: "GET",
        url: "/api/admin-logs/admin/{adminId}",
        controller: "admin",
        requiresAuth: true,
        requiredRole: "ADMIN",
        inputs: [
            { name: "adminId", type: "number", required: true, pathParam: true }
        ],
        sample: { adminId: "1" }
    },
    {
        name: "Get My Admin Logs",
        method: "GET",
        url: "/api/admin-logs/my-logs",
        controller: "admin",
        requiresAuth: true,
        requiredRole: "ADMIN",
        inputs: [],
        sample: {}
    },
    {
        name: "Get Logs by Target",
        method: "GET",
        url: "/api/admin-logs/target/{targetType}/{targetId}",
        controller: "admin",
        requiresAuth: true,
        requiredRole: "ADMIN",
        inputs: [
            { name: "targetType", type: "text", required: true, pathParam: true },
            { name: "targetId", type: "number", required: true, pathParam: true }
        ],
        sample: { targetType: "USER", targetId: "1" }
    },
    {
        name: "Get Logs by Target Type",
        method: "GET",
        url: "/api/admin-logs/target-type/{targetType}",
        controller: "admin",
        requiresAuth: true,
        requiredRole: "ADMIN",
        inputs: [
            { name: "targetType", type: "text", required: true, pathParam: true }
        ],
        sample: { targetType: "USER" }
    },
    {
        name: "Get Recent Admin Logs",
        method: "GET",
        url: "/api/admin-logs/recent",
        controller: "admin",
        requiresAuth: true,
        requiredRole: "ADMIN",
        inputs: [
            { name: "limit", type: "number", required: false }
        ],
        sample: { limit: "50" }
    },
    {
        name: "Get Recent Logs by Admin",
        method: "GET",
        url: "/api/admin-logs/admin/{adminId}/recent",
        controller: "admin",
        requiresAuth: true,
        requiredRole: "ADMIN",
        inputs: [
            { name: "adminId", type: "number", required: true, pathParam: true },
            { name: "limit", type: "number", required: false }
        ],
        sample: { adminId: "1", limit: "20" }
    },
    {
        name: "Get My Recent Admin Logs",
        method: "GET",
        url: "/api/admin-logs/my-recent-logs",
        controller: "admin",
        requiresAuth: true,
        requiredRole: "ADMIN",
        inputs: [
            { name: "limit", type: "number", required: false }
        ],
        sample: { limit: "20" }
    },
    {
        name: "Delete Admin Log",
        method: "DELETE",
        url: "/api/admin-logs/{id}",
        controller: "admin",
        requiresAuth: true,
        requiredRole: "ADMIN",
        inputs: [
            { name: "id", type: "number", required: true, pathParam: true }
        ],
        sample: { id: "1" }
    },
    {
        name: "Get Log Count by Admin",
        method: "GET",
        url: "/api/admin-logs/count/admin/{adminId}",
        controller: "admin",
        requiresAuth: true,
        requiredRole: "ADMIN",
        inputs: [
            { name: "adminId", type: "number", required: true, pathParam: true }
        ],
        sample: { adminId: "1" }
    },
    {
        name: "Get Log Count by Action",
        method: "GET",
        url: "/api/admin-logs/count/action",
        controller: "admin",
        requiresAuth: true,
        requiredRole: "ADMIN",
        inputs: [
            { name: "action", type: "text", required: true }
        ],
        sample: { action: "CREATE_USER" }
    }
];

// Authentication functions
async function login() {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    
    if (!email || !password) {
        alert('Please enter both email and password');
        return;
    }
    
    try {
        const response = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            userRole = data.role;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('userRole', userRole);
            updateAuthInfo();
            alert('Login successful!');
        } else {
            alert('Login failed: ' + (data.message || 'Invalid credentials'));
        }
    } catch (error) {
        alert('Login error: ' + error.message);
    }
}

function logout() {
    authToken = '';
    userRole = '';
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    updateAuthInfo();
    alert('Logged out successfully!');
}

function updateAuthInfo() {
    const authInfo = document.getElementById('auth-info');
    if (authToken) {
        authInfo.textContent = `Status: Authenticated as ${userRole}`;
        authInfo.className = 'auth-info authenticated';
    } else {
        authInfo.textContent = 'Status: Not authenticated. Login to test protected endpoints.';
        authInfo.className = 'auth-info';
    }
}

// Filter functions
function filterAPIs() {
    const controllerFilter = document.getElementById('controller-filter').value;
    const methodFilter = document.getElementById('method-filter').value;
    const searchFilter = document.getElementById('search-filter').value.toLowerCase();
    
    const sections = document.querySelectorAll('.api-section');
    sections.forEach((section, index) => {
        const api = apiEndpoints[index];
        let show = true;
        
        if (controllerFilter && api.controller !== controllerFilter) show = false;
        if (methodFilter && api.method !== methodFilter) show = false;
        if (searchFilter && !api.name.toLowerCase().includes(searchFilter)) show = false;
        
        section.style.display = show ? 'block' : 'none';
    });
}

function clearFilters() {
    document.getElementById('controller-filter').value = '';
    document.getElementById('method-filter').value = '';
    document.getElementById('search-filter').value = '';
    filterAPIs();
}

function toggleTroubleshoot() {
    const section = document.getElementById('troubleshoot-section');
    const btn = section.querySelector('button');
    if (section.style.display === 'none') {
        section.style.display = 'block';
        btn.textContent = 'Hide Troubleshooting';
    } else {
        section.style.display = 'none';
        btn.textContent = 'Show Troubleshooting';
    }
}

// API testing functions
async function testAPI(api, formData, outputDiv) {
    outputDiv.innerHTML = '<div class="loading"><div class="spinner"></div>Loading...</div>';
    outputDiv.className = 'output';
    
    // Build URL with path parameters - declare outside try block for error handling
    let url = BASE_URL + api.url;
    let options = {};
    
    try {
        const pathParams = {};
        const bodyData = {};
        
        // Separate path parameters from body data
        api.inputs.forEach(input => {
            const value = formData[input.name];
            if (value !== undefined && value !== '') {
                if (input.pathParam) {
                    pathParams[input.name] = value;
                    url = url.replace(`{${input.name}}`, encodeURIComponent(value));
                } else {
                    bodyData[input.name] = input.type === 'number' ? parseFloat(value) : value;
                }
            }
        });
        
        // Build request options
        options = {
            method: api.method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        // Add authentication header if token exists
        if (authToken) {
            options.headers['Authorization'] = `Bearer ${authToken}`;
        }
        
        // Add body for POST, PUT, PATCH requests
        if (['POST', 'PUT', 'PATCH'].includes(api.method) && Object.keys(bodyData).length > 0) {
            options.body = JSON.stringify(bodyData);
        }
        
        const startTime = Date.now();
        const response = await fetch(url, options);
        const endTime = Date.now();
        
        let responseData;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            responseData = await response.json();
        } else {
            responseData = await response.text();
        }
        
        const result = {
            request: {
                method: api.method,
                url: url,
                headers: options.headers,
                body: options.body ? JSON.parse(options.body) : null
            },
            response: {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries()),
                data: responseData,
                responseTime: `${endTime - startTime}ms`
            }
        };
        
        outputDiv.textContent = JSON.stringify(result, null, 2);
        outputDiv.className = response.ok ? 'output success' : 'output error';
        
    } catch (error) {
        const errorResult = {
            error: error.message,
            request: {
                method: api.method,
                url: url,
                headers: options?.headers || {}
            }
        };
        outputDiv.textContent = JSON.stringify(errorResult, null, 2);
        outputDiv.className = 'output error';
    }
}

function createInputElement(input, sampleValue) {
    let element;
    
    switch (input.type) {
        case 'select':
            element = document.createElement('select');
            input.options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option;
                optionElement.textContent = option;
                element.appendChild(optionElement);
            });
            break;
            
        case 'textarea':
            element = document.createElement('textarea');
            break;
            
        default:
            element = document.createElement('input');
            element.type = input.type;
            if (input.min !== undefined) element.min = input.min;
            if (input.max !== undefined) element.max = input.max;
    }
    
    element.name = input.name;
    element.value = sampleValue || '';
    element.required = input.required;
    
    return element;
}

// Check backend connection
async function checkBackendConnection() {
    const connectionStatus = document.getElementById('connection-status');
    try {
        // Try a simple GET request first to check if backend is accessible
        const response = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: '', password: '' }) // This will fail but should not give CORS error
        });
        
        connectionStatus.textContent = `✅ Backend connected: ${BASE_URL}`;
        connectionStatus.className = 'auth-info authenticated';
        
    } catch (error) {
        connectionStatus.textContent = `❌ Backend connection failed: ${BASE_URL} - ${error.message}`;
        connectionStatus.className = 'auth-info';
        connectionStatus.style.background = '#ffe6e6';
        connectionStatus.style.borderColor = '#ff9999';
        connectionStatus.style.color = '#cc0000';
        
        // Show troubleshooting section if there's a connection issue
        document.getElementById('troubleshoot-section').style.display = 'block';
        
        // Add specific error messages
        if (error.message.includes('CORS')) {
            connectionStatus.innerHTML += '<br>💡 <strong>CORS Issue:</strong> Please restart your backend with CORS enabled';
        } else if (error.message.includes('Failed to fetch')) {
            connectionStatus.innerHTML += '<br>💡 <strong>Backend not running:</strong> Start your Spring Boot application';
        }
    }
}

// Initialize the page
function init() {
    updateAuthInfo();
    checkBackendConnection();
    
    const apiListDiv = document.getElementById("api-list");
    
    apiEndpoints.forEach((api, index) => {
        const section = document.createElement("div");
        section.className = "api-section";
        
        // Header
        const header = document.createElement("div");
        header.className = "api-header";
        header.innerHTML = `
            <span>${api.name}</span>
            <span class="method-badge method-${api.method}">${api.method}</span>
        `;
        section.appendChild(header);
        
        // URL display
        const urlDiv = document.createElement("div");
        urlDiv.style.cssText = "color: #666; margin-bottom: 15px; font-family: monospace; font-size: 0.9em;";
        urlDiv.textContent = api.url;
        section.appendChild(urlDiv);
        
        // Auth requirement display
        if (api.requiresAuth) {
            const authDiv = document.createElement("div");
            authDiv.style.cssText = "background: #fff3cd; color: #856404; padding: 8px; border-radius: 4px; margin-bottom: 15px; font-size: 0.9em;";
            authDiv.textContent = `🔒 Requires authentication${api.requiredRole ? ` (Role: ${api.requiredRole})` : ''}`;
            section.appendChild(authDiv);
        }
        
        // Input form
        const form = document.createElement("form");
        form.onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = {};
            for (let [key, value] of formData.entries()) {
                data[key] = value;
            }
            const outputDiv = section.querySelector(".output");
            await testAPI(api, data, outputDiv);
        };
        
        if (api.inputs.length > 0) {
            const inputGrid = document.createElement("div");
            inputGrid.className = "input-grid";
            
            api.inputs.forEach(input => {
                const row = document.createElement("div");
                row.className = "input-row";
                
                const label = document.createElement("label");
                label.textContent = `${input.name}${input.required ? ' *' : ''}${input.pathParam ? ' (URL param)' : ''}:`;
                
                const inputElement = createInputElement(input, api.sample[input.name]);
                
                row.appendChild(label);
                row.appendChild(inputElement);
                inputGrid.appendChild(row);
            });
            
            form.appendChild(inputGrid);
        }
        
        // Buttons
        const buttonGroup = document.createElement("div");
        buttonGroup.className = "button-group";
        
        const testBtn = document.createElement("button");
        testBtn.type = "submit";
        testBtn.textContent = "🚀 Test API";
        buttonGroup.appendChild(testBtn);
        
        const clearBtn = document.createElement("button");
        clearBtn.type = "button";
        clearBtn.className = "clear-btn";
        clearBtn.textContent = "🗑️ Clear Output";
        clearBtn.onclick = () => {
            const outputDiv = section.querySelector(".output");
            outputDiv.textContent = "";
            outputDiv.className = "output";
        };
        buttonGroup.appendChild(clearBtn);
        
        form.appendChild(buttonGroup);
        section.appendChild(form);
        
        // Output
        const outputDiv = document.createElement("div");
        outputDiv.className = "output";
        section.appendChild(outputDiv);
        
        apiListDiv.appendChild(section);
    });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', init);