# FixItNow API Tester

A comprehensive visual API testing tool for the FixItNow application with 40+ endpoints.

## 📁 Location
The API tester files are located in:
```
backend/src/main/resources/static/
├── api-tester.html
└── api-tester.js
```

## 🚀 How to Access and Use

### Method 1: Through Spring Boot (Recommended)
1. **Start your Spring Boot backend server:**
   ```bash
   cd backend
   ./mvnw spring-boot:run
   # or on Windows:
   mvnw.cmd spring-boot:run
   ```

2. **Open in browser:**
   ```
   http://localhost:8080/api-tester.html
   ```

### Method 2: Direct File Access
1. Open the `api-tester.html` file directly in your browser
2. **Important:** Update the `BASE_URL` in `api-tester.js` if your backend runs on a different port

## 🔐 Authentication

### Login First
1. Use the **Authentication** section at the top
2. Default credentials for testing:
   - **Email:** `admin@example.com`
   - **Password:** `admin123`
   - (Create these users first or use existing credentials)

### Role-Based Testing
The tester supports different user roles:
- **ADMIN**: Can access all endpoints
- **CUSTOMER**: Can access customer-specific endpoints
- **PROVIDER**: Can access provider-specific endpoints

## 📊 Features

### 🎯 Complete API Coverage
- **8 Authentication APIs** (register, login)
- **7 User Management APIs** (CRUD operations, profile management)
- **5 Service APIs** (create, read, update, delete services)
- **9 Booking APIs** (full booking lifecycle management)
- **8 Review APIs** (rating and review system)
- **7 Message APIs** (communication between users)
- **11 Report APIs** (reporting system with admin controls)
- **14 Admin Log APIs** (comprehensive logging system)

### 🔍 Smart Filtering
- **Filter by Controller:** auth, user, service, booking, review, message, report, admin
- **Filter by HTTP Method:** GET, POST, PUT, DELETE, PATCH
- **Search by Name:** Real-time search through API names

### 📝 Visual Interface
- **Color-coded HTTP methods** (GET=Green, POST=Blue, PUT=Yellow, DELETE=Red, PATCH=Purple)
- **Authentication status indicator**
- **Role-based access warnings**
- **Success/Error response highlighting**
- **Response time tracking**

### 📋 Input Management
- **Pre-filled sample data** for quick testing
- **Required field validation**
- **Different input types:** text, email, password, number, textarea, select, datetime
- **Path parameter handling** (automatically replaces URL placeholders)

### 📊 Response Display
- **Complete request/response details**
- **JSON formatting** with syntax highlighting
- **HTTP status codes and headers**
- **Response time measurement**
- **Error handling with detailed messages**

## 🧪 Testing Workflow

### 1. Start with Authentication
```
1. Login with valid credentials
2. Note your role (ADMIN/CUSTOMER/PROVIDER)
3. Token is automatically stored and used for subsequent requests
```

### 2. Test Endpoints Systematically
```
1. Start with basic CRUD operations (User management)
2. Create test data (services, bookings)
3. Test relationships (reviews for bookings, messages between users)
4. Test admin functions (reports, logs)
```

### 3. Common Test Scenarios
```
Customer Journey:
1. Register as CUSTOMER
2. Login
3. Browse services (Get All Services)
4. Create booking
5. Send message to provider
6. Create review after service

Provider Journey:
1. Register as PROVIDER
2. Login  
3. Create services
4. View bookings for their services
5. Respond to messages
6. Update service availability

Admin Journey:
1. Login as ADMIN
2. View all users, services, bookings
3. Monitor reports
4. Check admin logs
5. Handle user management
```

## 🔧 Configuration

### Backend URL Configuration
In `api-tester.js`, update the BASE_URL if needed:
```javascript
const BASE_URL = 'http://localhost:8080'; // Change if different port
```

### CORS Configuration
Ensure your Spring Boot backend allows CORS requests from the testing domain.

## 📝 API Endpoint Summary

| Controller | Endpoints | Description |
|------------|-----------|-------------|
| **Auth** | 2 | User registration and login |
| **User** | 7 | User management, profiles, CRUD |
| **Service** | 5 | Service provider offerings |
| **Booking** | 9 | Appointment and booking system |
| **Review** | 8 | Rating and review system |
| **Message** | 7 | User communication system |
| **Report** | 11 | Issue reporting with admin controls |
| **Admin Log** | 14 | Comprehensive audit logging |

**Total: 63 API endpoints**

## 🛠️ Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Ensure CORS is configured in your Spring Security config
   - Check browser console for specific CORS messages

2. **Authentication Failures**
   - Verify user exists in database
   - Check password encryption method
   - Ensure JWT secret is consistent

3. **404 Errors**
   - Verify backend is running on correct port
   - Check endpoint URLs match your controller mappings
   - Ensure static resources are served correctly

4. **Permission Denied**
   - Check user role matches endpoint requirements
   - Verify JWT token is valid and not expired
   - Ensure proper authentication headers

## 📈 Extending the Tester

To add new endpoints:
1. Add endpoint definition to `apiEndpoints` array in `api-tester.js`
2. Include all required input fields with proper types
3. Add sample data for quick testing
4. Specify authentication requirements and roles

## 🎯 Best Practices

1. **Always test authentication endpoints first**
2. **Use realistic test data**
3. **Test error scenarios** (invalid IDs, missing required fields)
4. **Check role-based access controls**
5. **Monitor response times** for performance issues
6. **Clear outputs** between tests for clarity

---

**Happy Testing! 🚀**

For issues or enhancements, check your backend logs and browser console for detailed error messages.