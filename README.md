# FixItNow - On-Demand Local Service Booking Platform
FixItNow is a modern, responsive, on-demand local services platform connecting customers with professional service providers (plumbers, electricians, cleaners, etc.). It features user authentication, a service booking workflow, real-time messaging, document verification for service providers, and an admin analytics dashboard.
---
## 🏗️ Architecture & Tech Stack
The application is split into a React-based single-page application frontend and a Spring Boot-based REST API backend.
### Frontend
* **Core**: React 19 (JSX) + Vite 7 (for fast bundling and HMR)
* **Styling**: Tailwind CSS v4 for clean, modern, utility-first styling
* **Routing**: React Router Dom v7
* **Animations**: Framer Motion
* **Maps & Geolocation**: Leaflet & React Leaflet (plus Google Maps API integration)
* **Real-time Messaging**: SocketJS & STOMP Client (`@stomp/stompjs`) for WebSockets
* **Charts & Analytics**: Recharts
* **PDF Reports**: jsPDF & jsPDF-AutoTable (for generating invoices/booking summaries)
### Backend
* **Core Framework**: Spring Boot 3.5.6
* **Java Version**: Java 21
* **Database & ORM**: MySQL & Spring Data JPA (Hibernate)
* **Security & Auth**: Spring Security + JWT (JSON Web Tokens)
* **Real-time Communication**: Spring Boot WebSocket Message Broker
* **Utility**: Lombok (for reducing boilerplate code)
---
## 🗄️ Database Model (Entities)
The database contains the following main tables/entities managed via Hibernate:
1. **`User`**: System users (Customers and Admins) with role-based access.
2. **`ServiceProvider`**: Specialized details for service providers (service category, pricing, availability, and rating).
3. **`Document`**: Verification files uploaded by service providers (IDs, licenses) for admin approval.
4. **`Booking`**: Appointment tracking (status: `PENDING`, `ACCEPTED`, `COMPLETED`, `CANCELLED`).
5. **`Message` & `ChatNotification`**: Chat history and notification flags for real-time messaging.
6. **`Review`**: Customer reviews and star ratings for service providers.
7. **`Report`**: User/Provider complaints or issue reporting.
8. **`AdminLog`**: Audit logs of admin activities.
---
## 🚀 Setup & Execution Guide
### Prerequisites
Make sure you have the following installed:
* **Node.js** (v18+)
* **Java Development Kit (JDK)** (v21)
* **Maven** (v3.9+)
* **MySQL Server** running locally
---
### 1. Database Configuration
1. Open your MySQL client and ensure you have a database named `FixItNow` (the backend configuration will automatically create it if it doesn't exist, provided the user has permissions).
2. The backend is configured to use the following credentials by default:
   * **URL**: `jdbc:mysql://localhost:3306/FixItNow`
   * **Username**: `root`
   * **Password**: `root`
   * *To update these, edit [backend/src/main/resources/application.properties](file:///e:/FixItNow/backend/src/main/resources/application.properties)*.
---
### 2. Running the Backend (Spring Boot)
Open a terminal in the `./backend` directory and run:
```bash
# Clean and build the application
mvn clean install
# Start the Spring Boot server
mvn spring-boot:run
```
The server will start running on **`http://localhost:8080`**.
---
### 3. Running the Frontend (React + Vite)
Open a terminal in the `./FrontEnd` directory and run:
```bash
# Install dependencies
npm install
# Start the development server
npm run dev
```
The frontend dev server will launch (typically at **`http://localhost:5173`** or similar).
---
## 📂 Project Structure
```
FixItNow/
├── backend/                   # Spring Boot backend source code
│   ├── src/main/java/         # Java source packages (controller, service, model, repo)
│   ├── src/main/resources/    # Application configurations and properties
│   └── pom.xml                # Maven dependencies and build configuration
│
├── FrontEnd/                  # React Vite frontend source code
│   ├── src/
│   │   ├── components/        # Shared components (buttons, cards, forms)
│   │   ├── pages/             # App views (Auth, Customer, Provider, Admin Dashboard)
│   │   ├── context/           # React context (Auth, WebSocket settings)
│   │   ├── services/          # API calling and WebSocket service layer
│   │   ├── index.css          # Tailwind and global styles
│   │   └── App.jsx            # Routing and core layout
│   └── package.json           # Frontend dependencies and npm scripts
│
└── uploads/                   # Local storage directory for uploaded documents/images
```
---
## 🛡️ Security & Authentication
All secure routes are protected via JWT. When a user logs in, they receive a JWT token, which must be attached to the `Authorization: Bearer <token>` header of subsequent HTTP requests. Role-based endpoint authorization (`ROLE_CUSTOMER`, `ROLE_PROVIDER`, `ROLE_ADMIN`) is handled by Spring Security.

## Documentation 
google drive link: https://drive.google.com/drive/folders/18PM4CaV7wgzki8L69XPp-OdZHZ_SsrUj?usp=sharing

## Live Deployment
Frontend: https://fixitnow-frontend.onrender.com
