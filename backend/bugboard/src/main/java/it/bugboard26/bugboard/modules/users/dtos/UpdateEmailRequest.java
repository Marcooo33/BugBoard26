package it.bugboard26.bugboard.modules.users.dtos;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateEmailRequest {
    private String newEmail;
}
