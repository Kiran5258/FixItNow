package infosys.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

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

    @ManyToOne
    @JoinColumn(name = "booking_id")
    private Booking booking; 

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
@JoinColumn(name = "customer_id", nullable = false)
@JsonIgnoreProperties({"password", "roles"})
private User customer;

@ManyToOne(fetch = FetchType.LAZY, optional = false)
@JoinColumn(name = "provider_id", nullable = false)
@JsonIgnoreProperties({"password", "roles"})
private User provider;




    @ManyToOne
    @JoinColumn(name = "service_id", nullable = false)
    @JsonIgnoreProperties({"provider", "reviews"})
    private ServiceProvider service;

    private Integer rating; // 1-5

    private String comment;

    @Column(length = 1000)
    private String reply;

    private LocalDateTime createdAt = LocalDateTime.now();
}
