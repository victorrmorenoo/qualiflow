package com.senai.projeto.controller;

import com.senai.projeto.model.Usuario;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

public class UsuarioController {

    @PostMapping
    public Usuario cadastrar(@RequestBody String nome,
                             @RequestBody String sobrenome,
                             @RequestBody String email,
                             @RequestBody String senha) {

        return null;
    }
}
