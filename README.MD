# HIPPOGRIFF

> Interface web para dimensionar uma rede IPv4, distribuir sub-redes VLSM por VLAN e exportar o planejamento em formatos reutilizáveis.

## Ideia, Objetivo Principal e Público-Alvo

- **Ideia e objetivo:** centralizar o planejamento de uma rede IPv4 em um fluxo: definir a rede-base, segmentar por necessidade e associar VLANs, com exportação para documentação e ferramentas posteriores.
- **Público-alvo:** estudantes, pessoas desenvolvedoras e profissionais de redes que precisam consultar ou organizar endereçamento IPv4 e subdivisão de redes.
- **Problema:** ferramentas de rede baseadas em terminal/CLI exigem familiaridade com comandos, sintaxe e leitura de saídas textuais. Isso pode tornar a consulta de máscaras, faixas de hosts e distribuição de sub-redes menos visual e mais difícil de revisar.
- **Solução e valor:** o HIPPOGRIFF apresenta os cálculos e as alocações em uma workspace sequencial, incluindo mapa de ocupação, faixas de hosts, VLANs e arquivos exportáveis para facilitar revisão e implementação.

## Benchmarking

| Ferramenta | Pontos fortes | Limitações | Diferencial do HIPPOGRIFF |
| ---------- | ------------- | ---------- | ------------------------- |
| [Subnet-Calculator.net](https://www.subnet-calculator.net/) | Calcula sub-redes IPv4 e apresenta máscara, wildcard, sub-rede e faixa de hosts | Foco em uma consulta técnica isolada | Combina cálculo IPv4, distribuição VLSM por VLAN, visualização e exportação em um fluxo |

O site foi usado como referência por oferecer uma calculadora de sub-redes diretamente na web. O HIPPOGRIFF amplia o fluxo para planejamento e segmentação de redes.

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

A aplicação tem duas páginas principais, Início e Workspace, acessíveis pela navegação superior.

- **Início:** explica a finalidade da ferramenta e apresenta o fluxo de planejamento.
- **Mapa e resultados:** apresenta blocos alocados, espaço livre, CIDR, faixa de hosts, broadcast e capacidade por segmento.
- **Workspace:** guia a definição da rede-base e a distribuição de sub-redes VLSM associadas a VLANs.
- **Navegação responsiva:** o layout se adapta a desktop, tablet e dispositivos móveis.

## Funcionalidades Presentes Atualmente

- [x] Página inicial explicativa com acesso à workspace.
- [x] Cálculo IPv4 sob demanda, com entrada de CIDR/máscara ou apenas quantidade de hosts.
- [x] Alocação VLSM na rede-base, com validação de capacidade e VLAN IDs únicos.
- [x] Mapa visual de ocupação, faixas de hosts e broadcast por segmento.
- [x] Exportação do plano em JSON e do diagrama Mermaid (`.mmd`).
- [x] Navegação responsiva entre Início e Workspace.

> O diagrama ilustrativo da página inicial é um exemplo visual. O mapa, a alocação VLSM/VLAN e os arquivos exportados na workspace são calculados a partir das entradas do usuário.

## Funcionalidades Planejadas

- [ ] Filtro e busca dinâmica por IP, host e status dos serviços de rede (HTTP, DNS, SSH e DHCP).
- [x] API provisória via `json-server` para cadastro de usuários e persistência de sub-redes relacionadas por `userId`.
- [x] Cadastro, login e logout demonstrativos; conta opcional para salvar configurações da Calculadora IPv4.
- [ ] Servidor de API RESTful em Express.js para coleta e gerenciamento dos nós de rede (Projeto 1.2).
- [ ] Persistência de métricas, histórico de uptime e incidentes em banco de dados com Prisma ORM.
- [ ] Notificação automática de falhas de serviço e exportação de relatórios de tráfego e disponibilidade.
- [x] Cálculos interativos de IPv4 e persistência de suas configurações para contas autenticadas.
- [x] Distribuição dinâmica de sub-redes VLSM por requisito de hosts e VLAN.
- [ ] Exportação de configurações específicas por fabricante e modelo de equipamento.

## Estratégia para Obtenção de Dados Reais

Nas próximas etapas, a ferramenta poderá integrar inventário e configurações de equipamentos reais:

- **Fontes de dados e coleta:** execução de comandos de rede via CLI/Bash no sistema operacional, parsing de arquivos de log do Linux, chamadas de sistema e uso de bibliotecas de monitoramento ou APIs/SNMP.
- **Armazenamento e API:** criação de rotas HTTP em Express.js para expor os dados coletados, com persistência em banco de dados relacional usando Prisma ORM.
- **Evolução da interface:** geração de configurações por fabricante/modelo e integração de inventário/IPAM, mantendo o mapa de sub-redes como ponto de revisão.

## Formatos e Integrações de Rede

- **JSON (`.json`):** formato canônico atual para guardar a rede-base, os segmentos e as VLANs; fácil de validar, versionar e consumir por scripts ou APIs.
- **Mermaid (`.mmd`):** diagrama textual exportado pela workspace; pode ser renderizado e editado no Mermaid Live Editor e em outras ferramentas compatíveis.
- **draw.io (`.drawio`):** boa evolução quando for necessário posicionar ícones, portas, switches e enlaces manualmente; o formato é XML do diagrams.net.
- **Configuração de equipamento:** gerar CLI apenas após selecionar fabricante, família e versão (por exemplo Cisco IOS, Aruba AOS-CX ou Juniper Junos). Não há um arquivo de comandos universal para todos os switches.
- **Inventário/IPAM:** integração futura com NetBox pode transformar o plano validado em prefixos e VLANs rastreáveis.

## Como Executar

Requer Node.js e npm. Instale as dependências e execute o frontend e a API provisória em terminais separados:

```bash
npm install
npm run api
npm run dev
```

O Vite abre a aplicação em `http://localhost:5173` e o JSON Server disponibiliza a API em `http://localhost:3001`. Os dados ficam em `db.json`; o JSON Server grava alterações nesse arquivo.

### Contas e sub-redes

- O cálculo IPv4 funciona sem login. Entre ou crie uma conta somente quando quiser salvar uma configuração.
- Cada item de `subnetworks` guarda `userId`, relacionando a configuração ao usuário de `users`. A API lista as redes por esse identificador.
- Esta autenticação é apenas demonstrativa: o JSON Server não valida sessões, e as senhas ficam em texto simples. Não use senhas reais nem publique esse backend como serviço de produção.

Para verificar o projeto, execute `npm test` e `npm run build`.
