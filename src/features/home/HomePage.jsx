const workflow = [
  {
    number: "01",
    title: "Defina a rede",
    text: "Escolha o endereço, a máscara e os hosts necessários. O cálculo mostra os limites e a capacidade disponíveis.",
  },
  {
    number: "02",
    title: "Segmente por necessidade",
    text: "Separe departamentos em sub-redes VLSM e vincule um identificador VLAN para cada segmento.",
  },
  {
    number: "03",
    title: "Salve suas configurações",
    text: "Confira endereços, faixas e capacidade em uma visão prática. Edite e salve suas configurações.",
  },
];

export function HomePage() {
  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="hero-copy">
          <p className="kicker">
            <span className="kicker-line"></span> Planejamento visual de redes
          </p>
          <h1>
            Da rede base a uma configuração <em>pronta para planejar</em>
            <span className="yellow-dot">.</span>
          </h1>
          <p className="hero-lead">
            HIPPOGRIFF ajuda você a dimensionar endereços IPv4, distribuir
            sub-redes e organizar VLANs em um único fluxo guiado.
          </p>
          <a className="button button-primary" href="#workspace">
            Abrir workspace <span aria-hidden="true">→</span>
          </a>
        </div>
        <div
          className="hero-visual"
          aria-label="Prévia visual de uma rede segmentada"
        >
          <div className="visual-topline">
            <span>NETWORK MAP</span>
            <span className="live-mark">PLANEJAMENTO</span>
          </div>
          <div className="network-root">
            <span className="root-symbol">⌁</span>
            <span>
              <small>REDE BASE</small>
              <strong>10.20.0.0/24</strong>
            </span>
          </div>
          <div className="network-branches">
            <div className="branch-line"></div>
            <div className="branch-node">
              <span className="vlan-mark cyan-mark">V10</span>
              <span>
                <strong>Operações</strong>
                <small>10.20.0.0/26</small>
              </span>
            </div>
            <div className="branch-node">
              <span className="vlan-mark yellow-mark">V20</span>
              <span>
                <strong>Administrativo</strong>
                <small>10.20.0.64/27</small>
              </span>
            </div>
            <div className="branch-node">
              <span className="vlan-mark coral-mark">V30</span>
              <span>
                <strong>Laboratório</strong>
                <small>10.20.0.96/28</small>
              </span>
            </div>
          </div>
          <div className="visual-foot">
            <span>VISUALIZAÇÃO DE EXEMPLO</span>
            <span>IPv4 · VLSM · VLAN</span>
          </div>
        </div>
      </section>

      <section className="home-intro">
        <div>
          <p className="panel-kicker">O que é</p>
          <h2>Planejamento de rede, em etapas compreensíveis.</h2>
        </div>
        <p>
          Em vez de alternar entre cálculos, planilhas e anotações, você parte
          de uma rede base, define a demanda de cada grupo e revisa a divisão
          antes de implementar. O cálculo permanece utilizável sem login; uma
          conta é necessária apenas para salvar configurações.
        </p>
      </section>

      <section className="workflow-section">
        <div className="workflow-heading">
          <p className="panel-kicker">Um fluxo guiado</p>
          <h2>Do endereço à segmentação</h2>
        </div>
        <div className="workflow-list">
          {workflow.map((step) => (
            <article className="workflow-item" key={step.number}>
              <span className="workflow-number">{step.number}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
              <span className="workflow-arrow" aria-hidden="true">
                ↗
              </span>
            </article>
          ))}
        </div>
        <a className="workspace-link" href="#workspace">
          Começar um planejamento <span aria-hidden="true">→</span>
        </a>
      </section>
    </main>
  );
}
