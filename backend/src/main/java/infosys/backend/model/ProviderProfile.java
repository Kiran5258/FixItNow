package infosys.backend.model;

import jakarta.persistence.*;
import lombok.*;
import infosys.backend.model.User;

@Entity
@Table(name = "provider_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProviderProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Link to User entity (provider)
    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    private String category;      // e.g. Electrician, Plumber
    private String subcategory;   // e.g. Wiring, AC repair
    private String skills;        // Free-text list of skills
    private String serviceArea;   // e.g. "Within 5 km radius"
}
