# FixItNow - Home Services Platform

A full-stack web application connecting customers with local service providers for home repair and maintenance services.

## 🚀 Tech Stack

### Backend
- **Java 21** with Spring Boot 3.5.6
- **MySQL** database
- **Spring Security** with JWT authentication
- **WebSocket** for real-time chat
- **Maven** for dependency management

### Frontend
- **React 18** with Vite
- **React Router** for navigation
- **Axios** for API calls
- **TailwindCSS** for styling
- **SockJS & STOMP** for WebSocket communication

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Java Development Kit (JDK) 21** or higher
- **Maven 3.8+** (or use the included Maven wrapper)
- **MySQL 8.0+**
- **Node.js 18+** and npm
- **Git**

---

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone URL
cd FixItNow
```

### 2. Database Setup

1. **Install MySQL** (if not already installed)
2. **Start MySQL server**
3. The application will automatically create the database on first run

**Note:** The database `FixItNow` will be created automatically with the connection string. You just need MySQL running.

### 3. Backend Setup

#### Step 1: Navigate to backend directory
```bash
cd backend
```

#### Step 2: Create environment file
```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

#### Step 3: Configure environment variables
Edit the `.env` file and update with your credentials:

```env
# Database Configuration
DB_URL=jdbc:mysql://localhost:3306/FixItNow?createDatabaseIfNotExist=true
DB_USERNAME=root
DB_PASSWORD=your_mysql_password

# Server Configuration
SERVER_PORT=8080

# JWT Configuration (Change this secret!)
JWT_SECRET=your_jwt_secret_key_minimum_32_characters_long
JWT_EXPIRATION=3600000

# Admin Account (Change these!)
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD=admin123

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:5173

# File Upload Configuration
MAX_FILE_SIZE=10MB
MAX_REQUEST_SIZE=10MB
```

#### Step 4: Build and run the backend

**Option A: Using Maven Wrapper (Recommended)**
```bash
# Windows
mvnw.cmd clean install
mvnw.cmd spring-boot:run

# Mac/Linux
./mvnw clean install
./mvnw spring-boot:run
```

**Option B: Using System Maven**
```bash
mvn clean install
mvn spring-boot:run
```

The backend will start at: **http://localhost:8080**

### 4. Frontend Setup

#### Step 1: Navigate to frontend directory
```bash
cd ../FrontEnd
```

#### Step 2: Create environment file
```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

#### Step 3: Configure environment variables (optional)
The `.env` file should already have the correct defaults:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_WS_URL=http://localhost:8080/ws
```

Only edit these if your backend is running on a different port.

#### Step 4: Install dependencies and run
```bash
npm install
npm run dev
```

The frontend will start at: **http://localhost:5173**

---

## 🎯 Default Login Credentials

### Admin Account
- **Email:** admin@gmail.com (or as configured in `.env`)
- **Password:** admin123 (or as configured in `.env`)

### Test Accounts
You can create new accounts by registering through the application:
- **Customer** accounts can browse and book services
- **Provider** accounts can offer services (requires document verification by admin)

---

## 📁 Project Structure

```
FixItNow/
├── backend/                    # Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── infosys/backend/
│   │   │   │       ├── config/      # Security, CORS, WebSocket config
│   │   │   │       ├── controller/  # REST API endpoints
│   │   │   │       ├── dto/         # Data Transfer Objects
│   │   │   │       ├── model/       # JPA entities
│   │   │   │       ├── repository/  # Database repositories
│   │   │   │       ├── security/    # JWT utilities
│   │   │   │       └── service/     # Business logic
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   ├── .env                    # Environment variables (gitignored)
│   ├── .env.example           # Environment template
│   └── pom.xml                # Maven dependencies
│
└── FrontEnd/                  # React frontend
    ├── src/
    │   ├── components/        # Reusable UI components
    │   ├── config/           # API configuration
    │   ├── context/          # React context providers
    │   ├── pages/            # Page components
    │   ├── services/         # API service layer
    │   └── utils/            # Helper functions
    ├── .env                  # Environment variables (gitignored)
    ├── .env.example         # Environment template
    └── package.json         # npm dependencies
```

---

## 🔧 Development Workflow

### Running Both Services

**Terminal 1 - Backend:**
```bash
cd backend
mvnw.cmd spring-boot:run    # Windows
./mvnw spring-boot:run      # Mac/Linux
```

**Terminal 2 - Frontend:**
```bash
cd FrontEnd
npm run dev
```

### Making Changes

1. **Backend changes:**
   - Edit Java files in `backend/src/main/java/`
   - Spring Boot DevTools will auto-reload most changes
   - For major changes, restart the server

2. **Frontend changes:**
   - Edit files in `FrontEnd/src/`
   - Vite will hot-reload automatically
   - No restart needed

---

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/upload-documents/{providerId}` - Upload provider documents

### Users
- `GET /api/users/me` - Get current user profile
- `GET /api/users/providers` - Get all providers
- `PUT /api/users/{id}` - Update user profile

### Services
- `GET /api/services` - Get all services
- `POST /api/services` - Create service (Provider only)
- `PUT /api/services/{id}` - Update service
- `DELETE /api/services/{id}` - Delete service

### Bookings
- `POST /api/bookings/create` - Create new booking
- `GET /api/bookings/customer/{customerId}` - Get customer bookings
- `GET /api/bookings/provider/{providerId}` - Get provider bookings
- `PUT /api/bookings/updateStatus/{bookingId}` - Update booking status

### Reviews
- `POST /api/reviews/add` - Add review
- `GET /api/reviews/provider/{providerId}` - Get provider reviews

### Admin
- `GET /api/admin/analytics/**` - Admin analytics endpoints
- `GET /api/users/all` - Get all users (Admin only)

---

## 🐛 Troubleshooting

### Backend Issues

**Problem:** Can't connect to database
```
Solution: 
1. Check if MySQL is running
2. Verify DB_USERNAME and DB_PASSWORD in .env
3. Ensure MySQL port 3306 is not blocked
```

**Problem:** Port 8080 already in use
```
Solution:
1. Change SERVER_PORT in .env
2. Update VITE_API_BASE_URL in frontend .env
3. Restart both services
```

**Problem:** JWT errors
```
Solution:
1. Ensure JWT_SECRET in .env is at least 32 characters
2. Clear browser localStorage
3. Re-login
```

### Frontend Issues

**Problem:** API calls failing
```
Solution:
1. Verify backend is running at http://localhost:8080
2. Check VITE_API_BASE_URL in .env
3. Check browser console for CORS errors
4. Ensure CORS_ALLOWED_ORIGINS includes frontend URL
```

**Problem:** WebSocket connection failed
```
Solution:
1. Verify VITE_WS_URL is correct in .env
2. Check backend WebSocket configuration
3. Clear browser cache
```

**Problem:** npm install errors
```
Solution:
1. Delete node_modules folder
2. Delete package-lock.json
3. Run npm install again
4. Try: npm install --legacy-peer-deps
```
---