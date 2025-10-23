package infosys.backend.repository;

import infosys.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
<<<<<<< HEAD
     Optional<User> findByName(String name);
=======
>>>>>>> bc6283a1b8465728100111aba7f88dc8bdddce84
}
