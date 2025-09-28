package infosys.backend.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProviderRegistrationRequest {
    // User info
    private String name;
    private String email;
    private String password;
    private String location;
    private Double latitude;
    private Double longitude;

    // ProviderProfile info
    private String category;
    private String subcategory;
    private String skills;
    private String serviceArea;
}
