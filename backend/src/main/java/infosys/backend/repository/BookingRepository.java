package infosys.backend.repository;


import org.springframework.data.jpa.repository.JpaRepository;

import infosys.backend.model.Booking;
import infosys.backend.model.User;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByCustomer(User customer);
    List<Booking> findByProvider(User provider);
}
