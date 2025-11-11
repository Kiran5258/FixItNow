package infosys.backend.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import infosys.backend.enums.BookingStatus;
import infosys.backend.enums.Role;
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

    
@PreAuthorize("hasRole('CUSTOMER') or hasRole('PROVIDER') or hasRole('ADMIN')")
@GetMapping("/all")
public List<Booking> getAllBookings() {
    return bookingService.getAllBookings();
}

@PreAuthorize("hasRole('PROVIDER')")
@PostMapping("/{bookingId}/markComplete")
public Booking markBookingCompleteByProvider(@PathVariable Long bookingId) {
    return bookingService.markCompleteByProvider(bookingId);
}

// Customer verifies booking completion
@PreAuthorize("hasRole('CUSTOMER')")
@PostMapping("/{bookingId}/verify")
public Booking verifyBookingByCustomer(@PathVariable Long bookingId) {
    return bookingService.verifyByCustomer(bookingId);
}

// Get a single booking by ID (customer can only see their own bookings, provider/admin can see theirs)
@PreAuthorize("hasRole('CUSTOMER') or hasRole('PROVIDER') or hasRole('ADMIN')")
@GetMapping("/{bookingId}")
public Booking getBookingById(@PathVariable Long bookingId, @AuthenticationPrincipal User user) {
    Booking booking = bookingService.getBookingById(bookingId);

    // Customer can only access their own booking
    if (user.getRole() == Role.CUSTOMER && !booking.getCustomer().getId().equals(user.getId())) {
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
    }

    // Provider can only access their own bookings
    if (user.getRole() == Role.PROVIDER && !booking.getProvider().getId().equals(user.getId())) {
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
    }

    return booking;
}


}
