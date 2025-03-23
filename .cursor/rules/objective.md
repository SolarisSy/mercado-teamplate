### Objective – 2025-03-24

**Tarefa principal:**  
Desenvolver um scraper para extrair produtos e imagens do site www.apoioentrega.com em tempo real, integrá-los ao nosso sistema e implementar um sistema de importação automática.

**Contexto técnico:**  
- Temos acesso a um arquivo HAR com todas as requisições do site alvo
- Precisamos identificar as APIs que retornam dados de produtos e imagens
- O sistema deve ser capaz de extrair nome dos produtos, preços, categorias e URLs das imagens
- Os dados extraídos devem ser importados automaticamente para nossa loja
- A interface deve permitir controle manual e automático da importação

**Requisitos:**  
- Analisar o arquivo HAR para identificar endpoints relevantes da API
- Desenvolver módulo de scraping usando NestJS/Express
- Implementar mecanismos para extrair nomes de produtos e URLs de imagens
- Adicionar opção de filtragem de produtos
- Garantir que a extração seja feita respeitando limites de requisição
- Implementar sistema de cache para evitar requisições repetidas
- Criar sistema de importação automática que execute em intervalos regulares
- Desenvolver interface visual para controlar e monitorar o processo de importação
- Implementar verificação de duplicatas para evitar produtos repetidos

**Critérios de sucesso:**  
- Identificação correta dos endpoints da API do site alvo
- Extração precisa de dados de produtos e imagens
- Código modular e facilmente manutenível
- Documentação detalhada do processo e endpoints identificados
- Atualização de `mapsource.md` e `memorie.md` com o novo desenvolvimento
- Sistema de importação automática funcionando sem intervenção manual
- Interface visual para controle e monitoramento da importação
- Sistema robusto para verificação de duplicatas e gerenciamento de erros
