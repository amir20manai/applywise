
package com.applywise.backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String token;

    private String tokenType;

    private Long userId;

    private String firstName;

    private String lastName;

    private String email;

    private String role;
}
