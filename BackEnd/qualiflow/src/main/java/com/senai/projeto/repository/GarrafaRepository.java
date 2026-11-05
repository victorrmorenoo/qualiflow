package com.senai.projeto.repository;

import com.senai.projeto.model.Garrafa;
import org.springframework.cglib.core.Local;
import org.springframework.data.jpa.repository.JpaRepository;
import com.senai.projeto.enums.Turno;
import com.senai.projeto.enums.LinhaSopro;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface GarrafaRepository extends JpaRepository<Garrafa, Long> {
    List<Garrafa> findByTurno(Turno turno);

    @Query("select g from Garrafa g where g.linha_sopro = :linha")
    List<Garrafa> findByLinhaSopro(@Param("linha") LinhaSopro linha);

    @Query("select g from Garrafa g where g.linha_sopro = :linha and g.turno = :turno")
    List<Garrafa> findByLinhaSoproETurno(@Param("linha") LinhaSopro linha, @Param("turno") Turno turno);

    @Query("""
        select g from Garrafa g
        where g.data_hora >= :inicio and g.data_hora < :fim
        """)
    List<Garrafa> findPorPeriodo(@Param("inicio") LocalDateTime inicio, @Param("fim")LocalDateTime fim);

    @Query("""
    select g from Garrafa g
    where (:turno is null or g.turno = :turno)
      and (:linha is null or g.linha_sopro = :linha)
      and (:inicio is null or g.data_hora >= :inicio)
      and (:fim is null or g.data_hora < :fim)
    """)
    List<Garrafa> buscarComFiltros(
            @Param("turno") Turno turno,
            @Param("linha") LinhaSopro linha,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim);
}
