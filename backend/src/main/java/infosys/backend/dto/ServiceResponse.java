package infosys.backend.dto;

import java.math.BigDecimal;

import lombok.*;



@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceResponse {
    private Long id;
    private Long providerId;
    private String providerName;
    private String category;
    private String subcategory;
    private String description;
    private BigDecimal price;
    private String availability;
    private String location;
}
