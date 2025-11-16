package infosys.backend.repository;

import infosys.backend.model.AdminLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface AdminLogRepository extends JpaRepository<AdminLog, Long> {

   @Modifying
@Transactional
@Query("DELETE FROM AdminLog al WHERE al.admin.id = :adminId")
void deleteByAdminId(@Param("adminId") Long adminId);
}
