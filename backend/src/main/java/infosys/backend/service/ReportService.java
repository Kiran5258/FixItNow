package infosys.backend.service;

import infosys.backend.enums.TargetType;
import infosys.backend.model.Report;
import infosys.backend.model.User;
import infosys.backend.repository.ReportRepository;
import infosys.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;

    // ✅ Create new report
    public Report createReport(Long userId, TargetType targetType, Long targetId, String reason) {
        User reportedBy = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Report report = new Report();
        report.setReportedBy(reportedBy);
        report.setTargetType(targetType);
        report.setTargetId(targetId);
        report.setReason(reason);
        report.setStatus("PENDING");

        return reportRepository.save(report);
    }

    // ✅ Get all reports
    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }

    // ✅ Get reports by target type
    public List<Report> getReportsByType(TargetType type) {
        return reportRepository.findByTargetType(type);
    }

    // ✅ Get reports by status
    public List<Report> getReportsByStatus(String status) {
        return reportRepository.findByStatus(status);
    }

    // ✅ Get reports by reporting user
    public List<Report> getReportsByUser(Long userId) {
        return reportRepository.findByReportedById(userId);
    }

    // ✅ Update report status (Admin)
    public Report updateReportStatus(Long reportId, String status) {
        Optional<Report> optionalReport = reportRepository.findById(reportId);
        if (optionalReport.isEmpty()) {
            throw new RuntimeException("Report not found");
        }

        Report report = optionalReport.get();
        report.setStatus(status);
        return reportRepository.save(report);
    }

    // ✅ Delete report (Admin)
    public void deleteReport(Long reportId) {
        if (!reportRepository.existsById(reportId)) {
            throw new RuntimeException("Report not found");
        }
        reportRepository.deleteById(reportId);
    }
}
