package infosys.backend.repository;

import infosys.backend.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    List<Message> findBySenderId(Long senderId);
    
    List<Message> findByReceiverId(Long receiverId);
    
    @Query("SELECT m FROM Message m WHERE (m.senderId = :userId1 AND m.receiverId = :userId2) OR (m.senderId = :userId2 AND m.receiverId = :userId1) ORDER BY m.sentAt")
    List<Message> findConversationBetweenUsers(@Param("userId1") Long userId1, @Param("userId2") Long userId2);
    
    @Query("SELECT m FROM Message m WHERE m.receiverId = :userId ORDER BY m.sentAt DESC")
    List<Message> findMessagesReceivedByUser(@Param("userId") Long userId);
}