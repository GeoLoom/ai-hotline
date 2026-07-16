import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from 'react';

type Source = 'answer' | 'answer/docs';
type HealthStatus = 'checking' | 'ok' | 'down';

interface AnswerSourceItem {
  ticket_id?: string;
  reference?: string;
  score: number;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'error';
  content: string;
  sources?: AnswerSourceItem[];
}

interface AnswerResponse {
  answer: string;
  sources: AnswerSourceItem[];
}

interface ErrorResponse {
  error: string | Record<string, unknown>;
}

let messageCounter = 0;
function nextId(): string {
  messageCounter += 1;
  return 'msg-' + messageCounter;
}

const MAX_QUESTION_LENGTH = 2000;

export default function App() {
  const [token, setToken] = useState('');
  const [source, setSource] = useState<Source>('answer');
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [health, setHealth] = useState<HealthStatus>('checking');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const tokenInputRef = useRef<HTMLInputElement>(null);
  const settingsToggleRef = useRef<HTMLButtonElement>(null);
  const isFirstSettingsRender = useRef(true);

  useEffect(() => {
    fetch('/health')
      .then((res) => setHealth(res.ok ? 'ok' : 'down'))
      .catch(() => setHealth('down'));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, loading]);

  useEffect(() => {
    if (isFirstSettingsRender.current) {
      isFirstSettingsRender.current = false;
      return;
    }
    if (settingsOpen) {
      tokenInputRef.current?.focus();
    } else {
      settingsToggleRef.current?.focus();
    }
  }, [settingsOpen]);

  useEffect(() => {
    if (!copiedId) return;
    const timeout = setTimeout(() => setCopiedId(null), 2000);
    return () => clearTimeout(timeout);
  }, [copiedId]);

  async function sendQuestion() {
    const trimmed = question.trim();
    if (trimmed.length < 3 || loading) return;

    if (!token.trim()) {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: 'error',
          content: 'Renseignez votre token API dans Réglages avant de poser une question.',
        },
      ]);
      setSettingsOpen(true);
      return;
    }

    setMessages((prev) => [...prev, { id: nextId(), role: 'user', content: trimmed }]);
    setQuestion('');
    setLoading(true);

    try {
      const res = await fetch('/' + source, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({ question: trimmed }),
      });

      const data: AnswerResponse | ErrorResponse = await res.json();

      if (!res.ok) {
        const errorData = data as ErrorResponse;
        const detail =
          typeof errorData.error === 'string'
            ? errorData.error
            : JSON.stringify(errorData.error);
        setMessages((prev) => [
          ...prev,
          { id: nextId(), role: 'error', content: '(' + res.status + ') ' + detail },
        ]);
      } else {
        const answerData = data as AnswerResponse;
        setMessages((prev) => [
          ...prev,
          {
            id: nextId(),
            role: 'assistant',
            content: answerData.answer,
            sources: answerData.sources,
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: 'error',
          content: 'Erreur réseau : ' + (err instanceof Error ? err.message : String(err)),
        },
      ]);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendQuestion();
  }

  function handleTextareaKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendQuestion();
    }
  }

  function handleSettingsKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      setSettingsOpen(false);
    }
  }

  function handleNewConversation() {
    if (messages.length === 0) return;
    const confirmed = window.confirm('Effacer l\'historique de cette conversation ?');
    if (confirmed) {
      setMessages([]);
      textareaRef.current?.focus();
    }
  }

  async function handleCopy(message: ChatMessage) {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedId(message.id);
    } catch {

    }
  }

  const remaining = MAX_QUESTION_LENGTH - question.length;

  return (
    <div className="app-shell">
      <a className="skip-link" href="#question">Aller à la zone de question</a>

      <header className="top">
        <div className="brand">
          <span className="mark">aihotline</span>
          <span
            className={'health-dot ' + health}
            role="status"
            aria-label={
              health === 'checking'
                ? 'Vérification de la disponibilité du service'
                : health === 'ok'
                ? 'Service disponible'
                : 'Service indisponible'
            }
            title={health === 'ok' ? 'Service disponible' : health === 'down' ? 'Service indisponible' : 'Vérification…'}
          />
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="text-button"
            onClick={handleNewConversation}
            disabled={messages.length === 0}
          >
            Nouvelle conversation
          </button>
          <button
            ref={settingsToggleRef}
            type="button"
            className="settings-toggle"
            aria-expanded={settingsOpen}
            aria-controls="settings-panel"
            onClick={() => setSettingsOpen((v) => !v)}
          >
            Réglages
          </button>
        </div>
      </header>

      {settingsOpen && (
        <div
          className="settings-panel"
          id="settings-panel"
          role="region"
          aria-label="Réglages de connexion"
          onKeyDown={handleSettingsKeyDown}
        >
          <div className="field">
            <label htmlFor="token">Token API</label>
            <input
              ref={tokenInputRef}
              type="password"
              id="token"
              autoComplete="off"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="source">Type de demande</label>
            <select
              id="source"
              value={source}
              onChange={(e) => setSource(e.target.value as Source)}
            >
              <option value="answer">Historique d'incidents</option>
              <option value="answer/docs">Documentation interne</option>
            </select>
          </div>
        </div>
      )}

      <main className="chat" role="log" aria-live="polite" aria-label="Échange avec l'assistant">
        {messages.length === 0 && (
          <p className="empty-state">
            Posez votre première question ci-dessous pour démarrer l'échange.
          </p>
        )}

        {messages.map((m) => (
          <div key={m.id} className={'bubble-row ' + m.role}>
            <div className={'bubble ' + m.role}>
              <p>{m.content}</p>
              {m.role === 'assistant' && m.sources && m.sources.length > 0 && (
                <ul className="sources-list">
                  {m.sources.map((s, i) => (
                    <li key={s.ticket_id ?? s.reference ?? i}>
                      {s.ticket_id ?? s.reference ?? 'source'}{' '}
                      <span className="score">{s.score.toFixed(3)}</span>
                    </li>
                  ))}
                </ul>
              )}
              {m.role === 'assistant' && (
                <button
                  type="button"
                  className="copy-button"
                  onClick={() => handleCopy(m)}
                >
                  {copiedId === m.id ? 'Copié !' : 'Copier'}
                </button>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="bubble-row assistant">
            <div className="bubble assistant loading" aria-label="Génération de la réponse en cours">
              <span className="dot" aria-hidden="true" />
              <span className="dot" aria-hidden="true" />
              <span className="dot" aria-hidden="true" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </main>

      <form className="composer" onSubmit={handleSubmit}>
        <div className="composer-input">
          <label htmlFor="question" className="sr-only">Votre question</label>
          <textarea
            id="question"
            ref={textareaRef}
            required
            minLength={3}
            maxLength={MAX_QUESTION_LENGTH}
            rows={1}
            placeholder="Écrivez votre question, puis Entrée pour envoyer (Maj+Entrée pour un saut de ligne)"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleTextareaKeyDown}
            aria-describedby="char-count"
          />
          <span className="char-count" id="char-count" aria-hidden="true">
            {remaining}
          </span>
        </div>
        <button type="submit" disabled={loading || question.trim().length < 3}>
          Envoyer
        </button>
      </form>
    </div>
  );
}