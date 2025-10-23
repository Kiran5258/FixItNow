package infosys.backend.repository;

import infosys.backend.model.Review;
import infosys.backend.model.ServiceProvider;
import infosys.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
<<<<<<< HEAD
=======
import org.springframework.stereotype.Repository;
>>>>>>> bc6283a1b8465728100111aba7f88dc8bdddce84
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

<<<<<<< HEAD
=======
@Repository
>>>>>>> bc6283a1b8465728100111aba7f88dc8bdddce84
public interface ReviewRepository extends JpaRepository<Review, Long> {

    // ✅ Find all reviews for a specific provider
    List<Review> findByProvider(User provider);

    // ✅ Find all reviews written by a specific customer
    List<Review> findByCustomer(User customer);

    // ✅ Find all reviews for a specific service
    List<Review> findByService(ServiceProvider service);

    // ✅ Find average rating for a specific provider using JPQL
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.provider.id = :providerId")
    Double findAverageRatingByProviderId(@Param("providerId") Long providerId);

    // ✅ Find average rating for a specific service using JPQL
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.service.id = :serviceId")
    Double findAverageRatingByServiceId(@Param("serviceId") Long serviceId);

<<<<<<< HEAD
     @Modifying
    @Transactional
    @Query("DELETE FROM Review r WHERE r.service.id = :serviceId")
    void deleteByServiceId(@Param("serviceId") Long serviceId);
    @Transactional
@Modifying
@Query("DELETE FROM Review r WHERE r.customer.id = :userId")
void deleteByCustomerId(@Param("userId") Long userId);

@Transactional
@Modifying
@Query("DELETE FROM Review r WHERE r.provider.id = :userId")
void deleteByProviderId(@Param("userId") Long userId);

=======
    // ✅ Delete all reviews for a specific service
    @Modifying
    @Transactional
    @Query("DELETE FROM Review r WHERE r.service.id = :serviceId")
    void deleteByServiceId(@Param("serviceId") Long serviceId);

    // ✅ Delete all reviews written by a specific customer
    @Modifying
    @Transactional
    @Query("DELETE FROM Review r WHERE r.customer.id = :userId")
    void deleteByCustomerId(@Param("userId") Long userId);

    // ✅ Delete all reviews for services owned by a specific provider
    @Modifying
    @Transactional
    @Query("DELETE FROM Review r WHERE r.provider.id = :userId")
    void deleteByProviderId(@Param("userId") Long userId);
>>>>>>> bc6283a1b8465728100111aba7f88dc8bdddce84
}
