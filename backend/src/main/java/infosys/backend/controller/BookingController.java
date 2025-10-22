package infosys.backend.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import infosys.backend.enums.BookingStatus;
import infosys.backend.model.Booking;
import infosys.backend.model.User;
import infosys.backend.service.BookingService;
import infosys.backend.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private UserService userService;

    // Create a new booking
     @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping("/create")
    public Booking createBooking(@RequestBody Booking booking) {
        return bookingService.createBooking(booking);
    }

    // Get all bookings for a customer
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    @GetMapping("/customer/{customerId}")
    public List<Booking> getCustomerBookings(@PathVariable Long customerId) {
        User customer = userService.getUserById(customerId);
        return bookingService.getBookingsByCustomer(customer);
    }

    // Get all bookings for a provider
    @PreAuthorize("hasRole('PROVIDER') or hasRole('ADMIN')")
    @GetMapping("/provider/{providerId}")
    public List<Booking> getProviderBookings(@PathVariable Long providerId) {
        User provider = userService.getUserById(providerId);
        return bookingService.getBookingsByProvider(provider);
    }

    // Update booking status
     @PreAuthorize("hasRole('PROVIDER') or hasRole('ADMIN')")
    @PutMapping("/updateStatus/{bookingId}")
    public Booking updateBookingStatus(@PathVariable Long bookingId,
                                       @RequestParam BookingStatus status) {
        return bookingService.updateBookingStatus(bookingId, status);
    }

    // ✅ Get all bookings (Admin only)
@PreAuthorize("hasRole('ADMIN')")
@GetMapping("/all")
public List<Booking> getAllBookings() {
    return bookingService.getAllBookings();
}

}
