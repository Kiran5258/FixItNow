--Sample Data for FixItNow Application
USE fixitnow;

-- USERS
INSERT INTO users (name, email, password, role, location)
VALUES
('Aarav Sharma', 'aarav.sharma@example.com', 'hashed_pw_aarav', 'CUSTOMER', 'Mumbai'),
('Priya Singh', 'priya.singh@example.com', 'hashed_pw_priya', 'PROVIDER', 'Delhi'),
('Sanchit Jakhetia', 'sanchitjakhetia@gmail.com', 'hashed_pw_sanchit', 'ADMIN', 'Noida'),
('Rohan Verma', 'rohan.verma@example.com', 'hashed_pw_rohan', 'CUSTOMER', 'Chennai'),
('Neha Kapoor', 'neha.kapoor@example.com', 'hashed_pw_neha', 'PROVIDER', 'Hyderabad');

-- SERVICES
INSERT INTO services (provider_id, category, subcategory, description, price, availability, location)
VALUES
(2, 'Plumbing', 'Leak Repair', 'Fixes kitchen and bathroom leaks', 500.00,
 '{"mon":"09:00-17:00","tue":"09:00-17:00","wed":"off","thu":"12:00-18:00","fri":"09:00-17:00"}',
 'Delhi'),
(5, 'Electrical', 'Wiring', 'Fixing home electrical wiring issues', 700.00,
 '{"mon":"10:00-18:00","tue":"10:00-18:00","wed":"10:00-18:00","thu":"off","fri":"10:00-18:00"}',
 'Hyderabad');

-- BOOKINGS
INSERT INTO bookings (service_id, customer_id, provider_id, booking_date, time_slot, status)
VALUES
(1, 1, 2, '2025-09-30', '10:00-11:00', 'PENDING'),
(2, 4, 5, '2025-10-01', '14:00-15:00', 'CONFIRMED');

-- REVIEWS
INSERT INTO reviews (booking_id, customer_id, provider_id, rating, comment)
VALUES
(2, 4, 5, 5, 'Excellent service, very professional!');

-- MESSAGES
INSERT INTO messages (sender_id, receiver_id, content)
VALUES
(1, 2, 'Hi Priya, I would like to confirm my booking for Sept 30.'),
(2, 1, 'Hi Aarav, your booking is confirmed.'),
(4, 5, 'Hello Neha, booking confirmed for tomorrow.'),
(5, 4, 'Thanks Rohan, I will be there on time.');

-- REPORTS
INSERT INTO reports (target_type, target_id, reported_by, reason)
VALUES
('BOOKING', 1, 1, 'Service was delayed');

-- ADMIN LOGS
INSERT INTO admin_logs (admin_id, action, target_id, target_type)
VALUES
(3, 'Verified Provider Priya Singh', 2, 'PROVIDER'),
(3, 'Suspended user with ID 1', 1, 'CUSTOMER');