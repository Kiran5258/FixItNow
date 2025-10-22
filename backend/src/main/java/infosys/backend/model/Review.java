package infosys.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Optional link to the booking
    @ManyToOne
    @JoinColumn(name = "booking_id")
    private Booking booking;

    // The customer who wrote the review
    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    // The provider receiving the review
    @ManyToOne
    @JoinColumn(name = "provider_id", nullable = false)
    private User provider;

    // The service being reviewed ✅ NEW
    @ManyToOne
    @JoinColumn(name = "service_id", nullable = false)
    private ServiceProvider service;

    // Star rating (1 to 5)
    @Column(nullable = false)
    private Integer rating;

    @Column(columnDefinition = "TEXT")
    private String comment;

    // Auto-generate creation timestamp
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
