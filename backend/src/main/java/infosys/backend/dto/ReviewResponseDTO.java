package infosys.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponseDTO {
    private Long id;
    private Long bookingId;

    private Long customerId;
    private String customerName;

    private Long providerId;
    private String providerName;

    private Long serviceId;
    private String serviceSubcategory;

    private Integer rating;
    private String comment;
    private String reply;

    private LocalDateTime createdAt;
}
