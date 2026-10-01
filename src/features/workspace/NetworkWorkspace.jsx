import { useState } from "react";
import { IPv4Calculator } from "../ipv4/components/IPv4Calculator";
import { allocateVlsm } from "../ipv4/vlsmUtils";

let nextRequirementId = 1;

const createRequirement = (index) => ({
  id: nextRequirementId++,
  name: "",
  vlan: String((index + 1) * 10),
  hosts: "",
});

export function NetworkWorkspace({
  user,
  saveMessage,
  onRequestLogin,
  onSave,
}) {
  const [step, setStep] = useState(1);
  const [basePlan, setBasePlan] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [allocations, setAllocations] = useState(null);
  const [planError, setPlanError] = useState("");
  const [planName, setPlanName] = useState("Meu planejamento");

  const handleNetworkCalculated = (plan) => {
    setBasePlan(plan);
    setAllocations(null);
    setPlanError("");
  };

  const updateRequirement = (id, field, value) => {
    setRequirements((current) =>
      current.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
    setAllocations(null);
    setPlanError("");
  };

  const addRequirement = () => {
    setRequirements((current) => [
      ...current,
      createRequirement(current.length),
    ]);
    setAllocations(null);
    setPlanError("");
  };

  const removeRequirement = (id) => {
    setRequirements((current) => current.filter((item) => item.id !== id));
    setAllocations(null);
    setPlanError("");
  };

  const calculateSegments = (event) => {
    event.preventDefault();
    try {
      if (requirements.length === 0)
        throw new Error(
          "Adicione ao menos uma rede/departamento para segmentar.",
        );
      const result = allocateVlsm(
        basePlan.result.network,
        basePlan.form.cidr,
        requirements,
      );
      setAllocations(result);
      setPlanError("");
    } catch (error) {
      setAllocations(null);
      setPlanError(error.message);
    }
  };

  const handleSave = () => {
    if (!basePlan || !allocations) return;
    if (!user) {
      onRequestLogin();
      return;
    }

    onSave({
      name:
        planName.trim() ||
        `${basePlan.result.network}${basePlan.result.subnetting}`,
      ...basePlan.form,
      result: basePlan.result,
      requirements: requirements.map(({ name, vlan, hosts }) => ({
        name: name.trim(),
        vlan: Number(vlan),
        hosts: Number(hosts),
      })),
      allocations: allocations.map(
        ({ id, originalIndex, offset, ...allocation }) => allocation,
      ),
    });
  };

  const baseSize = basePlan ? basePlan.result.totalAddresses : 0;
  const usedAddresses =
    allocations?.reduce((total, item) => total + item.totalAddresses, 0) || 0;
  const mapItems = allocations
    ? [...allocations].sort((left, right) => left.offset - right.offset)
    : [];

  return (
    <main className="workspace-page">
      <section className="workspace-heading">
        <div>
          <p className="kicker">
            <span className="kicker-line"></span> Workspace de planejamento
          </p>
          <h1>
            Monte sua rede<span className="yellow-dot">.</span>
          </h1>
          <p className="lead">
            Defina o espaço de endereçamento e depois distribua-o entre suas
            VLANs.
          </p>
        </div>
        <span className="workspace-status">
          {basePlan
            ? `${basePlan.result.network}${basePlan.result.subnetting}`
            : "NOVO PLANEJAMENTO"}
        </span>
      </section>

      <nav className="plan-stepper" aria-label="Etapas do planejamento">
        <button
          type="button"
          className={step === 1 ? "plan-step active" : "plan-step"}
          onClick={() => setStep(1)}
        >
          <span>01</span>
          <span>
            <strong>Rede base</strong>
            <small>Endereço e capacidade</small>
          </span>
        </button>
        <span className="step-connector" aria-hidden="true"></span>
        <button
          type="button"
          className={step === 2 ? "plan-step active" : "plan-step"}
          disabled={!basePlan}
          onClick={() => setStep(2)}
        >
          <span>02</span>
          <span>
            <strong>Sub-redes e VLANs</strong>
            <small>Segmentação VLSM</small>
          </span>
        </button>
      </nav>

      {step === 1 ? (
        <section className="workspace-step">
          <div className="step-intro">
            <span className="step-overline">ETAPA 1 DE 2</span>
            <h2>Escolha a rede base</h2>
            <p>
              Calcule os limites IPv4 que servirão de espaço para as sub-redes.
            </p>
          </div>
          <IPv4Calculator onCalculated={handleNetworkCalculated} />
          {basePlan && (
            <div className="continue-row">
              <p>
                <strong>Rede-base pronta.</strong> Espaço disponível:{" "}
                {basePlan.result.totalAddresses.toLocaleString("pt-BR")}{" "}
                endereços.
              </p>
              <button
                className="button button-primary"
                type="button"
                onClick={() => setStep(2)}
              >
                Continuar para VLANs <span aria-hidden="true">→</span>
              </button>
            </div>
          )}
        </section>
      ) : (
        <section className="workspace-step">
          <div className="step-intro">
            <span className="step-overline">
              ETAPA 2 DE 2 · REDE BASE {basePlan.result.network}
              {basePlan.result.subnetting}
            </span>
            <h2>Distribua sub-redes e VLANs</h2>
            <p>
              Informe a finalidade e os hosts de cada segmento. O espaço será
              alocado do maior para o menor.
            </p>
          </div>

          <form className="panel vlan-form-panel" onSubmit={calculateSegments}>
            <div className="vlan-form-heading">
              <div>
                <p className="panel-kicker">REQUISITOS DA REDE</p>
                <h3>Segmentos necessários</h3>
              </div>
              <button
                className="button button-outline"
                type="button"
                onClick={addRequirement}
              >
                + Adicionar segmento
              </button>
            </div>
            {requirements.length === 0 ? (
              <div className="requirements-empty">
                <span aria-hidden="true">＋</span>
                <p>Comece adicionando um departamento ou segmento.</p>
              </div>
            ) : (
              <div className="vlan-table-wrap">
                <div className="vlan-table vlan-table-header">
                  <span>Nome do segmento</span>
                  <span>VLAN ID</span>
                  <span>Hosts</span>
                  <span></span>
                </div>
                {requirements.map((item) => (
                  <div className="vlan-table vlan-table-row" key={item.id}>
                    <input
                      aria-label="Nome do segmento"
                      placeholder="Ex.: Operações"
                      value={item.name}
                      onChange={(event) =>
                        updateRequirement(item.id, "name", event.target.value)
                      }
                    />
                    <input
                      aria-label="VLAN ID"
                      type="number"
                      min="1"
                      max="4094"
                      placeholder="10"
                      value={item.vlan}
                      onChange={(event) =>
                        updateRequirement(item.id, "vlan", event.target.value)
                      }
                    />
                    <input
                      aria-label="Hosts necessários"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="50"
                      value={item.hosts}
                      onChange={(event) =>
                        updateRequirement(item.id, "hosts", event.target.value)
                      }
                    />
                    <button
                      className="remove-button"
                      type="button"
                      aria-label="Remover segmento"
                      onClick={() => removeRequirement(item.id)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            {planError && (
              <p className="plan-error" role="alert">
                {planError}
              </p>
            )}
            <div className="vlan-form-footer">
              <p>
                Base:{" "}
                <strong>
                  {basePlan.result.network}
                  {basePlan.result.subnetting}
                </strong>{" "}
                · capacidade{" "}
                <strong>
                  {basePlan.result.hosts.toLocaleString("pt-BR")} hosts
                </strong>
              </p>
              <button
                className="button button-primary"
                type="submit"
                disabled={requirements.length === 0}
              >
                Distribuir sub-redes <span aria-hidden="true">→</span>
              </button>
            </div>
            {allocations && (
              <div className="plan-save-actions">
                <label>
                  Nome do planejamento
                  <input
                    value={planName}
                    onChange={(event) => setPlanName(event.target.value)}
                  />
                </label>
                <button
                  className="button button-primary"
                  type="button"
                  onClick={handleSave}
                >
                  {user ? "Salvar planejamento" : "Entrar para salvar"}
                </button>
                {saveMessage && <p role="status">{saveMessage}</p>}
              </div>
            )}
          </form>

          {allocations && (
            <div className="allocation-results" aria-live="polite">
              <div className="allocation-title">
                <div>
                  <p className="panel-kicker">MAPA DE ENDEREÇAMENTO</p>
                  <h3>Distribuição calculada</h3>
                </div>
                <span>{allocations.length} VLANs</span>
              </div>
              <section className="panel address-map-panel">
                <div className="address-map-labels">
                  <strong>{basePlan.result.network}</strong>
                  <span>
                    Utilizado {Math.round((usedAddresses / baseSize) * 100)}% do
                    espaço
                  </span>
                  <strong>{basePlan.result.broadcast}</strong>
                </div>
                <div
                  className="address-map"
                  role="img"
                  aria-label={`Mapa de ${allocations.length} sub-redes dentro de ${basePlan.result.network}${basePlan.result.subnetting}`}
                >
                  {mapItems.map((item) => (
                    <span
                      key={item.vlan}
                      className="address-map-segment"
                      title={`VLAN ${item.vlan}: ${item.network}/${item.cidr}`}
                      style={{
                        left: `${(item.offset / baseSize) * 100}%`,
                        width: `${(item.totalAddresses / baseSize) * 100}%`,
                      }}
                    ></span>
                  ))}
                  <span
                    className="address-map-free"
                    style={{
                      left: `${(usedAddresses / baseSize) * 100}%`,
                      width: `${Math.max(0, 100 - (usedAddresses / baseSize) * 100)}%`,
                    }}
                  ></span>
                </div>
                <div className="address-map-legend">
                  <span>
                    <i className="legend-used"></i> Sub-redes alocadas
                  </span>
                  <span>
                    <i className="legend-free"></i> Espaço livre
                  </span>
                </div>
              </section>

              <div className="allocation-list">
                {allocations.map((item, index) => (
                  <article className="allocation-row" key={item.vlan}>
                    <span className={`vlan-badge vlan-tone-${index % 4}`}>
                      V{item.vlan}
                    </span>
                    <div className="allocation-name">
                      <strong>{item.name}</strong>
                      <small>
                        {item.hosts} hosts solicitados · {item.hosts} de{" "}
                        {item.totalAddresses - 2} disponíveis
                      </small>
                    </div>
                    <div className="allocation-network">
                      <strong>
                        {item.network}/{item.cidr}
                      </strong>
                      <small>
                        {item.firstHost} – {item.lastHost}
                      </small>
                    </div>
                    <div className="allocation-broadcast">
                      <small>Broadcast</small>
                      <strong>{item.broadcast}</strong>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          <button
            className="back-step"
            type="button"
            onClick={() => setStep(1)}
          >
            ← Voltar à rede base
          </button>
        </section>
      )}
    </main>
  );
}
