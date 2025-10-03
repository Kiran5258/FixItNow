package infosys.backend.repository;

import infosys.backend.model.Report;
import infosys.backend.enums.ReportTargetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    
    List<Report> findByReportedBy(Long reportedBy);
    
    List<Report> findByTargetType(ReportTargetType targetType);
    
    List<Report> findByTargetTypeAndTargetId(ReportTargetType targetType, Long targetId);
    
    // Check if user already reported a specific target
    boolean existsByReportedByAndTargetTypeAndTargetId(Long reportedBy, ReportTargetType targetType, Long targetId);
    
    // Count reports for a specific target
    long countByTargetTypeAndTargetId(ReportTargetType targetType, Long targetId);
}