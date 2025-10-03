package infosys.backend.service;

import infosys.backend.enums.ReportTargetType;
import infosys.backend.model.Report;
import infosys.backend.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;

    /**
     * Create a new report
     */
    public Report createReport(Report report) {
        return reportRepository.save(report);
    }

    /**
     * Get all reports (for admin use)
     */
    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }

    /**
     * Get report by ID
     */
    public Optional<Report> getReportById(Long id) {
        return reportRepository.findById(id);
    }

    /**
     * Get reports by target type and target ID
     */
    public List<Report> getReportsByTarget(ReportTargetType targetType, Long targetId) {
        return reportRepository.findByTargetTypeAndTargetId(targetType, targetId);
    }

    /**
     * Get reports by reporter (user who reported)
     */
    public List<Report> getReportsByReporter(Long reporterId) {
        return reportRepository.findByReportedBy(reporterId);
    }

    /**
     * Get reports by target type only
     */
    public List<Report> getReportsByTargetType(ReportTargetType targetType) {
        return reportRepository.findByTargetType(targetType);
    }

    /**
     * Update an existing report
     */
    public Report updateReport(Long id, Report updatedReport) {
        return reportRepository.findById(id)
                .map(report -> {
                    report.setReason(updatedReport.getReason());
                    // Note: targetType, targetId, and reportedBy should not be updated
                    return reportRepository.save(report);
                })
                .orElseThrow(() -> new RuntimeException("Report not found with id: " + id));
    }

    /**
     * Delete a report
     */
    public void deleteReport(Long id) {
        if (!reportRepository.existsById(id)) {
            throw new RuntimeException("Report not found with id: " + id);
        }
        reportRepository.deleteById(id);
    }

    /**
     * Check if a user has already reported a specific target
     */
    public boolean hasUserReportedTarget(Long reporterId, ReportTargetType targetType, Long targetId) {
        return reportRepository.existsByReportedByAndTargetTypeAndTargetId(reporterId, targetType, targetId);
    }

    /**
     * Get count of reports for a specific target
     */
    public long getReportCountForTarget(ReportTargetType targetType, Long targetId) {
        return reportRepository.countByTargetTypeAndTargetId(targetType, targetId);
    }
}