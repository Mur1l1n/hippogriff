import { useState } from "react";
import { calculateIPv4Network, parseCidrOrMask } from "../ipv4/ipv4Utils";
import { allocateVlsm } from "../ipv4/vlsmUtils";

const createDraft = (plan) => {
  const savedRequirements = plan.requirements?.length
    ? plan.requirements
    : plan.allocations || [];
  return {
    name: plan.name || "",
    ipv4: plan.ipv4 || plan.result?.ipv4 || "",
    cidr: String(plan.cidr ?? 24),
    requiredHosts: String(plan.requiredHosts || ""),
    requirements: savedRequirements.map((item, index) => ({
      id: index,
      name: item.name || "",
      vlan: String(item.vlan ?? (index + 1) * 10),
      hosts: String(item.hosts ?? ""),
    })),
  };
};

export function SubnetworkDetails({
  user,
  subnetworks,
  saveMessage,
  onRequestLogin,
  onUpdate,
  onDelete,
}) {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [editError, setEditError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const startEditing = (plan) => {
    setEditingId(plan.id);
    setDraft(createDraft(plan));
    setEditError("");
  };

  const updateDraft = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const updateRequirement = (index, field, value) => {
    setDraft((current) => ({
      ...current,
      requirements: current.requirements.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const handleUpdate = async (event, planId) => {
    event.preventDefault();
    setEditError("");
    setBusyId(planId);

    try {
      const cidr = parseCidrOrMask(draft.cidr);
      const requiredHosts = draft.requiredHosts.trim()
        ? Number(draft.requiredHosts)
        : 0;
      const result = calculateIPv4Network(
        draft.ipv4.trim(),
        cidr,
        requiredHosts,
      );
      const requirements = draft.requirements.map(({ name, vlan, hosts }) => ({
        name: name.trim(),
        vlan: Number(vlan),
        hosts: Number(hosts),
      }));
      const allocations = requirements.length
        ? allocateVlsm(result.network, cidr, requirements)
        : [];

      await onUpdate(planId, {
        name: draft.name.trim() || `${result.network}${result.subnetting}`,
        ipv4: result.ipv4,
        cidr,
        requiredHosts,
        result,
        requirements,
        allocations: allocations.map(
          ({ id, originalIndex, offset, ...allocation }) => allocation,
        ),
      });
      setEditingId(null);
      setDraft(null);
    } catch (error) {
      setEditError(error.message || "Não foi possível atualizar a sub-rede.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (planId) => {
    setBusyId(planId);
    await onDelete(planId);
    setBusyId(null);
  };

  return (
    <main className="workspace-page subnetwork-details-page">
      <section className="workspace-heading">
        <div>
          <p className="kicker">
            <span className="kicker-line"></span> Planejamentos salvos
          </p>
          <h1>
            Detalhes das sub-redes<span className="yellow-dot">.</span>
          </h1>
          <p className="lead">
            Consulte e mantenha seus planos de rede e suas VLANs.
          </p>
        </div>
        <span className="workspace-status">
          {subnetworks.length} {subnetworks.length === 1 ? "PLANO" : "PLANOS"}
        </span>
      </section>

      {saveMessage && (
        <p className="save-feedback detail-feedback" role="status">
          {saveMessage}
        </p>
      )}

      {!user ? (
        <section className="panel detail-empty-state">
          <h2>Entre para ver seus planejamentos</h2>
          <p>As sub-redes salvas ficam associadas à sua conta.</p>
          <button
            className="button button-primary"
            type="button"
            onClick={onRequestLogin}
          >
            Entrar
          </button>
        </section>
      ) : subnetworks.length === 0 ? (
        <section className="panel detail-empty-state">
          <h2>Nenhuma sub-rede salva</h2>
          <p>
            Conclua um planejamento na workspace e salve-o para consultar os
            detalhes aqui.
          </p>
          <a className="button button-primary" href="#workspace">
            Abrir workspace
          </a>
        </section>
      ) : (
        <div className="subnetwork-detail-list">
          {subnetworks.map((plan) => (
            <article className="panel subnet-detail-card" key={plan.id}>
              <div className="subnet-detail-heading">
                <div>
                  <p className="panel-kicker">
                    {plan.createdAt
                      ? new Date(plan.createdAt).toLocaleString("pt-BR")
                      : "PLANEJAMENTO SALVO"}
                  </p>
                  <h2>{plan.name}</h2>
                </div>
                <div className="subnet-detail-actions">
                  <button
                    className="button button-outline"
                    type="button"
                    onClick={() => startEditing(plan)}
                  >
                    Editar
                  </button>
                  <button
                    className="button button-danger"
                    type="button"
                    disabled={busyId === plan.id}
                    onClick={() => handleDelete(plan.id)}
                  >
                    {busyId === plan.id ? "Aguarde..." : "Excluir"}
                  </button>
                </div>
              </div>

              {editingId === plan.id && draft ? (
                <form
                  className="subnetwork-edit-form"
                  onSubmit={(event) => handleUpdate(event, plan.id)}
                >
                  <div className="subnetwork-edit-base">
                    <label>
                      Nome do planejamento
                      <input
                        required
                        value={draft.name}
                        onChange={(event) =>
                          updateDraft("name", event.target.value)
                        }
                      />
                    </label>
                    <label>
                      Endereço IPv4
                      <input
                        required
                        value={draft.ipv4}
                        onChange={(event) =>
                          updateDraft("ipv4", event.target.value)
                        }
                      />
                    </label>
                    <label>
                      CIDR ou máscara
                      <input
                        required
                        value={draft.cidr}
                        onChange={(event) =>
                          updateDraft("cidr", event.target.value)
                        }
                      />
                    </label>
                    <label>
                      Hosts necessários
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={draft.requiredHosts}
                        onChange={(event) =>
                          updateDraft("requiredHosts", event.target.value)
                        }
                      />
                    </label>
                  </div>
                  <div className="detail-vlan-heading">
                    <h3>Sub-redes VLAN</h3>
                    <button
                      className="button button-outline"
                      type="button"
                      onClick={() =>
                        setDraft((current) => ({
                          ...current,
                          requirements: [
                            ...current.requirements,
                            {
                              id: Date.now(),
                              name: "",
                              vlan: String(
                                (current.requirements.length + 1) * 10,
                              ),
                              hosts: "",
                            },
                          ],
                        }))
                      }
                    >
                      + Adicionar VLAN
                    </button>
                  </div>
                  {draft.requirements.length > 0 && (
                    <div className="detail-vlan-list">
                      {draft.requirements.map((item, index) => (
                        <div className="detail-vlan-edit-row" key={item.id}>
                          <input
                            aria-label="Nome da VLAN"
                            placeholder="Nome do segmento"
                            value={item.name}
                            onChange={(event) =>
                              updateRequirement(
                                index,
                                "name",
                                event.target.value,
                              )
                            }
                          />
                          <input
                            aria-label="ID da VLAN"
                            type="number"
                            min="1"
                            max="4094"
                            value={item.vlan}
                            onChange={(event) =>
                              updateRequirement(
                                index,
                                "vlan",
                                event.target.value,
                              )
                            }
                          />
                          <input
                            aria-label="Hosts da VLAN"
                            type="number"
                            min="1"
                            value={item.hosts}
                            onChange={(event) =>
                              updateRequirement(
                                index,
                                "hosts",
                                event.target.value,
                              )
                            }
                          />
                          <button
                            className="remove-button"
                            type="button"
                            aria-label="Remover VLAN"
                            onClick={() =>
                              setDraft((current) => ({
                                ...current,
                                requirements: current.requirements.filter(
                                  (_, itemIndex) => itemIndex !== index,
                                ),
                              }))
                            }
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {editError && (
                    <p className="plan-error" role="alert">
                      {editError}
                    </p>
                  )}
                  <div className="detail-edit-actions">
                    <button
                      className="button button-outline"
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setDraft(null);
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      className="button button-primary"
                      type="submit"
                      disabled={busyId === plan.id}
                    >
                      {busyId === plan.id ? "Salvando..." : "Salvar alterações"}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="subnet-detail-summary">
                    <div>
                      <span>Rede</span>
                      <strong>
                        {plan.result?.network || plan.ipv4}/
                        {plan.result?.subnetting || `/${plan.cidr}`}
                      </strong>
                    </div>
                    <div>
                      <span>Máscara</span>
                      <strong>{plan.result?.mask || "Não informada"}</strong>
                    </div>
                    <div>
                      <span>Hosts utilizáveis</span>
                      <strong>{plan.result?.hosts ?? "Não informado"}</strong>
                    </div>
                    <div>
                      <span>Broadcast</span>
                      <strong>
                        {plan.result?.broadcast || "Não informado"}
                      </strong>
                    </div>
                  </div>
                  <section className="detail-vlan-section">
                    <h3>VLANs e sub-redes</h3>
                    {plan.allocations?.length ? (
                      <div className="detail-vlan-list">
                        {plan.allocations.map((allocation) => (
                          <div
                            className="detail-vlan-view-row"
                            key={allocation.vlan}
                          >
                            <strong>VLAN {allocation.vlan}</strong>
                            <span>{allocation.name}</span>
                            <span>
                              {allocation.network}/{allocation.cidr}
                            </span>
                            <small>
                              {allocation.hosts} hosts solicitados · broadcast{" "}
                              {allocation.broadcast}
                            </small>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="saved-empty">
                        Este plano não possui VLANs salvas.
                      </p>
                    )}
                  </section>
                </>
              )}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
