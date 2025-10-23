package infosys.backend.controller;

<<<<<<< HEAD

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

=======
>>>>>>> bc6283a1b8465728100111aba7f88dc8bdddce84
import infosys.backend.enums.BookingStatus;
import infosys.backend.model.Booking;
import infosys.backend.model.User;
import infosys.backend.service.BookingService;
import infosys.backend.service.UserService;
<<<<<<< HEAD
=======
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
>>>>>>> bc6283a1b8465728100111aba7f88dc8bdddce84

import java.util.List;

@RestController
<<<<<<< HEAD
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private UserService userService;

    // Create a new booking
     @PreAuthorize("hasRole('CUSTOMER')")
=======
@RequestMapping("/bookings")
@RequiredArgsConstructor // ✅ Removes need for manual @Autowired
public class BookingController {

    private final BookingService bookingService;
    private final UserService userService;

    /**
     * ✅ Create a new booking (Only Customers)
     */
    @PreAuthorize("hasRole('CUSTOMER')")
>>>>>>> bc6283a1b8465728100111aba7f88dc8bdddce84
    @PostMapping("/create")
    public Booking createBooking(@RequestBody Booking booking) {
        return bookingService.createBooking(booking);
    }

<<<<<<< HEAD
    // Get all bookings for a customer
=======
    /**
     * ✅ Get all bookings made by a specific customer (Customer/Admin)
     */
>>>>>>> bc6283a1b8465728100111aba7f88dc8bdddce84
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    @GetMapping("/customer/{customerId}")
    public List<Booking> getCustomerBookings(@PathVariable Long customerId) {
        User customer = userService.getUserById(customerId);
        return bookingService.getBookingsByCustomer(customer);
    }

<<<<<<< HEAD
    // Get all bookings for a provider
=======
    /**
     * ✅ Get all bookings for a provider (Provider/Admin)
     */
>>>>>>> bc6283a1b8465728100111aba7f88dc8bdddce84
    @PreAuthorize("hasRole('PROVIDER') or hasRole('ADMIN')")
    @GetMapping("/provider/{providerId}")
    public List<Booking> getProviderBookings(@PathVariable Long providerId) {
        User provider = userService.getUserById(providerId);
        return bookingService.getBookingsByProvider(provider);
    }

<<<<<<< HEAD
    // Update booking status
     @PreAuthorize("hasRole('PROVIDER') or hasRole('ADMIN')")
=======
    /**
     * ✅ Update booking status (Provider/Admin)
     */
    @PreAuthorize("hasRole('PROVIDER') or hasRole('ADMIN')")
>>>>>>> bc6283a1b8465728100111aba7f88dc8bdddce84
    @PutMapping("/updateStatus/{bookingId}")
    public Booking updateBookingStatus(@PathVariable Long bookingId,
                                       @RequestParam BookingStatus status) {
        return bookingService.updateBookingStatus(bookingId, status);
    }
<<<<<<< HEAD

    // ✅ Get all bookings (Admin only)
@PreAuthorize("hasRole('ADMIN')")
@GetMapping("/all")
public List<Booking> getAllBookings() {
    return bookingService.getAllBookings();
}

=======
>>>>>>> bc6283a1b8465728100111aba7f88dc8bdddce84
}
