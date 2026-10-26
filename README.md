# Qualiflow — Controle de Qualidade de Garrafas PET

> Plataforma web de controle de qualidade de garrafas PET de 2L. Dashboard com filtros por período, linha de sopro e turno, médias, tendências e classificação de conformidade (dentro do padrão, atenção, crítico), sobre base MySQL, API REST em Java/Spring Boot e infraestrutura AWS.

Projeto Integrador do 2º semestre de ADS, desenvolvido para a empresa fictícia **Insight Manufacturing Group**, indústria de transformação de polímeros.

A plataforma consolida as medições de inspeção de garrafas PET de 2 litros (massa, espessura do corpo e do ombro, diâmetro do gargalo, altura e volume útil) e as apresenta em um painel que permite à gestão acompanhar a conformidade da produção de forma histórica e comparável.

## Funcionalidades

- Carga da base de dados `08_qualidade_garrafas_pet_industrial.csv` (5.000 registros) em banco MySQL
- Classificação das medições em três zonas: dentro do padrão, fora do padrão (atenção) e muito fora do padrão (crítico)
- Dashboard com filtros por período, linha de sopro e turno
- Médias, mínimos, máximos, gráficos de tendência e lista de ocorrências fora do padrão
- Exportação dos dados filtrados

## Arquitetura

Banco de dados MySQL (Amazon RDS) → API REST em Java/Spring Boot (Amazon EC2) → Frontend web (Amazon S3) → usuário final.

## Equipe

| Integrante | Papel |
|---|---|
| Karen Tibério | Cloud |
| Luana Canto | DevOps e Ciência de Dados |
| Steffany Camargo | Front End |
| Victor Moreno | Back End |
