package infosys.backend.controller;

import infosys.backend.enums.TargetType;
import infosys.backend.model.Report;
import infosys.backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    // 🆕 Create a new report (customer or provider)
    @PostMapping("/create")
    public ResponseEntity<Report> createReport(
            @RequestParam Long userId,
            @RequestParam TargetType targetType,
            @RequestParam Long targetId,
            @RequestParam String reason
    ) {
        Report report = reportService.createReport(userId, targetType, targetId, reason);
        return ResponseEntity.ok(report);
    }

    // 📋 Get all reports (Admin)
    @GetMapping("/all")
    public ResponseEntity<List<Report>> getAllReports() {
        return ResponseEntity.ok(reportService.getAllReports());
    }

    // 🔍 Get reports by type (Admin)
    @GetMapping("/type/{type}")
    public ResponseEntity<List<Report>> getReportsByType(@PathVariable TargetType type) {
        return ResponseEntity.ok(reportService.getReportsByType(type));
    }

    // 🔍 Get reports by status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Report>> getReportsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(reportService.getReportsByStatus(status));
    }

    // 👤 Get reports by user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Report>> getReportsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(reportService.getReportsByUser(userId));
    }

    // ✏️ Update report status (Admin)
    @PutMapping("/update-status/{reportId}")
    public ResponseEntity<Report> updateStatus(
            @PathVariable Long reportId,
            @RequestParam String status
    ) {
        return ResponseEntity.ok(reportService.updateReportStatus(reportId, status));
    }

    // 🗑️ Delete report (Admin)
    @DeleteMapping("/{reportId}")
    public ResponseEntity<String> deleteReport(@PathVariable Long reportId) {
        reportService.deleteReport(reportId);
        return ResponseEntity.ok("Report deleted successfully");
    }
}
