package com.senai.projeto.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;

public record LoginRequest(
        @NotBlank @Email String email,
        @NotBlank String senha
) {}
