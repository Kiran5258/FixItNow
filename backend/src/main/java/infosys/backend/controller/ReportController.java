package infosys.backend.controller;

import infosys.backend.dto.AuthUser;
import infosys.backend.dto.ReportDTO;
import infosys.backend.enums.TargetType;
import infosys.backend.model.Report;
import infosys.backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    // 🆕 Create a new report (Customer or Provider)
    @PreAuthorize("hasAnyRole('CUSTOMER','PROVIDER')")
    @PostMapping("/create")
    public ResponseEntity<Report> createReport(
            @AuthenticationPrincipal AuthUser authUser,
            @RequestParam TargetType targetType,
            @RequestParam Long targetId,
            @RequestParam String reason
    ) {
        Report report = reportService.createReport(
                authUser.getId(),     // ✔ logged-in user ID from JWT
                targetType,
                targetId,
                reason
        );
        return ResponseEntity.ok(report);
    }

    // 📋 Get all reports (Admin)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/all")
public ResponseEntity<List<ReportDTO>> getAllReports() {
    List<ReportDTO> dtos = reportService.getAllReports().stream()
        .map(r -> new ReportDTO(
                r.getId(),
                r.getTargetType(),
                r.getTargetId(),
                r.getReason(),
                r.getStatus(),
                r.getCreatedAt().toString(),
                r.getReportedBy() != null ? r.getReportedBy().getId() : null,
                r.getReportedBy() != null ? r.getReportedBy().getName() : "Unknown"
        )).toList();

    return ResponseEntity.ok(dtos);
}


    // 🔍 Get reports by type (Admin)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/type/{type}")
    public ResponseEntity<List<Report>> getReportsByType(@PathVariable TargetType type) {
        return ResponseEntity.ok(reportService.getReportsByType(type));
    }

    // 🔍 Get reports by status (Admin)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Report>> getReportsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(reportService.getReportsByStatus(status));
    }

    // 👤 Get reports for logged-in user
    @PreAuthorize("hasAnyRole('CUSTOMER','PROVIDER')")
    @GetMapping("/my")
    public ResponseEntity<List<Report>> getMyReports(@AuthenticationPrincipal AuthUser authUser) {
        return ResponseEntity.ok(reportService.getReportsByUser(authUser.getId()));
    }

    // ✏️ Update report status (Admin)
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/update-status/{reportId}")
    public ResponseEntity<Report> updateStatus(
            @PathVariable Long reportId,
            @RequestParam String status
    ) {
        return ResponseEntity.ok(reportService.updateReportStatus(reportId, status));
    }

    // 🗑️ Delete report (Admin)
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{reportId}")
    public ResponseEntity<String> deleteReport(@PathVariable Long reportId) {
        reportService.deleteReport(reportId);
        return ResponseEntity.ok("Report deleted successfully");
    }
}
