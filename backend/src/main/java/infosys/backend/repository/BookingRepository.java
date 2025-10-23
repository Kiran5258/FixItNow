package infosys.backend.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import infosys.backend.model.Booking;
import infosys.backend.model.User;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByCustomer(User customer);
    List<Booking> findByProvider(User provider);
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


}
