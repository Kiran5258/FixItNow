# FixItNow - Full-Stack Home Services Platform
## Final Project Presentation Document

---

## 📌 PROJECT OVERVIEW

**FixItNow** is a comprehensive full-stack web application that connects customers with local service providers for home repair and maintenance services. The platform enables seamless booking, real-time communication, review management, and admin oversight.

**Repository**: Kiran5258/FixItNow  
**Current Branch**: sanchit  
**Team Members**: 
- HARINI150806 (Harini)
- Kiran Kumar / Kiran5258
- Sanchit Jakhetia
- Hemanth

---

## 🎯 KEY FEATURES IMPLEMENTED

### **Customer Features**
1. **User Registration & Authentication**
   - Secure JWT-based authentication
   - Role-based access control (Customer, Provider, Admin)
   
2. **Service Discovery**
   - Browse all available services by category (Electrician, Plumber, Cleaning, Painting)
   - Search and filter services by location
   - View service provider profiles with ratings and reviews
   - Interactive map view for finding nearby providers
   
3. **Booking Management**
   - Create new service bookings with date and time slot selection
   - View booking history and status
   - Track booking lifecycle (Pending → Confirmed → Completed)
   - Verify service completion
   - Generate booking summary PDFs
   
4. **Review System**
   - Submit ratings (1-5 stars) and written reviews after service completion
   - View provider's average ratings
   - See all reviews for a specific provider or service
   
5. **Real-Time Chat**
   - Direct messaging with service providers
   - WebSocket-based instant messaging
   - Chat notifications for new messages
   - Unread message counter
   
6. **Report System**
   - Report bookings, providers, or other customers
   - Track report status
   - View report history

### **Provider Features**
1. **Provider Registration**
   - Register as a service provider with category and subcategory
   - Upload verification documents (ID proof, certifications)
   - Profile verification by admin before going live
   
2. **Service Management**
   - Create and manage service listings
   - Set pricing, availability, and descriptions
   - Update service details
   - Delete services
   
3. **Booking Management**
   - View incoming booking requests
   - Accept or reject bookings
   - Update booking status
   - Mark bookings as complete
   - View booking history
   
4. **Reviews & Ratings**
   - View customer reviews
   - Reply to customer reviews
   - Track average rating across all services
   - Delete inappropriate reviews
   
5. **Real-Time Communication**
   - Chat with customers
   - Receive instant booking notifications
   - Chat notification system
   
6. **Dashboard Analytics**
   - View total bookings
   - Track earnings
   - Monitor service performance
   - View customer feedback

### **Admin Features**
1. **User Management**
   - View all users (Customers, Providers, Admins)
   - Edit user details
   - Delete users
   - Monitor user activity
   
2. **Provider Verification**
   - Review uploaded documents
   - Approve or reject provider applications
   - Provide rejection reasons
   - Manage document verification workflow
   
3. **Booking Oversight**
   - View all bookings across the platform
   - Monitor booking status and lifecycle
   - Access detailed booking information
   - Track booking trends
   
4. **Analytics Dashboard**
   - **Summary Metrics**: Total users, active providers, total bookings, revenue
   - **Bookings Per Month**: Time-series data visualization (Recharts)
   - **Top Providers**: Ranking by booking count and revenue
   - **Top Services**: Most booked service categories
   - **Location Trends**: Geographic distribution of bookings
   
5. **Dispute Management**
   - View all reports
   - Filter reports by type (Booking, Provider, Customer)
   - Update report status (Pending, Resolved, Dismissed)
   - Take action on flagged content
   
6. **Service Management**
   - Monitor all services on the platform
   - Edit service details
   - Remove inappropriate services
   - Track service performance

---

## 🏗️ TECHNOLOGY STACK

### **Backend Technologies**
| Technology | Version | Purpose |
|------------|---------|---------|
| **Java** | 21 | Programming language |
| **Spring Boot** | 3.5.6 | Application framework |
| **Spring Security** | 6.x | Authentication & authorization |
| **Spring Data JPA** | 3.x | Database ORM |
| **Spring WebSocket** | 6.x | Real-time communication |
| **JWT (jjwt)** | 0.11.5 | Token-based authentication |
| **MySQL Connector** | 8.0.32 | Database driver |
| **Lombok** | 1.18.30 | Boilerplate code reduction |
| **Dotenv** | 4.0.0 | Environment variable management |
| **Hibernate** | 6.x | ORM implementation |
| **Maven** | 3.8+ | Build & dependency management |

