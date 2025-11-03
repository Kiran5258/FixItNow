package infosys.backend.model;


import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

import infosys.backend.enums.TargetType;

@Entity
@Table(name = "reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private TargetType targetType; // BOOKING, PROVIDER, CUSTOMER

    private Long targetId;

    @ManyToOne
    @JoinColumn(name = "reported_by")
    private User reportedBy;

    private String reason;
    private String status = "PENDING"; // add this field

    private LocalDateTime createdAt = LocalDateTime.now();
}
