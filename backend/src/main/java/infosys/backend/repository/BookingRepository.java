package infosys.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import infosys.backend.model.Booking;
import infosys.backend.model.User;
import infosys.backend.enums.BookingStatus;

import java.util.List;
import java.util.Map;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByCustomer(User customer);
    List<Booking> findByProvider(User provider);

    @Transactional
    @Modifying
    @Query("DELETE FROM Booking b WHERE b.service.id = :serviceId")
    void deleteByServiceId(@Param("serviceId") Long serviceId);

    @Transactional
    @Modifying
    @Query("DELETE FROM Booking b WHERE b.customer.id = :userId")
    void deleteByCustomerId(@Param("userId") Long userId);

    @Transactional
    @Modifying
    @Query("DELETE FROM Booking b WHERE b.provider.id = :userId")
    void deleteByProviderId(@Param("userId") Long userId);

    // ✅ Count bookings by status (used in analytics summary)
    long countByStatus(BookingStatus status);

    // ✅ Monthly bookings (for line/bar chart)
    @Query("SELECT FUNCTION('MONTHNAME', b.createdAt) AS month, COUNT(b.id) AS count " +
           "FROM Booking b GROUP BY FUNCTION('MONTHNAME', b.createdAt) ORDER BY MIN(b.createdAt)")
    List<Map<String, Object>> findBookingsPerMonth();

    // ✅ Top providers by number of bookings
    @Query("SELECT b.provider.name AS provider, COUNT(b.id) AS totalBookings " +
           "FROM Booking b GROUP BY b.provider.name " +
           "ORDER BY COUNT(b.id) DESC")
    List<Map<String, Object>> findTopProviders();

    // ✅ Top service categories by bookings
    @Query("SELECT s.category AS category, COUNT(b.id) AS totalBookings " +
           "FROM Booking b JOIN b.service s " +
           "GROUP BY s.category ORDER BY COUNT(b.id) DESC")
    List<Map<String, Object>> findTopServices();
}
