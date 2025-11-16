package infosys.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
@JoinColumn(name = "sender_id", nullable = false)
@JsonIgnore
private User sender;

@ManyToOne(fetch = FetchType.LAZY, optional = false)
@JoinColumn(name = "receiver_id", nullable = false)
@JsonIgnore
private User receiver;


    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    private LocalDateTime sentAt;
}