### **Frontend Technologies**
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.1.1 | UI library |
| **React Router DOM** | 7.9.3 | Client-side routing |
| **Vite** | 7.1.7 | Build tool & dev server |
| **TailwindCSS** | 4.1.13 | Utility-first CSS framework |
| **Axios** | 1.12.2 | HTTP client |
| **SockJS Client** | 1.6.1 | WebSocket fallback |
| **STOMP.js** | 7.2.1 | WebSocket protocol |
| **React Leaflet** | 5.0.0 | Interactive maps |
| **Leaflet MarkerCluster** | 1.5.3 | Map clustering |
| **Recharts** | 3.3.0 | Data visualization charts |
| **Framer Motion** | 12.23.24 | Animations |
| **React Icons** | 5.5.0 | Icon library |
| **jsPDF & jsPDF-AutoTable** | 3.0.3, 5.0.2 | PDF generation |
| **React Confetti** | 6.4.0 | Celebration animations |

### **Database**
- **MySQL 8.0+** - Relational database with InnoDB engine

### **Development Tools**
- **Node.js 18+** - JavaScript runtime
- **npm** - Package manager
- **Git** - Version control
- **VS Code** - IDE

---

## 📂 PROJECT FOLDER STRUCTURE

### **Backend Structure**
```
backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── infosys/
│   │   │       └── backend/
│   │   │           ├── BackendApplication.java          # Main entry point
│   │   │           ├── config/                          # Configuration files
│   │   │           │   ├── AdminInitializer.java        # Create default admin
│   │   │           │   ├── JwtAuthFilter.java           # JWT filter
│   │   │           │   ├── JwtChannelInterceptor.java   # WebSocket JWT
│   │   │           │   ├── SecurityConfig.java          # Security setup
│   │   │           │   ├── WebConfig.java               # CORS config
│   │   │           │   └── WebSocketConfig.java         # WebSocket config
│   │   │           ├── controller/                      # REST controllers
│   │   │           │   ├── AdminAnalyticsController.java
│   │   │           │   ├── AuthController.java
│   │   │           │   ├── BookingController.java
│   │   │           │   ├── ChatNotificationController.java
│   │   │           │   ├── DocumentController.java
│   │   │           │   ├── MessageController.java
│   │   │           │   ├── ReportController.java
│   │   │           │   ├── ReviewController.java
│   │   │           │   ├── ServiceController.java
│   │   │           │   └── UserController.java
│   │   │           ├── dto/                             # Data Transfer Objects
│   │   │           │   ├── AnalyticsView.java
│   │   │           │   ├── AuthResponse.java
│   │   │           │   ├── ChatNotificationDTO.java
│   │   │           │   ├── DocumentDTO.java
│   │   │           │   ├── LoginRequest.java
│   │   │           │   ├── MessageDTO.java
│   │   │           │   ├── RegisterRequest.java
│   │   │           │   ├── ReviewReplyRequest.java
│   │   │           │   ├── ReviewResponseDTO.java
│   │   │           │   ├── ServiceRequest.java
│   │   │           │   └── ServiceResponse.java
│   │   │           ├── enums/                           # Enumerations
│   │   │           │   ├── BookingStatus.java
│   │   │           │   ├── Role.java
│   │   │           │   └── TargetType.java
│   │   │           ├── exception/                       # Exception handlers
│   │   │           ├── model/                           # Entity models
│   │   │           │   ├── AdminLog.java
│   │   │           │   ├── Booking.java
│   │   │           │   ├── ChatNotification.java
│   │   │           │   ├── Document.java
│   │   │           │   ├── Message.java
│   │   │           │   ├── Report.java
│   │   │           │   ├── Review.java
│   │   │           │   ├── ServiceProvider.java
│   │   │           │   └── User.java
│   │   │           ├── repository/                      # JPA repositories
│   │   │           │   ├── BookingRepository.java
│   │   │           │   ├── ChatNotificationRepository.java
│   │   │           │   ├── DocumentRepository.java
│   │   │           │   ├── MessageRepository.java
│   │   │           │   ├── ReportRepository.java
│   │   │           │   ├── ReviewRepository.java
│   │   │           │   ├── ServiceRepository.java
│   │   │           │   └── UserRepository.java
│   │   │           ├── security/                        # Security utilities
│   │   │           │   └── JwtUtil.java
│   │   │           └── service/                         # Business logic
│   │   │               ├── AnalyticsService.java
│   │   │               ├── AuthService.java
│   │   │               ├── BookingService.java
│   │   │               ├── ChatNotificationService.java
│   │   │               ├── DocumentService.java
│   │   │               ├── MessageService.java
│   │   │               ├── PresenceService.java
│   │   │               ├── ReportService.java
│   │   │               ├── ReviewService.java
│   │   │               ├── ServiceProviderService.java
│   │   │               └── UserService.java
│   │   └── resources/
│   │       └── application.properties                   # Configuration
│   └── test/                                            # Unit tests
├── target/                                              # Compiled artifacts
├── mvnw, mvnw.cmd                                       # Maven wrapper
└── pom.xml                                              # Maven config
```

