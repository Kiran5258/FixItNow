package infosys.backend.service;

import infosys.backend.model.AdminLog;
import infosys.backend.repository.AdminLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AdminLogService {

    private final AdminLogRepository adminLogRepository;

    /**
     * Create a new admin log entry
     */
    public AdminLog createLog(AdminLog adminLog) {
        return adminLogRepository.save(adminLog);
    }

    /**
     * Log an admin action (convenience method)
     */
    public AdminLog logAction(Long adminId, String action, Long targetId, String targetType) {
        AdminLog log = AdminLog.builder()
                .adminId(adminId)
                .action(action)
                .targetId(targetId)
                .targetType(targetType)
                .build();
        return adminLogRepository.save(log);
    }

    /**
     * Log an admin action without target (convenience method)
     */
    public AdminLog logAction(Long adminId, String action) {
        return logAction(adminId, action, null, null);
    }

    /**
     * Get all admin logs
     */
    public List<AdminLog> getAllLogs() {
        return adminLogRepository.findAll();
    }

    /**
     * Get admin log by ID
     */
    public Optional<AdminLog> getLogById(Long id) {
        return adminLogRepository.findById(id);
    }

    /**
     * Get logs by admin ID
     */
    public List<AdminLog> getLogsByAdminId(Long adminId) {
        return adminLogRepository.findByAdminId(adminId);
    }

    /**
     * Get logs by target type and target ID
     */
    public List<AdminLog> getLogsByTarget(String targetType, Long targetId) {
        return adminLogRepository.findByTargetTypeAndTargetId(targetType, targetId);
    }

    /**
     * Get logs by target type only
     */
    public List<AdminLog> getLogsByTargetType(String targetType) {
        return adminLogRepository.findByTargetType(targetType);
    }

    /**
     * Get logs within a date range
     */
    public List<AdminLog> getLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return adminLogRepository.findByTimestampBetween(startDate, endDate);
    }

    /**
     * Get logs by admin and date range
     */
    public List<AdminLog> getLogsByAdminAndDateRange(Long adminId, LocalDateTime startDate, LocalDateTime endDate) {
        return adminLogRepository.findByAdminIdAndTimestampBetween(adminId, startDate, endDate);
    }

    /**
     * Get recent logs (last N entries)
     */
    public List<AdminLog> getRecentLogs(int limit) {
        return adminLogRepository.findTopByOrderByTimestampDesc(limit);
    }

    /**
     * Get recent logs by admin
     */
    public List<AdminLog> getRecentLogsByAdmin(Long adminId, int limit) {
        return adminLogRepository.findTopByAdminIdOrderByTimestampDesc(adminId, limit);
    }

    /**
     * Delete an admin log (use with caution - for data cleanup only)
     */
    public void deleteLog(Long id) {
        if (!adminLogRepository.existsById(id)) {
            throw new RuntimeException("Admin log not found with id: " + id);
        }
        adminLogRepository.deleteById(id);
    }

    /**
     * Get count of logs by admin
     */
    public long getLogCountByAdmin(Long adminId) {
        return adminLogRepository.countByAdminId(adminId);
    }

    /**
     * Get count of logs by action type
     */
    public long getLogCountByAction(String action) {
        return adminLogRepository.countByActionContaining(action);
    }
}