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
    
    // Find by admin and date range
    @Query("SELECT al FROM AdminLog al WHERE al.adminId = :adminId AND al.timestamp BETWEEN :startDate AND :endDate ORDER BY al.timestamp DESC")
    List<AdminLog> findByAdminIdAndTimestampBetween(@Param("adminId") Long adminId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Get recent logs (top N)
    @Query("SELECT al FROM AdminLog al ORDER BY al.timestamp DESC LIMIT :limit")
    List<AdminLog> findTopByOrderByTimestampDesc(@Param("limit") int limit);
    
    // Get recent logs by admin
    @Query("SELECT al FROM AdminLog al WHERE al.adminId = :adminId ORDER BY al.timestamp DESC LIMIT :limit")
    List<AdminLog> findTopByAdminIdOrderByTimestampDesc(@Param("adminId") Long adminId, @Param("limit") int limit);
    
    // Count operations
    long countByAdminId(Long adminId);
    
    long countByActionContaining(String action);
}