### **Frontend Structure**
```
FrontEnd/
├── src/
│   ├── components/                                      # Reusable components
│   │   ├── admin/
│   │   │   ├── AdminChatSection.jsx
│   │   │   ├── BookingsCard.jsx
│   │   │   ├── MetricCard.jsx
│   │   │   ├── ServiceCard.jsx
│   │   │   ├── UserCard.jsx
│   │   │   ├── UsersCardHome.jsx
│   │   │   └── VerifyDocumentsTab.jsx
│   │   ├── ChatComponent.jsx                            # Chat UI
│   │   ├── ChatNotifications.jsx                        # Notification bell
│   │   ├── ChatPage.jsx                                 # Full chat page
│   │   ├── LoginForm.jsx
│   │   ├── MapView.jsx                                  # Leaflet map
│   │   ├── ProtectedRoute.jsx                           # Route guard
│   │   └── ServiceCard.jsx
│   ├── config/
│   │   └── api.config.js                                # API configuration
│   ├── context/
│   │   └── AuthContext.jsx                              # Auth state
│   ├── content/
│   │   └── Userprovider.jsx
│   ├── hooks/
│   │   └── useUserAuth.jsx                              # Auth hook
│   ├── images/                                          # Static assets
│   │   ├── cleaning.png
│   │   ├── electrician.png
│   │   ├── painting.png
│   │   └── plumbing.png
│   ├── pages/                                           # Page components
│   │   ├── Auth/
│   │   │   ├── Login.jsx
│   │   │   └── Registration.jsx
│   │   ├── Customer/
│   │   │   └── BookingSummaryPage.jsx
│   │   ├── Dashboard/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── CustomerDashboard.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── ProviderDashboard.jsx
│   │   │   └── components/
│   │   │       ├── Admin/
│   │   │       │   └── AdminAnalyticsTab.jsx
│   │   │       └── Customer/
│   │   │           ├── BookingFormModal.jsx
│   │   │           ├── BookingsTab.jsx
│   │   │           ├── ProfileTab.jsx
│   │   │           ├── ReportsTab.jsx
│   │   │           ├── ReviewModal.jsx
│   │   │           ├── SearchInput.jsx
│   │   │           ├── ServiceCard.jsx
│   │   │           └── ServicesTab.jsx
│   │   ├── admin/
│   │   │   ├── DisputeManagement.jsx
│   │   │   └── ReportForm.jsx
│   │   ├── Input/
│   │   │   └── Input.jsx
│   │   └── Provider/
│   │       └── ProviderDetailPage.jsx
│   ├── services/
│   │   └── api.js                                       # API service layer
│   ├── utils/
│   │   ├── apiPath.js                                   # API endpoints
│   │   ├── axiosInstance.js                             # Axios config
│   │   ├── data.js                                      # Static data
│   │   └── helper.js                                    # Helper functions
│   ├── App.jsx                                          # Main app component
│   ├── index.css                                        # Global styles
│   └── main.jsx                                         # Entry point
├── .env.example                                         # Environment template
├── eslint.config.js                                     # ESLint config
├── index.html                                           # HTML template
├── package.json                                         # Dependencies
└── vite.config.js                                       # Vite config
```

---

## 🔌 COMPLETE API ENDPOINTS

### **1. Authentication Module** (`/api/auth`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user (Customer/Provider) | Public |
| POST | `/api/auth/login` | Login with email & password | Public |
| POST | `/api/auth/upload-documents/{providerId}` | Upload verification documents | Provider |

**Request/Response Examples:**
```json
// Register Request
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "CUSTOMER",
  "location": "New York"
}

// Login Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "CUSTOMER",
  "verified": true,
  "message": "Login successful"
}
```

### **2. User Management** (`/api/users`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/users/all` | Get all users | Admin/Customer/Provider |
| GET | `/api/users/providers` | Get all verified providers | Customer |
| GET | `/api/users/me` | Get current user profile | Authenticated |
| GET | `/api/users/id/{id}` | Get user by ID | All roles |
| GET | `/api/users/email/{email}` | Get user by email | Owner/Admin |
| GET | `/api/users/username/{username}` | Get user by username | Owner/Admin |
| PUT | `/api/users/{id}` | Update user details | Owner/Admin |
| DELETE | `/api/users/{id}` | Delete user | Admin |

### **3. Service Management** (`/api/services`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/services` | Create new service | Provider |
| GET | `/api/services` | Get all services | Public |
| GET | `/api/services/provider/{providerId}` | Get services by provider | Public |
| PUT | `/api/services/{id}` | Update service | Provider/Admin |
| DELETE | `/api/services/{id}` | Delete service | Provider/Admin |

