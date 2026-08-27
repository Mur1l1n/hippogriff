# HIPPOGRIFF

> Interface web para apoiar o planejamento de redes IPv4, com uma visão geral de redes, uma calculadora de endereçamento e um planejador visual de sub-redes VLSM.

## Ideia, Objetivo Principal e Público-Alvo

- **Ideia e objetivo:** centralizar, em uma interface web simples, as informações usadas no planejamento de redes IPv4. A versão atual apresenta uma visão geral do workspace, exemplos de cálculos IPv4 e uma distribuição VLSM organizada em tabela.
- **Público-alvo:** estudantes, pessoas desenvolvedoras e profissionais de redes que precisam consultar ou organizar endereçamento IPv4 e subdivisão de redes.
- **Problema:** ferramentas de rede baseadas em terminal/CLI exigem familiaridade com comandos, sintaxe e leitura de saídas textuais. Isso pode tornar a consulta de máscaras, faixas de hosts e distribuição de sub-redes menos visual e mais difícil de revisar.
- **Solução e valor:** o HIPPOGRIFF transforma essas informações em uma experiência visual com métricas, cards, tabelas e saídas em formato de terminal. Assim, o planejamento pode ser compreendido e apresentado com mais facilidade, mantendo uma referência textual dos resultados.

## Benchmarking

| Ferramenta | Pontos fortes | Limitações | Diferencial do HIPPOGRIFF |
| ---------- | ------------- | ---------- | ------------------------- |
| [Subnet-Calculator.net](https://www.subnet-calculator.net/) | Calcula sub-redes IPv4 e apresenta máscara, wildcard, sub-rede e faixa de hosts | Foco em uma consulta técnica isolada; não apresenta um workspace de planejamento com atividades e visão consolidada | Reúne Dashboard, exemplos de endereçamento IPv4 e planejamento VLSM em uma interface única e orientada ao planejamento |

O site foi usado como referência por oferecer uma calculadora de sub-redes diretamente na web. O HIPPOGRIFF segue uma proposta mais focada na organização visual de planejamentos, com dados demonstrativos para redes e departamentos.

## Equipe

- **Rychardson** - 20251380026 | [GitHub](https://github.com/Rychard2107)
- **Murilo Jansen** - 20242380005 | [GitHub](https://github.com/Mur1l1n)


## Documentação e Recursos

- **Aplicação:** [Abrir a interface](index.html)
- **Código-fonte:** este repositório
- **Protótipos e design:** ainda não publicados neste repositório
- **Workflow/Kanban:** ainda não publicado neste repositório
- **Documentação complementar:** ainda não publicada neste repositório

## Páginas e Telas da Aplicação

A aplicação atual é uma página única com navegação por seções:

- **Dashboard / Visão geral:** apresenta o workspace “Núcleo de redes”, métricas demonstrativas, planejamentos recentes e atalhos para IPv4 e VLSM.
- **Calculadora IPv4:** exibe endereço, CIDR/máscara, quantidade de hosts, primeiro e último host, broadcast e total de endereços usando dados demonstrativos.
- **Planejador VLSM:** apresenta uma rede base, requisitos de hosts por departamento, uma tabela de distribuição e a saída textual do planejamento.
- **Navegação responsiva:** o layout se adapta a desktop, tablet e dispositivos móveis.

## Funcionalidades Presentes Atualmente

- [x] Dashboard com workspace, métricas de redes e hosts e lista de planejamentos recentes.
- [x] Atalhos para os módulos de planejamento IPv4 e VLSM.
- [x] Tela demonstrativa de endereçamento IPv4 com rede, máscara, hosts utilizáveis, primeiro host, último host e broadcast.
- [x] Tela demonstrativa de planejamento VLSM com rede base, requisitos por departamento e mapa de sub-redes.
- [x] Saídas textuais em formato de terminal para apoiar a leitura dos resultados exibidos.
- [x] Layout responsivo para as telas disponíveis.
- [x] Identidade visual própria com navegação lateral, cards, badges, tabelas e indicadores visuais.

> Os resultados e métricas exibidos atualmente são estáticos e servem como dados de demonstração. Os campos e botões presentes na interface ainda não executam cálculos ou salvam alterações.

## Funcionalidades Planejadas

- [ ] Filtro e busca dinâmica por IP, host e status dos serviços de rede (HTTP, DNS, SSH e DHCP).
- [ ] Consumo de API simulada via `json-server` com dados dinâmicos de servidores e incidentes (Projeto 1.1).
- [ ] Autenticação e controle de acesso de operadores de rede, com Login/Logout e JWT.
- [ ] Servidor de API RESTful em Express.js para coleta e gerenciamento dos nós de rede (Projeto 1.2).
- [ ] Persistência de métricas, histórico de uptime e incidentes em banco de dados com Prisma ORM.
- [ ] Notificação automática de falhas de serviço e exportação de relatórios de tráfego e disponibilidade.
- [ ] Cálculos interativos de IPv4 e geração dinâmica de distribuições VLSM.

## Estratégia para Obtenção de Dados Reais

Nas próximas etapas, os dados demonstrativos poderão ser substituídos por informações coletadas de ambientes reais:

- **Fontes de dados e coleta:** execução de comandos de rede via CLI/Bash no sistema operacional, parsing de arquivos de log do Linux, chamadas de sistema e uso de bibliotecas de monitoramento ou APIs/SNMP.
- **Armazenamento e API:** criação de rotas HTTP em Express.js para expor os dados coletados, com persistência em banco de dados relacional usando Prisma ORM.
- **Evolução da interface:** substituição dos valores estáticos por respostas da API, mantendo o Dashboard, a consulta de redes, o mapa VLSM e o histórico de incidentes como pontos centrais da experiência.

## Como Executar

Como a versão atual é composta por HTML e CSS, abra o arquivo [index.html](index.html) diretamente no navegador. Não há servidor, banco de dados ou instalação de dependências necessária para visualizar a interface atual.
