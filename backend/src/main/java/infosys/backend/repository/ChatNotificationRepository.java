package infosys.backend.repository;

import infosys.backend.model.ChatNotification;
import infosys.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChatNotificationRepository extends JpaRepository<ChatNotification, Long> {
    
    List<ChatNotification> findByReceiverOrderBySentAtDesc(User receiver);
    
    List<ChatNotification> findByReceiverAndIsReadFalseOrderBySentAtDesc(User receiver);
    
    long countByReceiverAndIsReadFalse(User receiver);
    
    List<ChatNotification> findByReceiverAndSenderOrderBySentAtDesc(User receiver, User sender);
    
    // Check for duplicate notification within a time window
    @Query("SELECT n FROM ChatNotification n WHERE n.sender = :sender AND n.receiver = :receiver " +
           "AND n.messageContent = :content AND n.sentAt BETWEEN :startTime AND :endTime")
    Optional<ChatNotification> findDuplicate(
        @Param("sender") User sender, 
        @Param("receiver") User receiver,
        @Param("content") String content,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );
}