**Service Request Example:**
```json
{
  "category": "Electrician",
  "subcategory": "Wiring",
  "description": "Professional electrical wiring services",
  "price": 50.00,
  "availability": "Mon-Fri, 9 AM - 5 PM",
  "location": "New York, NY"
}
```

### **4. Booking Management** (`/api/bookings`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/bookings/create` | Create new booking | Customer |
| GET | `/api/bookings/all` | Get all bookings | All roles |
| GET | `/api/bookings/{bookingId}` | Get booking by ID | Owner/Admin |
| GET | `/api/bookings/customer/{customerId}` | Get customer's bookings | Customer/Admin |
| GET | `/api/bookings/provider/{providerId}` | Get provider's bookings | Provider/Admin |
| PUT | `/api/bookings/updateStatus/{bookingId}` | Update booking status | Provider/Admin |
| POST | `/api/bookings/{bookingId}/markComplete` | Mark booking complete | Provider |
| POST | `/api/bookings/{bookingId}/verify` | Verify booking completion | Customer |

**Booking Statuses:**
- `PENDING` - Initial state
- `CONFIRMED` - Accepted by provider
- `COMPLETED` - Service finished
- `CANCELLED` - Cancelled by either party

### **5. Review System** (`/api/reviews`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/reviews/add` | Add new review | Customer |
| GET | `/api/reviews/provider/{providerId}` | Get provider reviews | All roles |
| GET | `/api/reviews/provider/{providerId}/average` | Get average rating | All roles |
| GET | `/api/reviews/service/{serviceId}` | Get service reviews | All roles |
| GET | `/api/reviews/service/{serviceId}/average` | Get service avg rating | All roles |
| GET | `/api/reviews/booking/{bookingId}` | Get review by booking | All roles |
| PUT | `/api/reviews/reply/{reviewId}` | Add reply to review | Provider |
| DELETE | `/api/reviews/{reviewId}` | Delete review | Provider/Admin |

**Review Request Example:**
```json
{
  "bookingId": 123,
  "customerId": 45,
  "providerId": 67,
  "serviceId": 89,
  "rating": 5,
  "comment": "Excellent service! Very professional."
}
```

### **6. Chat & Messaging** (`/api/messages`, `/api/notifications`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/messages` | Send message (REST) | Authenticated |
| GET | `/api/messages/between/{userId}` | Get conversation | Authenticated |
| WS | `/app/chat.sendMessage` | Send message (WebSocket) | Authenticated |
| GET | `/api/notifications/unread` | Get unread notifications | Authenticated |
| GET | `/api/notifications/all` | Get all notifications | Authenticated |
| GET | `/api/notifications/count` | Get unread count | Authenticated |
| PUT | `/api/notifications/{id}/read` | Mark as read | Authenticated |
| PUT | `/api/notifications/read-all` | Mark all as read | Authenticated |
| PUT | `/api/notifications/read-from/{senderId}` | Mark all from sender read | Authenticated |

**WebSocket Configuration:**
- **Endpoint**: `ws://localhost:8080/ws`
- **Subscribe**: `/user/{email}/queue/messages`
- **Send**: `/app/chat.sendMessage`
- **Protocol**: STOMP over SockJS

### **7. Document Verification** (`/api/documents`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/documents/upload/{providerId}` | Upload document | Provider |
| GET | `/api/documents/provider/{providerId}` | Get provider documents | Provider |
| GET | `/api/documents/all` | Get all documents | Admin/Provider |
| PUT | `/api/documents/approve/{id}` | Approve document | Admin |
| PUT | `/api/documents/reject/{id}` | Reject document | Admin |
| DELETE | `/api/documents/{id}` | Delete document | Admin |

### **8. Report System** (`/api/reports`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/reports/create` | Create new report | Customer/Provider |
| GET | `/api/reports/all` | Get all reports | Admin |
| GET | `/api/reports/type/{type}` | Get reports by type | Admin |
| GET | `/api/reports/status/{status}` | Get reports by status | Admin |
| GET | `/api/reports/user/{userId}` | Get user's reports | Admin |
| PUT | `/api/reports/update-status/{id}` | Update report status | Admin |
| DELETE | `/api/reports/{id}` | Delete report | Admin |

**Report Types:**
- `BOOKING` - Issues with bookings
- `PROVIDER` - Provider misconduct
- `CUSTOMER` - Customer issues

### **9. Admin Analytics** (`/api/admin/analytics`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/admin/analytics/summary` | Get platform summary | Admin |
| GET | `/api/admin/analytics/bookings/monthly` | Get monthly booking trends | Admin |
| GET | `/api/admin/analytics/top-providers` | Get top providers | Admin |
| GET | `/api/admin/analytics/top-services` | Get top services | Admin |
| GET | `/api/admin/analytics/locations` | Get location trends | Admin |

