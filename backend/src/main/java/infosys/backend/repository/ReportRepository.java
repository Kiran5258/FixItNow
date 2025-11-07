package infosys.backend.repository;

import infosys.backend.model.Report;
import infosys.backend.enums.TargetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByTargetType(TargetType targetType);
    List<Report> findByStatus(String status);
    List<Report> findByReportedById(Long userId);
    void deleteByReportedById(Long userId);
    void deleteByTargetId(Long targetId);
}
