package infosys.backend.repository;

import infosys.backend.model.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {
    
    List<Service> findByProviderId(Long providerId);
    
    List<Service> findByCategory(String category);
    
    List<Service> findByCategoryAndSubcategory(String category, String subcategory);
    
    @Query("SELECT s FROM Service s WHERE s.location LIKE %:location%")
    List<Service> findByLocationContaining(@Param("location") String location);
    
    @Query("SELECT s FROM Service s WHERE s.category = :category AND s.location LIKE %:location%")
    List<Service> findByCategoryAndLocationContaining(@Param("category") String category, @Param("location") String location);
}
