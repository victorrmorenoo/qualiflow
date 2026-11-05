package com.senai.projeto.service;

import com.senai.projeto.enums.LinhaSopro;
import com.senai.projeto.enums.Periodo;
import com.senai.projeto.enums.Turno;
import com.senai.projeto.model.Garrafa;
import com.senai.projeto.repository.GarrafaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
public class GarrafaService {
    private final GarrafaRepository repository;

    public GarrafaService(GarrafaRepository repository) {
        this.repository = repository;
    }

    public List<Garrafa> listar(Turno turno, LinhaSopro linha, Periodo periodo, LocalDate dataInicio, LocalDate dataFim) {
        LocalDateTime inicio = null;
        LocalDateTime fim = null;

        if (periodo == Periodo.PERSONALIZADO) {
            if (dataInicio == null || dataFim == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Informe dataInicio e dataFim para o intervalo personalizado");
            }

            if (dataFim.isBefore(dataInicio)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Informe dataInicio e dataFim para o intervalo personalizado");
            }

            inicio = dataInicio.atStartOfDay();
            fim = dataFim.plusDays(1).atStartOfDay();
        } else if (periodo != null) {
            LocalDate hoje = LocalDate.now(ZoneId.of("America/Sao_Paulo"));
            LocalDate primeiroDia = switch (periodo) {
                case HOJE -> hoje;
                case ULTIMOS_7_DIAS -> hoje.minusDays(6);
                case ULTIMOS_30_DIAS -> hoje.minusDays(29);
                case PERSONALIZADO -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
            };
            inicio = primeiroDia.atStartOfDay();
            fim = hoje.plusDays(1).atStartOfDay();
        }

        return repository.buscarComFiltros(turno, linha, inicio, fim);
    }


}
