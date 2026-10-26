package com.senai.projeto.controller;

import com.senai.projeto.model.Garrafa;
import com.senai.projeto.repository.GarrafaRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/garrafas")
public class GarrafaController {
    private final GarrafaRepository repository;

    public GarrafaController(GarrafaRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Garrafa> findAll() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Garrafa findById(@PathVariable Long id_registro) {
        return repository.findById(id_registro).get();
    }
}
