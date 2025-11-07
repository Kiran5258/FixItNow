package infosys.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import infosys.backend.enums.BookingStatus;
import infosys.backend.model.Booking;
import infosys.backend.model.User;
import infosys.backend.repository.BookingRepository;

import java.util.List;
import java.util.Optional;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    // Create a new booking
    public Booking createBooking(Booking booking) {
        return bookingRepository.save(booking);
    }

    // Get bookings by customer
    public List<Booking> getBookingsByCustomer(User customer) {
        return bookingRepository.findByCustomer(customer);
    }

    // Get bookings by provider
    public List<Booking> getBookingsByProvider(User provider) {
        return bookingRepository.findByProvider(provider);
    }

    // Get a single booking by ID
    public Booking getBookingById(Long bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
    }

    // Update booking status
    public Booking updateBookingStatus(Long bookingId, BookingStatus status) {
        Booking booking = getBookingById(bookingId);
        booking.setStatus(status);
        return bookingRepository.save(booking);
    }

    // Get all bookings
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    // Provider marks booking complete
    public Booking markCompleteByProvider(Long bookingId) {
        Booking booking = getBookingById(bookingId);
        booking.setProviderMarkedComplete(true);

        // If customer already verified, mark status COMPLETED
        if (Boolean.TRUE.equals(booking.getCustomerVerified())) {
            booking.setStatus(BookingStatus.COMPLETED);
        }

        return bookingRepository.save(booking);
    }

    // Customer verifies booking completion
    public Booking verifyByCustomer(Long bookingId) {
        Booking booking = getBookingById(bookingId);
        booking.setCustomerVerified(true);

        // Only mark COMPLETED if provider already marked complete
        if (Boolean.TRUE.equals(booking.getProviderMarkedComplete())) {
            booking.setStatus(BookingStatus.COMPLETED);
        }

        return bookingRepository.save(booking);
    }
}
