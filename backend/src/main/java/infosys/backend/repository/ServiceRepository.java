package infosys.backend.repository;

import infosys.backend.model.ServiceProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface ServiceRepository extends JpaRepository<ServiceProvider, Long> {

    // Find all services by category
    List<ServiceProvider> findByCategory(String category);

<<<<<<< HEAD
    // Find all services by provider
    List<ServiceProvider> findByProviderId(Long providerId);

    @Transactional
@Modifying
@Query("DELETE FROM ServiceProvider s WHERE s.provider.id = :userId")
void deleteByProviderId(@Param("userId") Long userId);

    
=======
    // Find all services by provider ID
    List<ServiceProvider> findByProviderId(Long providerId);

    // Delete all services of a specific provider
    @Modifying
    @Transactional
    @Query("DELETE FROM ServiceProvider s WHERE s.provider.id = :userId")
    void deleteByProviderId(@Param("userId") Long userId);
>>>>>>> bc6283a1b8465728100111aba7f88dc8bdddce84
}
