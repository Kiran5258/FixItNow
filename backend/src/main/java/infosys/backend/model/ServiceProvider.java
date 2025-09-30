package infosys.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "services")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceProvider {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Provider offering the service
    @ManyToOne
    @JoinColumn(name = "provider_id", referencedColumnName = "id", nullable = false)
    private User provider;

    @Column(nullable = false)
    private String category;      // e.g., Electrician, Plumber

    private String subcategory;   // e.g., Wiring, AC repair

    @Column(columnDefinition = "TEXT")
    private String description;   // Detailed service description

    @Column(nullable = false)
    private BigDecimal price;     // Service price (better precision than Double)

    private String availability;  // Could be JSON string or formatted text

    private String location;      // Human-readable location

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;  // Auto-generated timestamp
}
