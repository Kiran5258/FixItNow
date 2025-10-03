# FixItNow Backend API Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Security Configuration](#security-configuration)
7. [Configuration Properties](#configuration-properties)
8. [Build & Deployment](#build--deployment)
9. [Error Handling](#error-handling)
10. [Testing](#testing)

---

## 🚀 Project Overview

**FixItNow** is a comprehensive service marketplace backend application built with Spring Boot. It enables customers to find and book services from providers, manage bookings, reviews, and communications.

### Key Features
- **User Management**: Registration, authentication, and profile management
- **Service Management**: Service providers can list and manage their services
- **Booking System**: Customers can book services with status tracking
- **Review System**: Rating and feedback mechanism
- **Messaging**: Real-time communication between users
- **Admin Dashboard**: Administrative controls and reporting
- **JWT Security**: Secure authentication and authorization

---

## 🛠 Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| **Framework** | Spring Boot | 3.5.6 |
| **Language** | Java | 21 |
| **Build Tool** | Maven | 3.x |
| **Database** | MySQL | 8.0 |
| **ORM** | Spring Data JPA | 3.5.6 |
| **Security** | Spring Security + JWT | 3.5.6 |
| **WebSocket** | Spring WebSocket | 3.5.6 |
| **Validation** | Bean Validation | 3.5.6 |
| **Documentation** | Lombok | 1.18.30 |
| **JWT Library** | JJWT | 0.11.5 |

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/infosys/backend/
│   │   │   ├── config/              # Configuration classes
│   │   │   ├── controller/          # REST Controllers
│   │   │   │   ├── AdminLogController.java
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── BookingController.java
│   │   │   │   ├── MessageController.java
│   │   │   │   ├── ReportController.java
│   │   │   │   ├── ReviewController.java
│   │   │   │   ├── ServiceController.java
│   │   │   │   └── UserController.java
│   │   │   ├── dto/                 # Data Transfer Objects
│   │   │   │   ├── AuthResponse.java
│   │   │   │   ├── ErrorResponse.java
│   │   │   │   ├── LoginRequest.java
│   │   │   │   ├── RegisterRequest.java
│   │   │   │   ├── ServiceRequest.java
│   │   │   │   └── ServiceResponse.java
│   │   │   ├── enums/               # Enumerations
│   │   │   │   ├── BookingStatus.java
│   │   │   │   ├── ReportTargetType.java
│   │   │   │   └── Role.java
│   │   │   ├── exception/           # Exception handling
│   │   │   │   └── GlobalExceptionHandler.java
│   │   │   ├── model/               # Entity classes
│   │   │   │   ├── AdminLog.java
│   │   │   │   ├── Booking.java
│   │   │   │   ├── Message.java
│   │   │   │   ├── Report.java
│   │   │   │   ├── Review.java
│   │   │   │   ├── Service.java
│   │   │   │   ├── ServiceProvider.java
│   │   │   │   └── User.java
│   │   │   ├── repository/          # Data access layer
│   │   │   ├── security/            # Security configuration
│   │   │   │   ├── JwtAuthFilter.java
│   │   │   │   ├── JwtUtil.java
│   │   │   │   └── SecurityConfig.java
│   │   │   ├── service/             # Business logic layer
│   │   │   └── BackendApplication.java
│   │   └── resources/
│   │       ├── application.properties
│   │       └── static/
│   │           ├── api-tester.html
│   │           ├── api-tester.js
│   │           └── README.md
│   └── test/                        # Test classes
├── db/
│   ├── schema.sql                   # Database schema
│   └── sample_data.sql              # Sample data
├── pom.xml                          # Maven configuration
├── mvnw                             # Maven wrapper (Unix)
├── mvnw.cmd                         # Maven wrapper (Windows)
└── test-api.ps1                     # API testing script
```

---

## 🗄 Database Schema

### Entity Relationships

| Entity | Primary Key | Key Relationships |
|--------|-------------|-------------------|
| **User** | `id` | One-to-Many with Service, Booking, Review, Message |
| **Service** | `id` | Many-to-One with User (provider) |
| **Booking** | `id` | Many-to-One with User (customer), Service |
| **Review** | `id` | Many-to-One with User (customer), Booking |
| **Message** | `id` | Many-to-One with User (sender, receiver) |
| **Report** | `id` | Many-to-One with User (reporter) |
| **AdminLog** | `id` | Many-to-One with User (admin) |
| **ServiceProvider** | `id` | One-to-One with User |

### User Entity
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `name` | VARCHAR(255) | NOT NULL | User's full name |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | User's email address |
| `password` | VARCHAR(255) | NOT NULL | Encrypted password |
| `role` | ENUM | NOT NULL | CUSTOMER, PROVIDER, ADMIN |
| `location` | VARCHAR(500) | NULL | User's location |
| `created_at` | TIMESTAMP | AUTO_GENERATED | Account creation time |

### Service Entity
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `provider_id` | BIGINT | NOT NULL, FK to User | Service provider |
| `category` | VARCHAR(100) | NOT NULL | Service category |
| `subcategory` | VARCHAR(100) | NULL | Service subcategory |
| `description` | TEXT | NULL | Service description |
| `price` | DECIMAL(8,2) | NULL | Service price |
| `availability` | JSON | NULL | Availability schedule |
| `location` | VARCHAR(500) | NULL | Service location |
| `created_at` | TIMESTAMP | AUTO_GENERATED | Service creation time |

### Booking Entity
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `customer_id` | BIGINT | NOT NULL, FK to User | Customer who booked |
| `service_id` | BIGINT | NOT NULL, FK to Service | Booked service |
| `status` | ENUM | NOT NULL | PENDING, CONFIRMED, COMPLETED, CANCELLED |
| `booking_date` | TIMESTAMP | NOT NULL | When service is scheduled |
| `created_at` | TIMESTAMP | AUTO_GENERATED | Booking creation time |
| `notes` | TEXT | NULL | Additional notes |

### Review Entity
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `customer_id` | BIGINT | NOT NULL, FK to User | Reviewer |
| `booking_id` | BIGINT | NOT NULL, FK to Booking | Associated booking |
| `rating` | INT | NOT NULL, CHECK (1-5) | Rating out of 5 |
| `comment` | TEXT | NULL | Review comment |
| `created_at` | TIMESTAMP | AUTO_GENERATED | Review creation time |

---

## 🔌 API Endpoints

### Authentication Endpoints
| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `POST` | `/api/auth/register` | Register new user | `RegisterRequest` | `AuthResponse` |
| `POST` | `/api/auth/login` | User login | `LoginRequest` | `AuthResponse` |

### User Management Endpoints
| Method | Endpoint | Description | Auth Required | Response |
|--------|----------|-------------|---------------|----------|
| `GET` | `/api/users/all` | Get all users | ✅ Admin | `List<User>` |
| `GET` | `/api/users/providers` | Get all providers | ✅ | `List<User>` |
| `GET` | `/api/users/me` | Get current user | ✅ | `User` |
| `GET` | `/api/users/id/{id}` | Get user by ID | ✅ | `User` |
| `GET` | `/api/users/email/{email}` | Get user by email | ✅ | `User` |
| `PUT` | `/api/users/{id}` | Update user | ✅ | `User` |
| `DELETE` | `/api/users/{id}` | Delete user | ✅ Admin | `ResponseEntity` |

### Service Management Endpoints
| Method | Endpoint | Description | Auth Required | Response |
|--------|----------|-------------|---------------|----------|
| `POST` | `/api/services` | Create service | ✅ Provider | `Service` |
| `GET` | `/api/services` | Get all services | ❌ | `List<Service>` |
| `GET` | `/api/services/provider/{providerId}` | Get services by provider | ❌ | `List<Service>` |
| `PUT` | `/api/services/{id}` | Update service | ✅ Provider | `Service` |
| `DELETE` | `/api/services/{id}` | Delete service | ✅ Provider | `ResponseEntity` |

### Booking Management Endpoints
| Method | Endpoint | Description | Auth Required | Response |
|--------|----------|-------------|---------------|----------|
| `POST` | `/api/bookings` | Create booking | ✅ Customer | `Booking` |
| `GET` | `/api/bookings` | Get user's bookings | ✅ | `List<Booking>` |
| `GET` | `/api/bookings/{id}` | Get booking by ID | ✅ | `Booking` |
| `PUT` | `/api/bookings/{id}` | Update booking | ✅ | `Booking` |
| `DELETE` | `/api/bookings/{id}` | Cancel booking | ✅ | `ResponseEntity` |

### Review Management Endpoints
| Method | Endpoint | Description | Auth Required | Response |
|--------|----------|-------------|---------------|----------|
| `POST` | `/api/reviews` | Create review | ✅ Customer | `Review` |
| `GET` | `/api/reviews` | Get all reviews | ❌ | `List<Review>` |
| `GET` | `/api/reviews/{id}` | Get review by ID | ❌ | `Review` |
| `GET` | `/api/reviews/provider/{providerId}` | Get provider reviews | ❌ | `List<Review>` |
| `GET` | `/api/reviews/customer/{customerId}` | Get customer reviews | ❌ | `List<Review>` |
| `GET` | `/api/reviews/booking/{bookingId}` | Get booking review | ❌ | `Review` |
| `GET` | `/api/reviews/provider/{providerId}/average-rating` | Get average rating | ❌ | `Double` |
| `PUT` | `/api/reviews/{id}` | Update review | ✅ Customer | `Review` |
| `DELETE` | `/api/reviews/{id}` | Delete review | ✅ Customer | `ResponseEntity` |

### Message Management Endpoints
| Method | Endpoint | Description | Auth Required | Response |
|--------|----------|-------------|---------------|----------|
| `POST` | `/api/messages` | Send message | ✅ | `Message` |
| `GET` | `/api/messages/conversation/{userId}` | Get conversation | ✅ | `List<Message>` |
| `GET` | `/api/messages/unread` | Get unread messages | ✅ | `List<Message>` |
| `PUT` | `/api/messages/{id}/read` | Mark as read | ✅ | `ResponseEntity` |

### Report Management Endpoints
| Method | Endpoint | Description | Auth Required | Response |
|--------|----------|-------------|---------------|----------|
| `POST` | `/api/reports` | Create report | ✅ | `Report` |
| `GET` | `/api/reports` | Get all reports | ✅ Admin | `List<Report>` |
| `PUT` | `/api/reports/{id}/resolve` | Resolve report | ✅ Admin | `Report` |

### Admin Endpoints
| Method | Endpoint | Description | Auth Required | Response |
|--------|----------|-------------|---------------|----------|
| `GET` | `/api/admin/logs` | Get admin logs | ✅ Admin | `List<AdminLog>` |
| `POST` | `/api/admin/logs` | Create admin log | ✅ Admin | `AdminLog` |

---

## 🔐 Security Configuration

### JWT Authentication
- **Algorithm**: HS256
- **Secret**: Configurable via properties
- **Expiration**: 1 hour (configurable)
- **Header**: `Authorization: Bearer <token>`

### Role-Based Access Control
| Role | Permissions |
|------|-------------|
| **CUSTOMER** | Book services, create reviews, send messages |
| **PROVIDER** | Manage services, accept bookings, send messages |
| **ADMIN** | Full system access, user management, reports |

### Security Headers
- CORS enabled for frontend communication
- CSRF protection disabled for API endpoints
- JWT validation on protected endpoints

### Password Security
- BCrypt encryption with salt rounds
- Minimum password requirements (configurable)

---

## ⚙️ Configuration Properties

### Database Configuration
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/fixitnow?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=Jakhetia@156
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
```

### Server Configuration
```properties
server.port=8081
spring.application.name=backend
```

### JPA Configuration
```properties
spring.jpa.generate-ddl=true
spring.jpa.show-sql=true
```

### Logging Configuration
```properties
logging.level.org.springframework.web=DEBUG
logging.level.org.hibernate.SQL=DEBUG
```

---

## 🏗 Build & Deployment

### Prerequisites
- Java 21 or higher
- Maven 3.6 or higher
- MySQL 8.0 or higher

### Build Commands
```bash
# Clean and compile
./mvnw clean compile

# Run tests
./mvnw test

# Package application
./mvnw clean package

# Run application
./mvnw spring-boot:run

# Or run JAR directly
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

### Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `DB_URL` | Database connection URL | `localhost:3306/fixitnow` |
| `DB_USERNAME` | Database username | `root` |
| `DB_PASSWORD` | Database password | `Jakhetia@156` |
| `JWT_SECRET` | JWT signing secret | Generated |
| `SERVER_PORT` | Application port | `8081` |

### Docker Support
```dockerfile
FROM openjdk:21-jre-slim
COPY target/backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

---

## 🚨 Error Handling

### Error Response Format
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed for field 'email'",
  "path": "/api/auth/register",
  "timestamp": "2025-10-04T10:30:00"
}
```

### HTTP Status Codes
| Code | Description | Usage |
|------|-------------|-------|
| `200` | OK | Successful GET, PUT requests |
| `201` | Created | Successful POST requests |
| `400` | Bad Request | Validation errors, malformed requests |
| `401` | Unauthorized | Authentication required |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource not found |
| `409` | Conflict | Duplicate resource (email exists) |
| `500` | Internal Server Error | Unexpected server errors |

### Exception Types
- **ValidationException**: Input validation failures
- **UserNotFoundException**: User lookup failures
- **DuplicateResourceException**: Resource conflicts
- **UnauthorizedException**: Authentication failures
- **ForbiddenException**: Authorization failures

---

## 🧪 Testing

### Test Structure
```
src/test/java/
├── infosys/backend/
│   ├── controller/          # Controller tests
│   ├── service/             # Service layer tests
│   ├── repository/          # Repository tests
│   └── integration/         # Integration tests
```

### Test Categories
- **Unit Tests**: Individual component testing
- **Integration Tests**: Full application flow testing
- **Security Tests**: Authentication and authorization testing
- **API Tests**: REST endpoint testing

### Running Tests
```bash
# Run all tests
./mvnw test

# Run specific test class
./mvnw test -Dtest=AuthControllerTest

# Run with coverage
./mvnw test jacoco:report
```

### Test Data
- Sample data available in `/db/sample_data.sql`
- Test profiles for different environments
- Mock data for unit testing

---

## 📊 API Testing Tools

### Built-in API Tester
- Location: `/src/main/resources/static/api-tester.html`
- Interactive web interface for testing endpoints
- JWT token management
- Request/response visualization

### PowerShell Testing Script
- Location: `/test-api.ps1`
- Automated API testing
- Environment setup
- Bulk operation testing

---

## 🔄 Development Workflow

### Git Branches
- `main`: Production-ready code
- `develop`: Development integration
- `feature/*`: Feature development
- `hotfix/*`: Production fixes

### Code Standards
- Java naming conventions
- Lombok for boilerplate reduction
- Comprehensive logging
- Input validation
- Error handling

### Dependencies Management
- Maven for dependency management
- Version management in `pom.xml`
- Security vulnerability scanning
- Regular dependency updates

---

## 📈 Performance Considerations

### Database Optimization
- Indexed columns for frequent queries
- Connection pooling
- Query optimization
- Lazy loading for relationships

### Caching Strategy
- JWT token caching
- User session caching
- Service data caching
- Database query caching

### Security Measures
- Rate limiting (recommended)
- Input sanitization
- SQL injection prevention
- XSS protection

---

## 📝 Additional Notes

### Known Limitations
- No email verification system
- Basic error handling in some areas
- Limited rate limiting
- No file upload functionality

### Future Enhancements
- Email notification system
- File upload for service images
- Advanced search and filtering
- Real-time notifications
- Payment integration
- Mobile app support

### Support & Maintenance
- Regular security updates
- Database maintenance scripts
- Performance monitoring
- Log analysis tools

---

**Last Updated**: October 4, 2025  
**Version**: 0.0.1-SNAPSHOT  
**Author**: Infosys Development Team