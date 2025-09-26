package infosys.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponse {
    private String token;
    private String role;
    private String message;

    // Constructor for login (token + role)
    public AuthResponse(String token, String role) {
        this.token = token;
        this.role = role;
        this.message = null; // message is not needed for login
    }

    // Constructor for register (message only)
    public AuthResponse(String message) {
        this.message = message;
    }
}
