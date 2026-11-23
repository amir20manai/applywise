
package com.applywise.backend.repository;
import com.applywise.backend.entity.Role;
import com.applywise.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);
    long countByRole(Role role);
}
