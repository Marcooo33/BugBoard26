package it.bugboard26.users.modules.users;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.mindrot.jbcrypt.BCrypt;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import lombok.AllArgsConstructor;
import it.bugboard26.users.entities.User;
import it.bugboard26.users.modules.auth.dtos.UserResponse;
import it.bugboard26.users.modules.users.dtos.RegistrationRequest;
import it.bugboard26.users.modules.users.dtos.UpdateEmailRequest;
import it.bugboard26.users.modules.users.dtos.UpdatePasswordRequest;
import it.bugboard26.users.repositories.UserRepository;

@AllArgsConstructor
@Service
public class UserService {
    private final UserRepository userRepository;

    public User save(User user) {
        return userRepository.save(user);
    }

    public User findByUuid(UUID uuid) {
        return userRepository.findById(uuid).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public List<UserResponse> findAllByIds(Set<UUID> user_ids) {
        return userRepository.findAllById(user_ids).stream()
        .map(user -> UserResponse.map(user))
        .toList();
    }

    public List<UserResponse> findAll() {
        return userRepository.findAllByIsActiveTrue().stream()
        .map(user -> UserResponse.map(user))
        .toList();
    }

    public User registerUser(RegistrationRequest frontendRequest) {
        if(this.existsByEmail(frontendRequest.getEmail())) 
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");

        String hashedPassword = BCrypt.hashpw(frontendRequest.getPassword(), BCrypt.gensalt());
        User newUser = new User(
            frontendRequest.getName(),
            frontendRequest.getSurname(),
            frontendRequest.getEmail(),
            hashedPassword,
            frontendRequest.isAdmin()
        );
        
        return this.save(newUser);
    }

    public void deleteUser(UUID uuid_user) {
        User user = this.findByUuid(uuid_user);
        user.setActive(false);
        userRepository.save(user);
    }

    public void updateEmail(UUID uuid, UpdateEmailRequest request) {
        User user = this.findByUuid(uuid);

        if (user.getEmail().equalsIgnoreCase(request.getNewEmail()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New email is the same as the current one");

        if (this.existsByEmail(request.getNewEmail()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");

        user.setEmail(request.getNewEmail());
        userRepository.save(user);
    }

    public void updatePassword(UUID uuid, UpdatePasswordRequest request) {
        User user = this.findByUuid(uuid);

        if (!BCrypt.checkpw(request.getCurrentPassword(), user.getPasswordHash()))
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Current password is incorrect");

        if (BCrypt.checkpw(request.getNewPassword(), user.getPasswordHash()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password must be different from the current one");

        String hashedPassword = BCrypt.hashpw(request.getNewPassword(), BCrypt.gensalt());
        user.setPasswordHash(hashedPassword);
        userRepository.save(user);
    }

}
