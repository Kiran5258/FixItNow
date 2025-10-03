package infosys.backend.controller;

import infosys.backend.enums.ReportTargetType;
import infosys.backend.model.Report;
import infosys.backend.model.User;
import infosys.backend.service.AdminLogService;
import infosys.backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final AdminLogService adminLogService;

    /**
     * Create a new report
     * Any authenticated user can report issues
     */
    @PreAuthorize("hasAnyRole('CUSTOMER', 'PROVIDER', 'ADMIN')")
    @PostMapping
    public ResponseEntity<Report> createReport(@RequestBody Report report, Authentication auth) {
        User currentUser = (User) auth.getPrincipal();
        
        // Set the reporter as the current authenticated user
        report.setReportedBy(currentUser.getId());
        
        // Check if user has already reported this target
        boolean alreadyReported = reportService.hasUserReportedTarget(
            currentUser.getId(), 
            report.getTargetType(), 
            report.getTargetId()
        );
        
        if (alreadyReported) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(null); // User has already reported this target
        }
        
        Report savedReport = reportService.createReport(report);
        
        // Log the action if performed by admin
        if (currentUser.getRole().name().equals("ADMIN")) {
            adminLogService.logAction(
                currentUser.getId(), 
                "Created report for " + report.getTargetType() + " ID: " + report.getTargetId(),
                report.getTargetId(),
                report.getTargetType().name()
            );
        }
        
        return new ResponseEntity<>(savedReport, HttpStatus.CREATED);
    }

    /**
     * Get all reports (Admin only)
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<Report>> getAllReports(Authentication auth) {
        User admin = (User) auth.getPrincipal();
        List<Report> reports = reportService.getAllReports();
        
        // Log admin action
        adminLogService.logAction(admin.getId(), "Retrieved all reports");
        
        return ResponseEntity.ok(reports);
    }

    /**
     * Get report by ID
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<Report> getReportById(@PathVariable Long id, Authentication auth) {
        User admin = (User) auth.getPrincipal();
        Optional<Report> report = reportService.getReportById(id);
        
        if (report.isPresent()) {
            adminLogService.logAction(admin.getId(), "Retrieved report ID: " + id, id, "REPORT");
            return ResponseEntity.ok(report.get());
        }
        
        return ResponseEntity.notFound().build();
    }

    /**
     * Get reports by target type and target ID
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/target/{targetType}/{targetId}")
    public ResponseEntity<List<Report>> getReportsByTarget(
            @PathVariable ReportTargetType targetType, 
            @PathVariable Long targetId,
            Authentication auth) {
        
        User admin = (User) auth.getPrincipal();
        List<Report> reports = reportService.getReportsByTarget(targetType, targetId);
        
        adminLogService.logAction(
            admin.getId(), 
            "Retrieved reports for " + targetType + " ID: " + targetId,
            targetId,
            targetType.name()
        );
        
        return ResponseEntity.ok(reports);
    }

    /**
     * Get reports by target type only
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/target-type/{targetType}")
    public ResponseEntity<List<Report>> getReportsByTargetType(
            @PathVariable ReportTargetType targetType,
            Authentication auth) {
        
        User admin = (User) auth.getPrincipal();
        List<Report> reports = reportService.getReportsByTargetType(targetType);
        
        adminLogService.logAction(admin.getId(), "Retrieved all " + targetType + " reports");
        
        return ResponseEntity.ok(reports);
    }

    /**
     * Get reports by reporter (user who reported)
     */
    @PreAuthorize("hasRole('ADMIN') or hasRole('CUSTOMER') or hasRole('PROVIDER')")
    @GetMapping("/reporter/{reporterId}")
    public ResponseEntity<List<Report>> getReportsByReporter(
            @PathVariable Long reporterId, 
            Authentication auth) {
        
        User currentUser = (User) auth.getPrincipal();
        
        // Users can only see their own reports, admins can see all
        if (!currentUser.getRole().name().equals("ADMIN") && !currentUser.getId().equals(reporterId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        List<Report> reports = reportService.getReportsByReporter(reporterId);
        
        if (currentUser.getRole().name().equals("ADMIN")) {
            adminLogService.logAction(
                currentUser.getId(), 
                "Retrieved reports by user ID: " + reporterId,
                reporterId,
                "USER"
            );
        }
        
        return ResponseEntity.ok(reports);
    }

    /**
     * Get my reports (current user's reports)
     */
    @PreAuthorize("hasAnyRole('CUSTOMER', 'PROVIDER')")
    @GetMapping("/my-reports")
    public ResponseEntity<List<Report>> getMyReports(Authentication auth) {
        User currentUser = (User) auth.getPrincipal();
        List<Report> reports = reportService.getReportsByReporter(currentUser.getId());
        return ResponseEntity.ok(reports);
    }

    /**
     * Update a report (mainly for updating reason)
     */
    @PreAuthorize("hasRole('ADMIN') or hasRole('CUSTOMER') or hasRole('PROVIDER')")
    @PutMapping("/{id}")
    public ResponseEntity<Report> updateReport(
            @PathVariable Long id, 
            @RequestBody Report updatedReport,
            Authentication auth) {
        
        User currentUser = (User) auth.getPrincipal();
        Optional<Report> existingReport = reportService.getReportById(id);
        
        if (existingReport.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        // Only admin or the reporter can update the report
        if (!currentUser.getRole().name().equals("ADMIN") && 
            !currentUser.getId().equals(existingReport.get().getReportedBy())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        try {
            Report updated = reportService.updateReport(id, updatedReport);
            
            if (currentUser.getRole().name().equals("ADMIN")) {
                adminLogService.logAction(
                    currentUser.getId(), 
                    "Updated report ID: " + id,
                    id,
                    "REPORT"
                );
            }
            
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete a report (Admin only or report owner)
     */
    @PreAuthorize("hasRole('ADMIN') or hasRole('CUSTOMER') or hasRole('PROVIDER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteReport(@PathVariable Long id, Authentication auth) {
        User currentUser = (User) auth.getPrincipal();
        Optional<Report> existingReport = reportService.getReportById(id);
        
        if (existingReport.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        // Only admin or the reporter can delete the report
        if (!currentUser.getRole().name().equals("ADMIN") && 
            !currentUser.getId().equals(existingReport.get().getReportedBy())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        try {
            reportService.deleteReport(id);
            
            if (currentUser.getRole().name().equals("ADMIN")) {
                adminLogService.logAction(
                    currentUser.getId(), 
                    "Deleted report ID: " + id,
                    id,
                    "REPORT"
                );
            }
            
            return ResponseEntity.ok("Report deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get report count for a specific target
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/count/target/{targetType}/{targetId}")
    public ResponseEntity<Long> getReportCountForTarget(
            @PathVariable ReportTargetType targetType,
            @PathVariable Long targetId,
            Authentication auth) {
        
        User admin = (User) auth.getPrincipal();
        long count = reportService.getReportCountForTarget(targetType, targetId);
        
        adminLogService.logAction(
            admin.getId(), 
            "Retrieved report count for " + targetType + " ID: " + targetId,
            targetId,
            targetType.name()
        );
        
        return ResponseEntity.ok(count);
    }
}