**Analytics Response Example:**
```json
{
  "totalUsers": 1500,
  "activeProviders": 350,
  "totalBookings": 5000,
  "totalRevenue": 125000.00,
  "averageRating": 4.6
}
```

---

## 🗄️ DATABASE SCHEMA

### **Entity Relationship Diagram**

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│      User       │         │ ServiceProvider  │         │     Booking     │
├─────────────────┤         ├──────────────────┤         ├─────────────────┤
│ id (PK)         │◄───┐    │ id (PK)          │    ┌───►│ id (PK)         │
│ name            │    │    │ provider_id (FK) │────┘    │ service_id (FK) │
│ email (unique)  │    │    │ category         │         │ customer_id (FK)│
│ password        │    └────│ subcategory      │         │ provider_id (FK)│
│ role (enum)     │         │ description      │         │ bookingDate     │
│ location        │         │ price            │         │ timeSlot        │
│ isVerified      │         │ availability     │         │ status (enum)   │
│ createdAt       │         │ location         │         │ createdAt       │
└─────────────────┘         │ createdAt        │         │ providerMarked  │
        │                   └──────────────────┘         │ customerVerified│
        │                                                 └─────────────────┘
        │                                                          │
        │                                                          │
        ├──────────────────────────────────────┬─────────────────┤
        │                                      │                 │
        ▼                                      ▼                 ▼
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│     Review      │         │     Message      │         │     Report      │
├─────────────────┤         ├──────────────────┤         ├─────────────────┤
│ id (PK)         │         │ id (PK)          │         │ id (PK)         │
│ booking_id (FK) │         │ sender_id (FK)   │         │ targetType      │
│ customer_id (FK)│         │ receiver_id (FK) │         │ targetId        │
│ provider_id (FK)│         │ content          │         │ reported_by (FK)│
│ service_id (FK) │         │ sentAt           │         │ reason          │
│ rating (1-5)    │         └──────────────────┘         │ status          │
│ comment         │                                       │ createdAt       │
│ reply           │                                       └─────────────────┘
│ createdAt       │
└─────────────────┘

┌─────────────────────┐         ┌──────────────────┐
│ ChatNotification    │         │    Document      │
├─────────────────────┤         ├──────────────────┤
│ id (PK)             │         │ id (PK)          │
│ sender_id (FK)      │         │ provider_id (FK) │
│ receiver_id (FK)    │         │ fileName         │
│ messageContent      │         │ fileType         │
│ sentAt              │         │ fileUrl          │
│ isRead              │         │ uploadedAt       │
│ createdAt           │         │ approved         │
└─────────────────────┘         │ rejected         │
                                │ rejectionReason  │
                                └──────────────────┘
