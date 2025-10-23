package infosys.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonBackReference;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "services")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
<<<<<<< HEAD
@ToString(exclude = "provider")
=======
@ToString(exclude = "provider") // Exclude provider to prevent recursive toString()
>>>>>>> bc6283a1b8465728100111aba7f88dc8bdddce84
public class ServiceProvider {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Provider offering the service
    @ManyToOne
    @JoinColumn(name = "provider_id", referencedColumnName = "id", nullable = false)
<<<<<<< HEAD
    @JsonBackReference
    private User provider;

    

=======
    @JsonBackReference // Avoid infinite recursion with User.services
    private User provider;

>>>>>>> bc6283a1b8465728100111aba7f88dc8bdddce84
    @Column(nullable = false)
    private String category; // e.g., Electrician, Plumber

    private String subcategory; // e.g., Wiring, AC repair

    @Column(columnDefinition = "TEXT")
    private String description; // Detailed service description

<<<<<<< HEAD
    @Column(nullable = false)
    private BigDecimal price; // Service price (better precision than Double)
=======
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price; // Use precision and scale for accurate money representation
>>>>>>> bc6283a1b8465728100111aba7f88dc8bdddce84

    private String availability; // Could be JSON string or formatted text

    private String location; // Human-readable location

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt; // Auto-generated timestamp
<<<<<<< HEAD

    
=======
>>>>>>> bc6283a1b8465728100111aba7f88dc8bdddce84
}
