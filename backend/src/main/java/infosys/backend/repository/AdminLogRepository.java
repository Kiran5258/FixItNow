package infosys.backend.repository;

import infosys.backend.model.AdminLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AdminLogRepository extends JpaRepository<AdminLog, Long> {
    
    List<AdminLog> findByAdminId(Long adminId);
    
    List<AdminLog> findByTargetType(String targetType);
    
    List<AdminLog> findByTargetTypeAndTargetId(String targetType, Long targetId);
    
    @Query("SELECT al FROM AdminLog al WHERE al.timestamp BETWEEN :startDate AND :endDate ORDER BY al.timestamp DESC")
    List<AdminLog> findByTimestampBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}