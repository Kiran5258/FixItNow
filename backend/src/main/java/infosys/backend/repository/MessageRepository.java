package infosys.backend.repository;

import infosys.backend.model.Message;
import infosys.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    // Fetch all messages between two users
    List<Message> findBySenderAndReceiverOrReceiverAndSenderOrderBySentAtAsc(
            User sender1, User receiver1, User sender2, User receiver2
    );

    // Optional: fetch messages by booking/conversation ID if you add it later
     @Query("SELECT m FROM Message m " +
           "JOIN FETCH m.sender " +
           "JOIN FETCH m.receiver " +
           "WHERE (m.sender = :user1 AND m.receiver = :user2) " +
           "   OR (m.sender = :user2 AND m.receiver = :user1) " +
           "ORDER BY m.sentAt ASC")
    List<Message> findMessagesBetweenUsersWithUsers(
            @Param("user1") User user1,
            @Param("user2") User user2
    );
}
