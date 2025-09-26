package infosys.backend.dto;



import infosys.backend.enums.Role;
import lombok.Data;

@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private Role role; 
    private String location;
}