```

### **Detailed Table Schemas**

#### **1. users**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(255) | NOT NULL | User's full name |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Email address |
| password | VARCHAR(255) | NOT NULL | Hashed password |
| role | ENUM | NOT NULL | CUSTOMER, PROVIDER, ADMIN |
| location | VARCHAR(255) | | User's location |
| is_verified | BOOLEAN | DEFAULT FALSE | Account verification status |
| created_at | TIMESTAMP | DEFAULT NOW() | Account creation time |

**Relationships:**
- One user → Many services (as provider)
- One user → Many bookings (as customer/provider)
- One user → Many reviews (as customer)
- One user → Many messages (as sender/receiver)

#### **2. services**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Unique identifier |
| provider_id | BIGINT | FK → users.id, NOT NULL | Service provider |
| category | VARCHAR(100) | NOT NULL | Service category |
| subcategory | VARCHAR(100) | | Service subcategory |
| description | TEXT | | Detailed description |
| price | DECIMAL(10,2) | NOT NULL | Service price |
| availability | VARCHAR(255) | | Availability schedule |
| location | VARCHAR(255) | | Service location |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |

**Relationships:**
- Many services → One user (provider)
- One service → Many bookings
- One service → Many reviews

#### **3. bookings**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Unique identifier |
| service_id | BIGINT | FK → services.id, NOT NULL | Booked service |
| customer_id | BIGINT | FK → users.id, NOT NULL | Customer |
| provider_id | BIGINT | FK → users.id, NOT NULL | Provider |
| booking_date | DATE | NOT NULL | Scheduled date |
| time_slot | VARCHAR(50) | | Time slot |
| status | ENUM | DEFAULT PENDING | PENDING, CONFIRMED, COMPLETED, CANCELLED |
| created_at | TIMESTAMP | DEFAULT NOW() | Booking creation time |
| provider_marked_complete | BOOLEAN | DEFAULT FALSE | Provider completion flag |
| customer_verified | BOOLEAN | DEFAULT FALSE | Customer verification flag |

**Relationships:**
- Many bookings → One service
- Many bookings → One customer
- Many bookings → One provider
- One booking → One review (optional)

#### **4. reviews**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Unique identifier |
| booking_id | BIGINT | FK → bookings.id | Associated booking |
| customer_id | BIGINT | FK → users.id, NOT NULL | Reviewer |
| provider_id | BIGINT | FK → users.id, NOT NULL | Reviewed provider |
| service_id | BIGINT | FK → services.id, NOT NULL | Reviewed service |
| rating | INT | NOT NULL, CHECK(1-5) | Star rating |
| comment | TEXT | | Written review |
| reply | VARCHAR(1000) | | Provider's reply |
| created_at | TIMESTAMP | DEFAULT NOW() | Review time |

**Relationships:**
- Many reviews → One booking
- Many reviews → One customer
- Many reviews → One provider
- Many reviews → One service

#### **5. message**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Unique identifier |
| sender_id | BIGINT | FK → users.id, NOT NULL | Message sender |
| receiver_id | BIGINT | FK → users.id, NOT NULL | Message receiver |
| content | TEXT | NOT NULL | Message content |
| sent_at | TIMESTAMP | NOT NULL | Send time |

**Relationships:**
- Many messages → One sender (user)
- Many messages → One receiver (user)

#### **6. chat_notifications**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Unique identifier |
| sender_id | BIGINT | FK → users.id, NOT NULL | Message sender |
| receiver_id | BIGINT | FK → users.id, NOT NULL | Notification recipient |
| message_content | VARCHAR(255) | NOT NULL | Preview of message |
| sent_at | TIMESTAMP | NOT NULL | Message time |
| is_read | BOOLEAN | DEFAULT FALSE | Read status |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |

#### **7. document**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Unique identifier |
| provider_id | BIGINT | FK → users.id | Document owner |
| file_name | VARCHAR(255) | NOT NULL | Original filename |
| file_type | VARCHAR(50) | | MIME type |
| file_url | VARCHAR(500) | | Storage URL |
| uploaded_at | TIMESTAMP | DEFAULT NOW() | Upload time |
| approved | BOOLEAN | DEFAULT FALSE | Admin approval |
| rejected | BOOLEAN | DEFAULT FALSE | Rejection status |
| rejection_reason | VARCHAR(255) | | Reason for rejection |

#### **8. reports**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Unique identifier |
| target_type | ENUM | NOT NULL | BOOKING, PROVIDER, CUSTOMER |
| target_id | BIGINT | NOT NULL | ID of reported entity |
| reported_by | BIGINT | FK → users.id | Reporter |
| reason | TEXT | NOT NULL | Report reason |
| status | VARCHAR(50) | DEFAULT PENDING | PENDING, RESOLVED, DISMISSED |
| created_at | TIMESTAMP | DEFAULT NOW() | Report time |

#### **9. admin_log** (Optional)
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Unique identifier |
| admin_id | BIGINT | FK → users.id | Admin who performed action |
| action | VARCHAR(255) | | Action description |
| entity_type | VARCHAR(50) | | Affected entity type |
| entity_id | BIGINT | | Affected entity ID |
| timestamp | TIMESTAMP | DEFAULT NOW() | Action time |

---

## 🔒 SECURITY IMPLEMENTATION

### **Authentication Flow**
1. **Registration**: Password hashed with BCrypt
2. **Login**: Credentials validated → JWT token generated
3. **Token Structure**:
   ```
   Header: {"alg": "HS256", "typ": "JWT"}
   Payload: {"sub": "user@email.com", "role": "CUSTOMER", "exp": 1234567890}
   Signature: HMACSHA256(base64(header) + "." + base64(payload), secret)
   ```
4. **Token Expiration**: 1 hour (configurable)
5. **Refresh**: Currently manual re-login

### **Authorization**
- **Role-Based Access Control (RBAC)**
- **Spring Security Annotations**: `@PreAuthorize("hasRole('ADMIN')")`
- **Custom JWT Filter**: Validates token on every request
- **WebSocket Security**: JWT passed via STOMP headers

### **CORS Configuration**
```java
@CrossOrigin(origins = "http://localhost:5173")
```

### **Input Validation**
- **DTO Validation**: Bean Validation (JSR-380)
- **SQL Injection Prevention**: JPA parameterized queries
- **XSS Protection**: React auto-escapes inputs

---

## 🚀 DEPLOYMENT CONFIGURATION

### **Environment Variables**

#### **Backend (.env)**
```properties
# Database
DB_URL=jdbc:mysql://production-db:3306/FixItNow
DB_USERNAME=fixitnow_user
DB_PASSWORD=secure_password_here

