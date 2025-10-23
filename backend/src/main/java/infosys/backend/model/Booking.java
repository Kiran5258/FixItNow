package infosys.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

<<<<<<< HEAD
=======
import org.hibernate.annotations.CreationTimestamp;
>>>>>>> bc6283a1b8465728100111aba7f88dc8bdddce84
import infosys.backend.enums.BookingStatus;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "service_id", nullable = false)
    private ServiceProvider service;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @ManyToOne
    @JoinColumn(name = "provider_id", nullable = false)
    private User provider;

    private LocalDate bookingDate;

    private String timeSlot;

    @Enumerated(EnumType.STRING)
<<<<<<< HEAD
    private BookingStatus status = BookingStatus.PENDING;

    private LocalDateTime createdAt = LocalDateTime.now();

    
=======
    private BookingStatus status;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    private void prePersist() {
        if (status == null) {
            status = BookingStatus.PENDING; // Ensure default enum value
        }
    }
>>>>>>> bc6283a1b8465728100111aba7f88dc8bdddce84
}
