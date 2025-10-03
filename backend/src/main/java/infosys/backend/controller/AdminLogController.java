package infosys.backend.controller;

import infosys.backend.model.AdminLog;
import infosys.backend.model.User;
import infosys.backend.service.AdminLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin-logs")
@RequiredArgsConstructor
public class AdminLogController {

    private final AdminLogService adminLogService;

    /**
     * Create a manual admin log entry
     * (Most logs are created automatically by other controllers)
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<AdminLog> createLog(@RequestBody AdminLog adminLog, Authentication auth) {
        User admin = (User) auth.getPrincipal();
        
        // Ensure the admin ID is set to current user
        adminLog.setAdminId(admin.getId());
        
        AdminLog savedLog = adminLogService.createLog(adminLog);
        return new ResponseEntity<>(savedLog, HttpStatus.CREATED);
    }

    /**
     * Log an action (convenience endpoint)
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/log-action")
    public ResponseEntity<AdminLog> logAction(
            @RequestParam String action,
            @RequestParam(required = false) Long targetId,
            @RequestParam(required = false) String targetType,
            Authentication auth) {
        
        User admin = (User) auth.getPrincipal();
        AdminLog log = adminLogService.logAction(admin.getId(), action, targetId, targetType);
        return new ResponseEntity<>(log, HttpStatus.CREATED);
    }

    /**
     * Get all admin logs
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<AdminLog>> getAllLogs(Authentication auth) {
        User admin = (User) auth.getPrincipal();
        List<AdminLog> logs = adminLogService.getAllLogs();
        
        // Log this action (admin accessing logs)
        adminLogService.logAction(admin.getId(), "Retrieved all admin logs");
        
        return ResponseEntity.ok(logs);
    }

    /**
     * Get admin log by ID
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<AdminLog> getLogById(@PathVariable Long id, Authentication auth) {
        User admin = (User) auth.getPrincipal();
        Optional<AdminLog> log = adminLogService.getLogById(id);
        
        if (log.isPresent()) {
            adminLogService.logAction(admin.getId(), "Retrieved admin log ID: " + id, id, "ADMIN_LOG");
            return ResponseEntity.ok(log.get());
        }
        
        return ResponseEntity.notFound().build();
    }

    /**
     * Get logs by admin ID
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/{adminId}")
    public ResponseEntity<List<AdminLog>> getLogsByAdmin(
            @PathVariable Long adminId, 
            Authentication auth) {
        
        User currentAdmin = (User) auth.getPrincipal();
        List<AdminLog> logs = adminLogService.getLogsByAdminId(adminId);
        
        adminLogService.logAction(
            currentAdmin.getId(), 
            "Retrieved logs for admin ID: " + adminId,
            adminId,
            "USER"
        );
        
        return ResponseEntity.ok(logs);
    }

    /**
     * Get my logs (current admin's logs)
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/my-logs")
    public ResponseEntity<List<AdminLog>> getMyLogs(Authentication auth) {
        User admin = (User) auth.getPrincipal();
        List<AdminLog> logs = adminLogService.getLogsByAdminId(admin.getId());
        return ResponseEntity.ok(logs);
    }

    /**
     * Get logs by target type and target ID
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/target/{targetType}/{targetId}")
    public ResponseEntity<List<AdminLog>> getLogsByTarget(
            @PathVariable String targetType, 
            @PathVariable Long targetId,
            Authentication auth) {
        
        User admin = (User) auth.getPrincipal();
        List<AdminLog> logs = adminLogService.getLogsByTarget(targetType, targetId);
        
        adminLogService.logAction(
            admin.getId(), 
            "Retrieved logs for " + targetType + " ID: " + targetId,
            targetId,
            targetType
        );
        
        return ResponseEntity.ok(logs);
    }

    /**
     * Get logs by target type only
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/target-type/{targetType}")
    public ResponseEntity<List<AdminLog>> getLogsByTargetType(
            @PathVariable String targetType,
            Authentication auth) {
        
        User admin = (User) auth.getPrincipal();
        List<AdminLog> logs = adminLogService.getLogsByTargetType(targetType);
        
        adminLogService.logAction(admin.getId(), "Retrieved all " + targetType + " logs");
        
        return ResponseEntity.ok(logs);
    }

    /**
     * Get logs within a date range
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/date-range")
    public ResponseEntity<List<AdminLog>> getLogsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            Authentication auth) {
        
        User admin = (User) auth.getPrincipal();
        List<AdminLog> logs = adminLogService.getLogsByDateRange(startDate, endDate);
        
        adminLogService.logAction(
            admin.getId(), 
            "Retrieved logs from " + startDate + " to " + endDate
        );
        
        return ResponseEntity.ok(logs);
    }

    /**
     * Get logs by admin and date range
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/{adminId}/date-range")
    public ResponseEntity<List<AdminLog>> getLogsByAdminAndDateRange(
            @PathVariable Long adminId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            Authentication auth) {
        
        User currentAdmin = (User) auth.getPrincipal();
        List<AdminLog> logs = adminLogService.getLogsByAdminAndDateRange(adminId, startDate, endDate);
        
        adminLogService.logAction(
            currentAdmin.getId(), 
            "Retrieved logs for admin " + adminId + " from " + startDate + " to " + endDate,
            adminId,
            "USER"
        );
        
        return ResponseEntity.ok(logs);
    }

    /**
     * Get recent logs (last N entries)
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/recent")
    public ResponseEntity<List<AdminLog>> getRecentLogs(
            @RequestParam(defaultValue = "50") int limit,
            Authentication auth) {
        
        User admin = (User) auth.getPrincipal();
        List<AdminLog> logs = adminLogService.getRecentLogs(limit);
        
        adminLogService.logAction(admin.getId(), "Retrieved " + limit + " recent logs");
        
        return ResponseEntity.ok(logs);
    }

    /**
     * Get recent logs by admin
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/{adminId}/recent")
    public ResponseEntity<List<AdminLog>> getRecentLogsByAdmin(
            @PathVariable Long adminId,
            @RequestParam(defaultValue = "20") int limit,
            Authentication auth) {
        
        User currentAdmin = (User) auth.getPrincipal();
        List<AdminLog> logs = adminLogService.getRecentLogsByAdmin(adminId, limit);
        
        adminLogService.logAction(
            currentAdmin.getId(), 
            "Retrieved " + limit + " recent logs for admin ID: " + adminId,
            adminId,
            "USER"
        );
        
        return ResponseEntity.ok(logs);
    }

    /**
     * Get my recent logs
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/my-recent-logs")
    public ResponseEntity<List<AdminLog>> getMyRecentLogs(
            @RequestParam(defaultValue = "20") int limit,
            Authentication auth) {
        
        User admin = (User) auth.getPrincipal();
        List<AdminLog> logs = adminLogService.getRecentLogsByAdmin(admin.getId(), limit);
        return ResponseEntity.ok(logs);
    }

    /**
     * Delete an admin log (use with extreme caution)
     */
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteLog(@PathVariable Long id, Authentication auth) {
        User admin = (User) auth.getPrincipal();
        
        try {
            adminLogService.deleteLog(id);
            
            // Log this critical action
            adminLogService.logAction(
                admin.getId(), 
                "CRITICAL: Deleted admin log ID: " + id + " (Data cleanup)",
                id,
                "ADMIN_LOG"
            );
            
            return ResponseEntity.ok("Admin log deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get log count by admin
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/count/admin/{adminId}")
    public ResponseEntity<Long> getLogCountByAdmin(@PathVariable Long adminId, Authentication auth) {
        User currentAdmin = (User) auth.getPrincipal();
        long count = adminLogService.getLogCountByAdmin(adminId);
        
        adminLogService.logAction(
            currentAdmin.getId(), 
            "Retrieved log count for admin ID: " + adminId,
            adminId,
            "USER"
        );
        
        return ResponseEntity.ok(count);
    }

    /**
     * Get log count by action type
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/count/action")
    public ResponseEntity<Long> getLogCountByAction(
            @RequestParam String action,
            Authentication auth) {
        
        User admin = (User) auth.getPrincipal();
        long count = adminLogService.getLogCountByAction(action);
        
        adminLogService.logAction(admin.getId(), "Retrieved log count for action: " + action);
        
        return ResponseEntity.ok(count);
    }
}