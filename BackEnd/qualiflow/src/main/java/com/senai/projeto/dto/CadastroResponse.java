package com.senai.projeto.dto;

import com.senai.projeto.enums.Cargo;

public record CadastroResponse(Long id, String nome, String email, Cargo cargo) {

}
