package infosys.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponseDTO {
    private Long id;
    private Long bookingId;
    private Long customerId;
    private Long providerId;
    private Long serviceId;
    private Integer rating;
    private String comment;
    private String reply;
}
