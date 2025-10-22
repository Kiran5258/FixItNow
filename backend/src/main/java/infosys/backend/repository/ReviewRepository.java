package infosys.backend.repository;

import infosys.backend.model.Review;
import infosys.backend.model.ServiceProvider;
import infosys.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

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
}
