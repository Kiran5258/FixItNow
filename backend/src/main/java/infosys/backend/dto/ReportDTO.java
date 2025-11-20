package infosys.backend.dto;

import infosys.backend.enums.TargetType;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ReportDTO {
    private Long id;
    private TargetType targetType;
    private Long targetId;
    private String reason;
    private String status;
    private String createdAt;

    private Long reportedById;
    private String reportedByName;
}
