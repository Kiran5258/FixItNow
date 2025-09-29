package infosys.backend.repository;

import infosys.backend.model.ProviderProfile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProviderProfileRepository extends JpaRepository<ProviderProfile, Long> {
    ProviderProfile findByUserId(Long userId);
}
