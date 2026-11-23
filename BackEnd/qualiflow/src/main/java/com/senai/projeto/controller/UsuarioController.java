package com.senai.projeto.controller;

import com.senai.projeto.dto.CadastroRequest;
import com.senai.projeto.dto.CadastroResponse;
import com.senai.projeto.dto.LoginRequest;
import com.senai.projeto.model.Usuario;
import com.senai.projeto.service.UsuarioService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
public class UsuarioController {
    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/usuarios")
    @ResponseStatus(HttpStatus.CREATED)
    public CadastroResponse cadastrar(
            @SessionAttribute(name = "usuarioId", required = false) Long usuarioId,
            @Valid @RequestBody CadastroRequest dados) {

        usuarioService.exigirGestor(usuarioId);
        Usuario novoUsuario = usuarioService.cadastrar(dados);

        return new CadastroResponse(
                novoUsuario.getId(),
                novoUsuario.getNome(),
                novoUsuario.getEmail(),
                novoUsuario.getCargo()
        );
    }

    @PostMapping("/login")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void login(@Valid @RequestBody LoginRequest dados, HttpServletRequest request) {
        Usuario usuario = usuarioService.autenticar(dados);

        HttpSession sessaoAnterior = request.getSession(false);
        if (sessaoAnterior != null) {
            sessaoAnterior.invalidate();
        }

        request.getSession().setAttribute("usuarioId", usuario.getId());
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(HttpServletRequest request) {
        HttpSession sessao = request.getSession(false);

        if (sessao != null){
            sessao.invalidate();
        }
    }

    @GetMapping("/usuarios/me")
    public CadastroResponse usuarioLogado(@SessionAttribute(name = "usuarioId", required = false) Long usuarioId){
        Usuario usuario = usuarioService.buscarUsuarioLogado(usuarioId);

        return new CadastroResponse(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getCargo()
        );
    }

}
