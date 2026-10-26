package com.senai.projeto.model;

import com.senai.projeto.enums.*;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "garrafas")
public class Garrafa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id_registro;
    private LocalDateTime data_hora;

    @Enumerated(EnumType.STRING)
    private LinhaSopro linha_sopro;

    @Enumerated(EnumType.STRING)
    private Turno turno;

    @Enumerated(EnumType.STRING)
    private StatusQualidade status_qualidade;

    private double massa_g;
    private double espessura_corpo_mm;
    private double espessura_ombro_mm;
    private double diametro_gargalo_mm;
    private double altura_mm;
    private double volume_util_ml;
    private double uniformidade_parede_pct;
    private double conformidade_dimensional_pct;
    private String arquivo_origem;
    private String usuario_importacao;

    public Garrafa() {
    }

    public Garrafa(Long id_registro, LocalDateTime data_hora, LinhaSopro linha_sopro, Turno turno, StatusQualidade status_qualidade, double massa_g, double espessura_corpo_mm, double espessura_ombro_mm, double diametro_gargalo_mm, double altura_mm, double volume_util_ml, double uniformidade_parede_pct, double conformidade_dimensional_pct, String arquivo_origem, String usuario_importacao) {
        this.id_registro = id_registro;
        this.data_hora = data_hora;
        this.linha_sopro = linha_sopro;
        this.turno = turno;
        this.status_qualidade = status_qualidade;
        this.massa_g = massa_g;
        this.espessura_corpo_mm = espessura_corpo_mm;
        this.espessura_ombro_mm = espessura_ombro_mm;
        this.diametro_gargalo_mm = diametro_gargalo_mm;
        this.altura_mm = altura_mm;
        this.volume_util_ml = volume_util_ml;
        this.uniformidade_parede_pct = uniformidade_parede_pct;
        this.conformidade_dimensional_pct = conformidade_dimensional_pct;
        this.arquivo_origem = arquivo_origem;
        this.usuario_importacao = usuario_importacao;
    }

    public Long getId_registro() {
        return id_registro;
    }

    public void setId_registro(Long id_registro) {
        this.id_registro = id_registro;
    }

    public LocalDateTime getData_hora() {
        return data_hora;
    }

    public void setData_hora(LocalDateTime data_hora) {
        this.data_hora = data_hora;
    }

    public LinhaSopro getLinha_sopro() {
        return linha_sopro;
    }

    public void setLinha_sopro(LinhaSopro linha_sopro) {
        this.linha_sopro = linha_sopro;
    }

    public Turno getTurno() {
        return turno;
    }

    public void setTurno(Turno turno) {
        this.turno = turno;
    }

    public StatusQualidade getStatus_qualidade() {
        return status_qualidade;
    }

    public void setStatus_qualidade(StatusQualidade status_qualidade) {
        this.status_qualidade = status_qualidade;
    }

    public double getMassa_g() {
        return massa_g;
    }

    public void setMassa_g(double massa_g) {
        this.massa_g = massa_g;
    }

    public double getEspessura_corpo_mm() {
        return espessura_corpo_mm;
    }

    public void setEspessura_corpo_mm(double espessura_corpo_mm) {
        this.espessura_corpo_mm = espessura_corpo_mm;
    }

    public double getEspessura_ombro_mm() {
        return espessura_ombro_mm;
    }

    public void setEspessura_ombro_mm(double espessura_ombro_mm) {
        this.espessura_ombro_mm = espessura_ombro_mm;
    }

    public double getDiametro_gargalo_mm() {
        return diametro_gargalo_mm;
    }

    public void setDiametro_gargalo_mm(double diametro_gargalo_mm) {
        this.diametro_gargalo_mm = diametro_gargalo_mm;
    }

    public double getAltura_mm() {
        return altura_mm;
    }

    public void setAltura_mm(double altura_mm) {
        this.altura_mm = altura_mm;
    }

    public double getVolume_util_ml() {
        return volume_util_ml;
    }

    public void setVolume_util_ml(double volume_util_ml) {
        this.volume_util_ml = volume_util_ml;
    }

    public double getUniformidade_parede_pct() {
        return uniformidade_parede_pct;
    }

    public void setUniformidade_parede_pct(double uniformidade_parede_pct) {
        this.uniformidade_parede_pct = uniformidade_parede_pct;
    }

    public double getConformidade_dimensional_pct() {
        return conformidade_dimensional_pct;
    }

    public void setConformidade_dimensional_pct(double conformidade_dimensional_pct) {
        this.conformidade_dimensional_pct = conformidade_dimensional_pct;
    }

    public String getArquivo_origem() {
        return arquivo_origem;
    }

    public void setArquivo_origem(String arquivo_origem) {
        this.arquivo_origem = arquivo_origem;
    }

    public String getUsuario_importacao() {
        return usuario_importacao;
    }

    public void setUsuario_importacao(String usuario_importacao) {
        this.usuario_importacao = usuario_importacao;
    }
}
