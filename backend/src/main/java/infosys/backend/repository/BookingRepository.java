package infosys.backend.repository;

import infosys.backend.model.Booking;
import infosys.backend.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    List<Booking> findByCustomerId(Long customerId);
    
    List<Booking> findByProviderId(Long providerId);
    
    List<Booking> findByServiceId(Long serviceId);
    
    List<Booking> findByStatus(BookingStatus status);
    
    List<Booking> findByBookingDate(LocalDate bookingDate);
    
    @Query("SELECT b FROM Booking b WHERE b.customerId = :customerId AND b.status = :status")
    List<Booking> findByCustomerIdAndStatus(@Param("customerId") Long customerId, @Param("status") BookingStatus status);
    
    @Query("SELECT b FROM Booking b WHERE b.providerId = :providerId AND b.status = :status")
    List<Booking> findByProviderIdAndStatus(@Param("providerId") Long providerId, @Param("status") BookingStatus status);
}