# Server
SERVER_PORT=8080

# JWT
JWT_SECRET=your_production_jwt_secret_at_least_32_chars
JWT_EXPIRATION=3600000

# Admin
ADMIN_EMAIL=admin@fixitnow.com
ADMIN_PASSWORD=SecureAdminPassword123!

# CORS
CORS_ALLOWED_ORIGINS=https://fixitnow.vercel.app,https://fixitnow.com

# Upload
MAX_FILE_SIZE=10MB
MAX_REQUEST_SIZE=10MB
```

#### **Frontend (.env)**
```properties
VITE_API_BASE_URL=https://api.fixitnow.com
VITE_WS_URL=wss://api.fixitnow.com/ws
```

### **Deployment Platforms**

#### **Recommended: Railway (Backend) + Vercel (Frontend)**

**Backend Deployment (Railway):**
1. Connect GitHub repository
2. Auto-detect Spring Boot
3. Set environment variables
4. MySQL add-on automatically provisioned
5. Auto-deploy on push to main branch

**Frontend Deployment (Vercel):**
1. Connect GitHub repository
2. Framework preset: Vite
3. Build command: `npm run build`
4. Output directory: `dist`
5. Environment variables: `VITE_API_BASE_URL`, `VITE_WS_URL`

**Alternative: Render**
- Backend: Web Service (Docker or Spring Boot)
- Database: PostgreSQL/MySQL instance
- Frontend: Static site

### **Production Checklist**
- ✅ HTTPS enabled (SSL certificates)
- ✅ Environment variables secured
- ✅ Database backups configured
- ✅ CORS properly configured
- ✅ JWT secret rotated
- ✅ File upload limits enforced
- ✅ Rate limiting implemented (optional but recommended)
- ✅ Logging and monitoring setup

---

## 👥 TEAM CONTRIBUTIONS

Based on Git commit history analysis:

### **1. HARINI150806 (Harini)**
**Primary Contributions:**
- ✅ **Chat Feature Implementation** (WebSocket, SockJS, STOMP)
- ✅ **Chat Notifications System**
- ✅ **Backend Analytics Module**
- ✅ **Milestone completions** (Weeks 3-7)
- ✅ **Login flow updates**
- ✅ **Database schema design**

**Key Commits:**
- "chat feature implemented"
- "updated chat-feature"
- "analytics backend update"
- "milestone 4 completed"
- "week 7 completed"

### **2. Kiran Kumar / Kiran5258**
**Primary Contributions:**
- ✅ **Frontend Development** (React components)
- ✅ **Home Page Design**
- ✅ **Chat UI Integration**
- ✅ **Backend bug fixes**
- ✅ **Feature branch management**

**Key Commits:**
- "Home page"
- "chat" (multiple commits)
- "fix the backend error"
- "backend update"
- "Merge pull request #4 from Kiran5258/feature-login"

### **3. Sanchit Jakhetia**
**Primary Contributions:**
- ✅ **Security & Configuration**
- ✅ **Environment variable management**
- ✅ **Secrets hiding**
- ✅ **Deployment preparation**

**Key Commits:**
- "Apply changes to hide secrets and update configs"
- Configuration and security hardening

### **4. Hemanth**
**Primary Contributions:**
- ✅ **Code reviews**
- ✅ **Testing and quality assurance**
- ✅ **Documentation support**

---

## 📊 PROJECT METRICS

### **Code Statistics**
- **Backend**: ~10 Controllers, 11 Services, 9 Models, 8 Repositories
- **Frontend**: 28+ Page Components, 14+ Reusable Components
- **API Endpoints**: 60+ REST endpoints
- **Database Tables**: 9 entities

### **Features Breakdown**
- **User Management**: 5 features
- **Service Management**: 6 features
- **Booking System**: 8 features
- **Chat System**: 6 features
- **Review System**: 5 features
- **Admin Panel**: 10+ features
- **Analytics**: 5 visualization types

### **Testing**
- Unit tests in `backend/src/test/`
- Manual testing throughout development
- Integration testing during deployment

---

## 🎨 UI COMPONENTS & ASSETS

### **Images**
Located in `FrontEnd/src/images/`:
- `cleaning.png` - Cleaning service icon
- `electrician.png` - Electrician service icon
- `painting.png` - Painting service icon
- `plumbing.png` - Plumbing service icon

### **Key UI Components**
1. **ServiceCard** - Display service listings
2. **BookingFormModal** - Create bookings
3. **ReviewModal** - Submit reviews
4. **ChatComponent** - Real-time messaging
5. **MapView** - Interactive Leaflet map with provider markers
6. **MetricCard** - Admin dashboard statistics
7. **VerifyDocumentsTab** - Document approval interface
8. **AdminAnalyticsTab** - Recharts visualizations

### **Styling**
- **TailwindCSS** utility classes
- **Framer Motion** for animations
- **React Icons** for consistent iconography
- **Responsive design** for mobile/tablet/desktop

---

## 🔄 REAL-TIME FEATURES

### **WebSocket Architecture**
```
Client (React + SockJS)
    ↓
