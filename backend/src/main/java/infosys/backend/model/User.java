package infosys.backend.model;

import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import infosys.backend.enums.Role;
import jakarta.persistence.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"services", "adminLogs", "documents"})
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String email;

    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    // Human-readable location only
    private String location;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "provider", fetch = FetchType.LAZY)
@JsonIgnore
private List<ServiceProvider> services;


    private boolean isVerified = false;

    @OneToMany(mappedBy = "admin", cascade = CascadeType.REMOVE, orphanRemoval = true)
@JsonIgnore
private List<AdminLog> adminLogs;
@OneToMany(mappedBy = "provider", cascade = CascadeType.REMOVE, orphanRemoval = true)
@JsonIgnore
private List<Document> documents;


}
