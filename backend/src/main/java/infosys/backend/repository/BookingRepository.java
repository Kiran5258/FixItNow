package infosys.backend.repository;

<<<<<<< HEAD

=======
>>>>>>> bc6283a1b8465728100111aba7f88dc8bdddce84
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import infosys.backend.model.Booking;
import infosys.backend.model.User;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
<<<<<<< HEAD
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


=======

    List<Booking> findByCustomer(User customer);
    List<Booking> findByProvider(User provider);

    @Modifying
    @Transactional
    @Query("DELETE FROM Booking b WHERE b.service.id = :serviceId")
    void deleteByServiceId(@Param("serviceId") Long serviceId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Booking b WHERE b.customer.id = :userId")
    void deleteByCustomerId(@Param("userId") Long userId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Booking b WHERE b.provider.id = :userId")
    void deleteByProviderId(@Param("userId") Long userId);
>>>>>>> bc6283a1b8465728100111aba7f88dc8bdddce84
}
