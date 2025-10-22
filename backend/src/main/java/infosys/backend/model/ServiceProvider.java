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
@ToString(exclude = "provider") // Exclude provider to prevent recursive toString()
public class ServiceProvider {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Provider offering the service
    @ManyToOne
    @JoinColumn(name = "provider_id", referencedColumnName = "id", nullable = false)
    @JsonBackReference // Avoid infinite recursion with User.services
    private User provider;

    @Column(nullable = false)
    private String category; // e.g., Electrician, Plumber

    private String subcategory; // e.g., Wiring, AC repair

    @Column(columnDefinition = "TEXT")
    private String description; // Detailed service description

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price; // Use precision and scale for accurate money representation

    private String availability; // Could be JSON string or formatted text

    private String location; // Human-readable location

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt; // Auto-generated timestamp
}
