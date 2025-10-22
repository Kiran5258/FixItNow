package infosys.backend.controller;

import infosys.backend.enums.BookingStatus;
import infosys.backend.model.Booking;
import infosys.backend.model.User;
import infosys.backend.service.BookingService;
import infosys.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor // ✅ Removes need for manual @Autowired
public class BookingController {

    private final BookingService bookingService;
    private final UserService userService;

    /**
     * ✅ Create a new booking (Only Customers)
     */
    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping("/create")
    public Booking createBooking(@RequestBody Booking booking) {
        return bookingService.createBooking(booking);
    }

    /**
     * ✅ Get all bookings made by a specific customer (Customer/Admin)
     */
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    @GetMapping("/customer/{customerId}")
    public List<Booking> getCustomerBookings(@PathVariable Long customerId) {
        User customer = userService.getUserById(customerId);
        return bookingService.getBookingsByCustomer(customer);
    }

    /**
     * ✅ Get all bookings for a provider (Provider/Admin)
     */
    @PreAuthorize("hasRole('PROVIDER') or hasRole('ADMIN')")
    @GetMapping("/provider/{providerId}")
    public List<Booking> getProviderBookings(@PathVariable Long providerId) {
        User provider = userService.getUserById(providerId);
        return bookingService.getBookingsByProvider(provider);
    }

    /**
     * ✅ Update booking status (Provider/Admin)
     */
    @PreAuthorize("hasRole('PROVIDER') or hasRole('ADMIN')")
    @PutMapping("/updateStatus/{bookingId}")
    public Booking updateBookingStatus(@PathVariable Long bookingId,
                                       @RequestParam BookingStatus status) {
        return bookingService.updateBookingStatus(bookingId, status);
    }
}
