package infosys.backend.dto;

import java.math.BigDecimal;
import lombok.*;

@Data  // ✅ generates getters, setters, toString, equals, hashCode
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceRequest {
    private Long providerId;
    private String category;
    private String subcategory;
    private String description;
    private BigDecimal price;
    private String availability;
    private String location;
}
