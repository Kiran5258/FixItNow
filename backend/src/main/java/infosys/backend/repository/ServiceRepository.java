package infosys.backend.repository;

import infosys.backend.model.ServiceProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

public interface ServiceRepository extends JpaRepository<ServiceProvider, Long> {

    // Find all services by category
    List<ServiceProvider> findByCategory(String category);

    // Find all services by provider
    List<ServiceProvider> findByProviderId(Long providerId);

    @Transactional
@Modifying
@Query("DELETE FROM ServiceProvider s WHERE s.provider.id = :userId")
void deleteByProviderId(@Param("userId") Long userId);
@Query("SELECT s.location AS location, COUNT(b.id) AS bookingCount " +
           "FROM Booking b JOIN b.service s " +
           "GROUP BY s.location ORDER BY bookingCount DESC")
    List<Map<String, Object>> findBookingsByLocation();
    
}
