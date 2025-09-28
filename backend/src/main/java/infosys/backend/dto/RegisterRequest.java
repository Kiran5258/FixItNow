package infosys.backend.dto;

import infosys.backend.enums.Role;
import lombok.Data;

@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private Role role;          // CUSTOMER / PROVIDER / ADMIN
    private String location;    // human-readable address
    private Double latitude;    // map coordinates
    private Double longitude;

    // Provider-specific fields
    private String category;    
    private String subcategory;
    private String skills;
    private String serviceArea;
}
