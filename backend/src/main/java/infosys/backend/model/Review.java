package infosys.backend.model;

import jakarta.persistence.*;
import lombok.*;
<<<<<<< HEAD
=======
import org.hibernate.annotations.CreationTimestamp;

>>>>>>> bc6283a1b8465728100111aba7f88dc8bdddce84
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

<<<<<<< HEAD
    @ManyToOne
    @JoinColumn(name = "booking_id")
    private Booking booking; 

=======
    // Optional link to the booking
    @ManyToOne
    @JoinColumn(name = "booking_id")
    private Booking booking;

    // The customer who wrote the review
>>>>>>> bc6283a1b8465728100111aba7f88dc8bdddce84
    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

<<<<<<< HEAD
=======
    // The provider receiving the review
>>>>>>> bc6283a1b8465728100111aba7f88dc8bdddce84
    @ManyToOne
    @JoinColumn(name = "provider_id", nullable = false)
    private User provider;

<<<<<<< HEAD
=======
    // The service being reviewed ✅ NEW
>>>>>>> bc6283a1b8465728100111aba7f88dc8bdddce84
    @ManyToOne
    @JoinColumn(name = "service_id", nullable = false)
    private ServiceProvider service;

<<<<<<< HEAD
    private Integer rating; // 1-5

    private String comment;

    @Column(length = 1000)
    private String reply;

    private LocalDateTime createdAt = LocalDateTime.now();
=======
    // Star rating (1 to 5)
    @Column(nullable = false)
    private Integer rating;

    @Column(columnDefinition = "TEXT")
    private String comment;

    // Auto-generate creation timestamp
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
>>>>>>> bc6283a1b8465728100111aba7f88dc8bdddce84
}
