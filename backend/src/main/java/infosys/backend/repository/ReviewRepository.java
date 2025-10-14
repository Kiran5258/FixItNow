package infosys.backend.repository;

import infosys.backend.model.Review;
import infosys.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProvider(User provider);
}