WebSocket Connection (/ws endpoint)
    ↓
STOMP Protocol
    ↓
JwtChannelInterceptor (Authentication)
    ↓
MessageController (@MessageMapping)
    ↓
MessageService (Save to DB)
    ↓
SimpMessagingTemplate (Broadcast)
    ↓
Subscribers (/user/{email}/queue/messages)
```

### **Features Using WebSocket**
1. **Instant Messaging** - Real-time chat between users
2. **Notifications** - New message alerts
3. **Presence Detection** - Online/offline status (PresenceService)

---

## 🌟 UNIQUE SELLING POINTS

1. **Real-Time Communication** - Instant chat with WebSocket
2. **Comprehensive Admin Panel** - Full platform oversight with analytics
3. **Provider Verification** - Document-based approval system
4. **Interactive Maps** - Leaflet integration for location-based search
5. **Two-Step Booking Completion** - Provider marks complete → Customer verifies
6. **Review & Reply System** - Providers can respond to reviews
7. **Dispute Management** - Integrated reporting system
8. **PDF Generation** - Booking summaries downloadable
9. **Responsive Design** - Works on all devices
10. **Role-Based Access** - Granular permission system

---

## 📈 FUTURE ENHANCEMENTS (Optional Slide)

1. **Payment Integration** (Stripe/PayPal)
2. **Email Notifications** (SendGrid/Mailgun)
3. **SMS Reminders** (Twilio)
4. **Advanced Search Filters** (Price range, rating, etc.)
5. **Service Provider Calendar** (Availability management)
6. **Multi-language Support** (i18n)
7. **Mobile App** (React Native)
8. **AI-Powered Recommendations**
9. **Loyalty/Referral Program**
10. **Video Consultations** (WebRTC)

---

## 🛠️ LOCAL DEVELOPMENT SETUP

### **Prerequisites**
- Java 21+, Maven 3.8+, MySQL 8.0+, Node.js 18+

### **Backend Setup**
```bash
cd backend
cp .env.example .env
# Edit .env with database credentials
mvn clean install
mvn spring-boot:run
# Server runs on http://localhost:8080
```

### **Frontend Setup**
```bash
cd FrontEnd
npm install
cp .env.example .env
# Edit .env with backend URL
npm run dev
# App runs on http://localhost:5173
```

### **Database**
- Automatically created on first run
- Hibernate DDL: `update` (preserves data)
- Admin account auto-created from .env

---

## 📚 DOCUMENTATION LINKS

- **README**: `README.md` (324 lines)
- **API Documentation**: Generated from controller annotations
- **Configuration**: `application.properties`, `pom.xml`, `package.json`
- **Environment Setup**: `.env.example` files

---

## ✅ PROJECT COMPLETION STATUS

### **✅ Completed Features**
- [x] User authentication & authorization
- [x] Service listing & management
- [x] Booking system with lifecycle management
- [x] Real-time chat
- [x] Review & rating system
- [x] Admin dashboard with analytics
- [x] Provider verification workflow
- [x] Document upload & approval
- [x] Report/dispute management
- [x] Interactive maps
- [x] Responsive UI

### **⚠️ Known Limitations**
- No payment gateway integration
- Email notifications not implemented
- Limited test coverage
- No CI/CD pipeline

---

## 🎓 LEARNING OUTCOMES

Through this project, the team gained hands-on experience with:
- Full-stack development with modern frameworks
- RESTful API design and implementation
- Real-time communication (WebSockets)
- Database design and ORM
- Security best practices (JWT, RBAC)
- State management in React
- Version control with Git
- Collaborative development workflows

---

## 📞 PROJECT DETAILS

**Project Name**: FixItNow  
**Repository**: https://github.com/Kiran5258/FixItNow  
**Tech Stack**: Spring Boot 3.5.6 + React 19 + MySQL 8  
**Development Period**: Multiple milestones completed (Weeks 1-7)  
**Team Size**: 4 members

---

## 🙏 ACKNOWLEDGMENTS

This project was developed as part of a full-stack development course, demonstrating:
- Modern web development practices
- Industry-standard tools and frameworks
- Team collaboration and Git workflows
- Problem-solving and debugging skills
- End-to-end feature implementation

---

**END OF PRESENTATION DOCUMENT**

*This document provides a complete, hierarchical overview of the FixItNow project suitable for presentation purposes. All information is extracted directly from the codebase.*
