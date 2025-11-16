package infosys.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "admin_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
@JoinColumn(name = "admin_id", nullable = false)
@JsonIgnore
private User admin;


    private String action;         // e.g., "Approved provider verification"
    private String targetType;     // e.g., "Document", "Report", "Provider"
    private Long targetId;

    private LocalDateTime timestamp = LocalDateTime.now();
}
