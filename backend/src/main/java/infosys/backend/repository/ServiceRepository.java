package infosys.backend.repository;

import infosys.backend.model.ServiceProvider;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceRepository extends JpaRepository<ServiceProvider, Long> {

    // Find all services by category
    List<ServiceProvider> findByCategory(String category);

    // Find all services by provider
    List<ServiceProvider> findByProviderId(Long providerId);
}
