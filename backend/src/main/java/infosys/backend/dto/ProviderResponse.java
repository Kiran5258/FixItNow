package infosys.backend.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProviderResponse {
    private Long id;
    private String name;
    private String email;
    private String role;
    private String location;
    private Double latitude;
    private Double longitude;

    // Provider-specific fields
    private String category;
    private String subcategory;
    private String skills;
    private String serviceArea;
}
