package infosys.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import infosys.backend.enums.BookingStatus;
import infosys.backend.model.Booking;
import infosys.backend.model.User;
import infosys.backend.repository.BookingRepository;

import java.util.List;

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

    // Update booking status
    public Booking updateBookingStatus(Long bookingId, BookingStatus status) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setStatus(status);
        return bookingRepository.save(booking);
    }
<<<<<<< HEAD

    public List<Booking> getAllBookings() {
    return bookingRepository.findAll();
}

=======
>>>>>>> bc6283a1b8465728100111aba7f88dc8bdddce84
}
