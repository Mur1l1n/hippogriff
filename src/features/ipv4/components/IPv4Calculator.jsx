import { useState } from 'react';
import { calculateIPv4Network, getCidrForHosts, parseCidrOrMask } from '../ipv4Utils';

const DEFAULT_IPV4 = '192.168.1.0';
const EMPTY_FORM = { ipv4: '', cidr: '', requiredHosts: '' };

export function IPv4Calculator({ user, subnetworks = [], saveMessage, onRequestLogin, onSave, onLoad, onCalculated }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [calculated, setCalculated] = useState(null);
  const [planName, setPlanName] = useState('Minha sub-rede');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors({});
    setCalculated(null);
  };

  const handleLoad = (configuration) => {
    const loadedForm = {
      ipv4: configuration.ipv4 || '',
      cidr: String(configuration.cidr ?? ''),
      requiredHosts: configuration.requiredHosts ? String(configuration.requiredHosts) : '',
    };
    const ipv4 = loadedForm.ipv4.trim() || DEFAULT_IPV4;
    const cidr = Number(loadedForm.cidr) || 24;
    const requiredHosts = Number(loadedForm.requiredHosts) || 0;
    const plan = { form: { ipv4, cidr, requiredHosts }, result: calculateIPv4Network(ipv4, cidr, requiredHosts) };
    setForm(loadedForm);
    setErrors({});
    setCalculated(plan);
    setPlanName(configuration.name);
    onCalculated?.(plan);
    onLoad(configuration);
  };

  const handleCalculate = (event) => {
    event.preventDefault();
    const nextErrors = {};
    let cidr;
    let requiredHosts = 0;

    if (form.cidr.trim()) {
      try {
        cidr = parseCidrOrMask(form.cidr);
      } catch (error) {
        nextErrors.cidr = error.message;
      }
    } else if (form.requiredHosts.trim()) {
      try {
        cidr = getCidrForHosts(form.requiredHosts);
      } catch (error) {
        nextErrors.requiredHosts = error.message;
      }
    } else {
      nextErrors.cidr = 'Informe o CIDR/máscara ou a quantidade de hosts.';
    }

    if (form.requiredHosts.trim()) {
      const parsedHosts = Number(form.requiredHosts);
      if (!Number.isInteger(parsedHosts) || parsedHosts < 1) {
        nextErrors.requiredHosts = 'Informe um número inteiro de hosts maior que zero.';
      } else {
        requiredHosts = parsedHosts;
        if (cidr !== undefined && calculateIPv4Network(DEFAULT_IPV4, cidr).hosts < parsedHosts) {
          nextErrors.requiredHosts = `Essa máscara comporta até ${calculateIPv4Network(DEFAULT_IPV4, cidr).hosts} hosts.`;
        }
      }
    }

    const ipv4 = form.ipv4.trim() || DEFAULT_IPV4;
    try {
      const result = calculateIPv4Network(ipv4, cidr ?? 24, requiredHosts);
      if (Object.keys(nextErrors).length > 0) {
        setErrors(nextErrors);
        setCalculated(null);
        return;
      }

      setErrors({});
      const plan = {
        form: { ipv4, cidr, requiredHosts },
        result,
      };
      setCalculated(plan);
      onCalculated?.(plan);
    } catch (error) {
      nextErrors.ipv4 = error.message;
      setErrors(nextErrors);
      setCalculated(null);
    }
  };

  const handleSave = () => {
    if (!calculated) return;
    onSave({
      name: planName.trim() || `${calculated.result.network}${calculated.result.subnetting}`,
      ...calculated.form,
      result: calculated.result,
    });
  };

  const result = calculated?.result;

  return (
    <section id="ipv4" className="page-section tool-section">
      <div className="section-heading compact-heading">
        <div>
          <p className="kicker"><span className="kicker-line"></span> Ferramenta de endereçamento</p>
          <h1>Calculadora <em>IPv4</em><span className="yellow-dot">.</span></h1>
          <p className="lead">Modele uma rede e visualize seus limites de endereçamento.</p>
        </div>
        <span className="mock-badge">IPv4 · SUB-REDES</span>
      </div>

      <div className="tool-layout">
        <form className="panel form-panel" onSubmit={handleCalculate} noValidate>
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Entradas da rede</p>
              <h2>Defina os parâmetros</h2>
            </div>
            <span className="step-badge">01 / 02</span>
          </div>

          <label htmlFor="ipv4-address">
            Endereço IPv4 <span className="optional-label">opcional</span>
            <input id="ipv4-address" name="ipv4" type="text" inputMode="decimal" placeholder={DEFAULT_IPV4} value={form.ipv4} onChange={handleChange} aria-invalid={Boolean(errors.ipv4)} aria-describedby={errors.ipv4 ? 'ipv4-error' : 'ipv4-hint'} />
            {errors.ipv4 ? <span className="field-error" id="ipv4-error" role="alert">{errors.ipv4}</span> : <span className="field-hint" id="ipv4-hint">Sem endereço informado, usamos {DEFAULT_IPV4} como sugestão.</span>}
          </label>

          <div className="form-split">
            <label htmlFor="ipv4-cidr">
              Máscara ou CIDR <span className="optional-label">opcional</span>
              <div className="input-with-suffix">
                <input id="ipv4-cidr" name="cidr" type="text" inputMode="decimal" placeholder="24 ou 255.255.255.0" value={form.cidr} onChange={handleChange} aria-invalid={Boolean(errors.cidr)} aria-describedby={errors.cidr ? 'cidr-error' : 'cidr-hint'} />
              </div>
              {errors.cidr ? <span className="field-error" id="cidr-error" role="alert">{errors.cidr}</span> : <span className="field-hint" id="cidr-hint">Preencha esta opção ou informe os hosts.</span>}
            </label>
            <label htmlFor="required-hosts">
              Hosts necessários <span className="optional-label">opcional</span>
              <input id="required-hosts" name="requiredHosts" type="number" min="1" step="1" placeholder="50" value={form.requiredHosts} onChange={handleChange} aria-invalid={Boolean(errors.requiredHosts)} aria-describedby={errors.requiredHosts ? 'hosts-error' : 'hosts-hint'} />
              {errors.requiredHosts ? <span className="field-error" id="hosts-error" role="alert">{errors.requiredHosts}</span> : <span className="field-hint" id="hosts-hint">Calculamos a menor sub-rede que comporta o total.</span>}
            </label>
          </div>

          <div className="form-note"><span>i</span> Informe uma máscara/CIDR ou o total de hosts. O cálculo só é executado ao clicar.</div>
          <button className="button button-primary full-button" type="submit">Calcular sub-rede <span>→</span></button>
          <div className="save-callout">
            <p className="panel-kicker">Guardar configuração</p>
            <p>{user ? 'Salve esta rede para consultá-la depois.' : 'Entre ou crie uma conta para salvar esta rede. O login é opcional.'}</p>
            {user ? (
              <>
                <label className="save-name-label">Nome do planejamento
                  <input value={planName} onChange={(event) => setPlanName(event.target.value)} aria-label="Nome do planejamento" />
                </label>
                <button className="button button-outline full-button" type="button" disabled={!calculated} onClick={handleSave}>Salvar sub-rede</button>
              </>
            ) : (
              <button className="button button-outline full-button" type="button" onClick={onRequestLogin}>Entrar para salvar</button>
            )}
            {saveMessage && <p className="save-feedback" role="status">{saveMessage}</p>}
          </div>
        </form>

        <section className="results-column">
          {result && (
            <div className="result-cards">
              <div className="result-card main-result">
                <span>Rede calculada</span>
                <strong>{result.network}</strong>
                <b>{result.subnetting}</b>
              </div>
              <div className="result-card">
                <span>Máscara</span>
                <strong>{result.mask}</strong>
              </div>
              <div className="result-card">
                <span>Hosts utilizáveis</span>
                <strong>{result.hosts}</strong>
                <small>endereços disponíveis</small>
              </div>
            </div>
          )}

          <div className={`terminal-panel${result ? '' : ' terminal-empty'}`} aria-live="polite">
            <div className="terminal-head">
              <div>
                <span className="terminal-dot"></span>
                <span className="terminal-dot"></span>
                <span className="terminal-dot"></span>
                <strong>subnet-output</strong>
              </div>
            </div>
            {result ? <pre>{`Network:     ${result.network}
CIDR:        ${result.subnetting}
Subnet Mask: ${result.mask}
Wildcard:    ${result.wildcard}
First Host:  ${result.firstHost}
Last Host:   ${result.lastHost}
Broadcast:   ${result.broadcast}
Hosts:       ${result.hosts}
Total:       ${result.totalAddresses}`}</pre> : <p className="terminal-placeholder">A saída da sub-rede aparecerá aqui após o cálculo.</p>}
          </div>

        </section>
      </div>
      {user && (
        <section className="panel saved-subnetworks">
          <div className="panel-heading">
            <div><p className="panel-kicker">Sua conta</p><h2>Configurações salvas</h2></div>
            <span className="result-count">{subnetworks.length} {subnetworks.length === 1 ? 'REDE' : 'REDES'}</span>
          </div>
          {subnetworks.length === 0 ? (
            <p className="saved-empty">Ainda não há sub-redes salvas. Faça um cálculo e guarde a primeira configuração.</p>
          ) : (
            <div className="saved-list">
              {subnetworks.map((item) => (
                <button className="saved-row" type="button" key={item.id} onClick={() => handleLoad(item)}>
                  <span><strong>{item.name}</strong><small>{item.createdAt ? new Date(item.createdAt).toLocaleString('pt-BR') : 'Configuração salva'}</small></span>
                  <b>{item.ipv4}/{item.cidr}</b>
                  <span aria-hidden="true">→</span>
                </button>
              ))}
            </div>
          )}
        </section>
      )}
    </section>
  );
}
