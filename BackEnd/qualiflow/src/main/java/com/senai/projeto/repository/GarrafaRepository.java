package com.senai.projeto.repository;

import com.senai.projeto.model.Garrafa;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GarrafaRepository extends JpaRepository<Garrafa, Long> {
}
