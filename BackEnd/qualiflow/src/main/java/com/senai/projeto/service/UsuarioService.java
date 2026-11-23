package com.senai.projeto.service;

import com.senai.projeto.dto.LoginRequest;
import com.senai.projeto.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.senai.projeto.dto.CadastroRequest;
import com.senai.projeto.enums.Cargo;
import com.senai.projeto.model.Usuario;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Usuario cadastrar(CadastroRequest dados) {
        if (usuarioRepository.findByEmail(dados.email()).isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "E-mail já cadastrado");
        }

        String senhaHash = passwordEncoder.encode(dados.senha());

        Usuario usuario = new Usuario(
                null,
                dados.nome(),
                dados.sobrenome(),
                dados.email(),
                senhaHash,
                dados.cargo()
        );

        return usuarioRepository.save(usuario);
    }

    public void exigirGestor(Long usuarioId){
        if (usuarioId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Faça login para continuar");
        }

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sessão inválida"));

        if(usuario.getCargo() != Cargo.GESTOR){
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas gestores podem cadastrar usuários");
        }
    }

    public Usuario autenticar(LoginRequest dados) {
        return usuarioRepository.findByEmail(dados.email())
                .filter(usuario ->
                        passwordEncoder.matches(dados.senha(), usuario.getSenha()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "E-mail ou senha inválidos"));
    }

    public Usuario buscarUsuarioLogado(Long usuarioId){
        if (usuarioId == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Faça login para continuar"
            );
        }

        return usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sessão inválida"));
    }


}
