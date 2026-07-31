package it.bugboard26.users.modules.users;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import it.bugboard26.users.entities.User;
import it.bugboard26.users.modules.auth.dtos.UserResponse;
import it.bugboard26.users.modules.users.dtos.RegistrationRequest;
import it.bugboard26.users.modules.users.dtos.UpdateEmailRequest;
import it.bugboard26.users.modules.users.dtos.UpdatePasswordRequest;
import lombok.AllArgsConstructor;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;


@AllArgsConstructor
@RequestMapping("/users")
@RestController
public class UserApi {
    private UserService userService;

    @GetMapping
    public List<UserResponse> getAllUsers() {
        return userService.findAll();
    }

    @PostMapping("/batch")
    public List<UserResponse> getUsersBatch(@RequestBody Set<UUID> user_ids) {
        return userService.findAllByIds(user_ids);
    }

    @PostMapping
    public UUID register(@RequestBody RegistrationRequest registerRequest) {        
        User newUser = userService.registerUser(registerRequest);
        return newUser.getUuid();
    }

    @DeleteMapping("/{uuid_user}")
    public void deleteUser(@PathVariable UUID uuid_user) {
        userService.deleteUser(uuid_user);
    }

    @PatchMapping("/{uuid}/email")
    public ResponseEntity<Void> updateEmail(@PathVariable UUID uuid,
                                             @RequestBody UpdateEmailRequest request) {
        userService.updateEmail(uuid, request);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{uuid}/password")
    public ResponseEntity<Void> updatePassword(@PathVariable UUID uuid,
                                                @RequestBody UpdatePasswordRequest request) {
        userService.updatePassword(uuid, request);
        return ResponseEntity.ok().build();
    }
    
}
