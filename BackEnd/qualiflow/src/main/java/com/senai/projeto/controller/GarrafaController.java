package com.senai.projeto.controller;

import com.senai.projeto.model.Garrafa;
import com.senai.projeto.repository.GarrafaRepository;
import com.senai.projeto.service.GarrafaService;
import org.springframework.web.bind.annotation.*;
import org.springframework.format.annotation.DateTimeFormat;
import com.senai.projeto.enums.Turno;
import com.senai.projeto.enums.LinhaSopro;
import com.senai.projeto.enums.Periodo;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/garrafas")
public class GarrafaController {
    private final GarrafaRepository repository;
    private final GarrafaService service;

    public GarrafaController(GarrafaRepository repository, GarrafaService service) {
        this.repository = repository;
        this.service = service;
    }

    @GetMapping
    public List<Garrafa> findAll(
            @RequestParam(name = "turno", required = false) Turno turno,
            @RequestParam(name = "linha", required = false) LinhaSopro linha,
            @RequestParam(name = "periodo", required = false) Periodo periodo,
            @RequestParam(name = "dataInicio", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(name = "dataFim", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim){
        return service.listar(turno, linha, periodo, dataInicio, dataFim);
    }

    @GetMapping("/{id}")
    public Garrafa findById(@PathVariable("id") Long id_registro) {
        return repository.findById(id_registro).get();
    }
}
