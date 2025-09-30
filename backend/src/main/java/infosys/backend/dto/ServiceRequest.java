package infosys.backend.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceRequest {
    private String category;
    private String subcategory;
    private String description;
    private BigDecimal price;
    private String availability;
    private String location;
}
