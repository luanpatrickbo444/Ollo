"use client";

import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/browser";

type Msg = { role: "user" | "assistant"; content: string };
type IconName = "plus" | "panel" | "search" | "book" | "scale" | "file" | "settings" | "send" | "arrow" | "shield" | "sparkles" | "menu" | "logout" | "chevron" | "message" | "user" | "eye" | "eyeoff";
function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  const paths: Record<IconName, React.ReactNode> = {
    plus: <><path d="M12 5v14M5 12h14" /></>, panel: <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/></>, search: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.2 4.2"/></>, book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22z"/><path d="M4 5.5v14A2.5 2.5 0 0 1 6.5 17H20"/></>, scale: <><path d="M12 3v18M5 7h14M7 7l-4 7h8L7 7Zm10 0-4 7h8l-4-7ZM8 21h8"/></>, file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/></>, settings: <><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.6-1.4-2.4 1.4-1.1a7 7 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.6a8 8 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.6 1.4 2.4-1.4 1.1a7 7 0 0 1 0 2Z" transform="translate(-1 -1) scale(1.08)"/></>, send: <><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></>, arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>, shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/></>, sparkles: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2L12 3Z"/><path d="m19 14 1.1 2.9L23 18l-2.9 1.1L19 22l-1.1-2.9L15 18l2.9-1.1L19 14Z"/></>, menu: <><path d="M4 6h16M4 12h16M4 18h16"/></>, logout: <><path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/></>, chevron: <><path d="m9 18 6-6-6-6"/></>, message: <><path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.6L3 21l1.9-5.6A8.5 8.5 0 1 1 21 11.5Z"/></>, user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>, eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>, eyeoff: <><path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.9 5.2A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a16 16 0 0 1-3.2 4.1M6.2 6.2C3.5 8 2 12 2 12s3.5 7 10 7a10 10 0 0 0 4-.8"/></>
  };
  return <svg {...common}>{paths[name]}</svg>;
}

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [session, setSession] = useState<any>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [question, setQuestion] = useState("");
  const [chat, setChat] = useState<Msg[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [chat, busy]);

  async function auth(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/reset-password` });
        if (error) throw error;
        setNotice("Se o e-mail estiver cadastrado, enviaremos as instruções para redefinir sua senha.");
      } else if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: location.origin } });
        if (error) throw error;
        if (data.session) setSession(data.session);
        setNotice(data.session ? "Conta criada com sucesso." : "Confira seu e-mail para confirmar o cadastro.");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setSession(data.session);
      }
    } catch (e: any) { setError(e?.message || "Não foi possível concluir a operação."); }
    finally { setBusy(false); }
  }
  async function send(text = question) {
    const q = text.trim(); if (!q || !session || busy) return;
    setQuestion(""); setChat(c => [...c, { role: "user", content: q }]); setBusy(true); setError("");
    try {
      const r = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ message: q, conversationId }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error || "Não foi possível consultar a Ollo.");
      setConversationId(d.conversationId); setChat(c => [...c, { role: "assistant", content: d.message.content }]);
    } catch (e: any) { setError(e?.message || "Erro de conexão com a API."); }
    finally { setBusy(false); inputRef.current?.focus(); }
  }
  function newChat() { setChat([]); setConversationId(undefined); setQuestion(""); setError(""); setSidebarOpen(false); inputRef.current?.focus(); }
  async function logout() { await supabase.auth.signOut(); setSession(null); newChat(); setNotice(""); }
  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }
  const displayName = useMemo(() => session?.user?.email?.split("@")[0] || "Minha conta", [session]);
  const title = chat.find(m => m.role === "user")?.content || "Nova conversa";

  if (!session) return <main className="auth-screen">
    <div className="auth-orb auth-orb-one"/><div className="auth-orb auth-orb-two"/>
    <div className="auth-top"><a className="wordmark" href="#"><span className="logo-mark"></span>ollo<span className="wordmark-dot">.</span></a><span className="auth-top-label">INTELIGÊNCIA JURÍDICA</span></div>
    <section className="auth-card">
      <div className="auth-symbol"><Icon name="sparkles" size={25}/></div>
      <div className="eyebrow">SUA ASSISTENTE JURÍDICA COM IA</div>
      <h1>{mode === "login" ? <>O conhecimento jurídico,<br/><span>em uma nova perspectiva.</span></> : mode === "register" ? <>Comece sua jornada<br/><span>com a Ollo.</span></> : <>Vamos recuperar<br/><span>seu acesso.</span></>}</h1>
      <p className="auth-subtitle">{mode === "login" ? "Entre para pesquisar, analisar e organizar suas questões jurídicas." : mode === "register" ? "Crie sua conta para começar a explorar a inteligência jurídica." : "Informe seu e-mail e enviaremos as instruções de recuperação."}</p>
      <form className="auth-form" onSubmit={auth}>
        <label htmlFor="email">E-mail</label><input id="email" type="email" autoComplete="email" placeholder="voce@exemplo.com" required value={email} onChange={e => setEmail(e.target.value)}/>
        {mode !== "forgot" && <><div className="password-label"><label htmlFor="password">Senha</label>{mode === "login" && <button type="button" className="text-button" onClick={() => { setMode("forgot"); setError(""); setNotice(""); }}>Esqueceu a senha?</button>}</div><div className="password-wrap"><input id="password" type={showPassword ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder={mode === "register" ? "Crie uma senha segura" : "Sua senha"} minLength={10} required value={password} onChange={e => setPassword(e.target.value)}/><button className="password-toggle" type="button" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} onClick={() => setShowPassword(v => !v)}><Icon name={showPassword ? "eyeoff" : "eye"} size={18}/></button></div>{mode === "register" && <div className="field-hint">Use pelo menos 10 caracteres.</div>}</>}
        {error && <div className="notice notice-error">{error}</div>}{notice && <div className="notice notice-success">{notice}</div>}
        <button className="auth-submit" disabled={busy}>{busy ? "Aguarde…" : mode === "login" ? "Entrar na Ollo" : mode === "register" ? "Criar minha conta" : "Enviar instruções"}<Icon name="arrow" size={18}/></button>
      </form>
      <div className="auth-switch">{mode === "login" ? <>Ainda não tem uma conta? <button onClick={() => { setMode("register"); setError(""); setNotice(""); }}>Criar conta</button></> : <>Já tem uma conta? <button onClick={() => { setMode("login"); setError(""); setNotice(""); }}>Entrar</button></>}</div>
    </section>
    <footer className="auth-footer"><span>© 2026 Ollo</span><span><Icon name="shield" size={14}/> Privacidade e segurança em primeiro lugar</span><span>Feito para pensar melhor.</span></footer>
  </main>;

  return <main className={`app-shell ${sidebarOpen ? "sidebar-visible" : ""}`}>
    {sidebarOpen && <button className="mobile-scrim" aria-label="Fechar menu" onClick={() => setSidebarOpen(false)}/>}
    <aside className="sidebar">
      <div className="sidebar-head"><a className="wordmark" href="#" onClick={newChat}><span className="logo-mark"><Icon name="scale" size={19}/></span>ollo<span className="wordmark-dot">.</span></a><button className="icon-button collapse-button" aria-label="Fechar menu" onClick={() => setSidebarOpen(false)}><Icon name="panel"/></button></div>
      <button className="new-chat-button" onClick={newChat}><Icon name="plus" size={18}/> <span>Nova conversa</span><span className="shortcut">⌘ K</span></button>
      <nav className="side-nav" aria-label="Navegação principal">
        <button className="nav-item active" onClick={newChat}><Icon name="message" size={18}/><span>Assistente jurídico</span></button>
        <button className="nav-item" onClick={() => { setQuestion("Faça uma pesquisa jurídica sobre "); inputRef.current?.focus(); }}><Icon name="search" size={18}/><span>Pesquisa jurídica</span></button>
        <button className="nav-item" onClick={() => { setQuestion("Ajude-me a analisar este documento: "); inputRef.current?.focus(); }}><Icon name="file" size={18}/><span>Análise de documentos</span></button>
        <button className="nav-item" onClick={() => { setQuestion("Explique a legislação aplicável a "); inputRef.current?.focus(); }}><Icon name="book" size={18}/><span>Legislação</span></button>
      </nav>
      <div className="history-area"><div className="section-label">RECENTES</div>{chat.length > 0 ? <button className="history-item selected" title={title} onClick={() => setSidebarOpen(false)}><Icon name="message" size={16}/><span>{title}</span></button> : <div className="empty-history"><span className="history-dash"/><span>Suas conversas aparecerão aqui.</span></div>}</div>
      <div className="sidebar-bottom"><div className="plan-card"><div className="plan-icon"><Icon name="sparkles" size={17}/></div><div><strong>Ollo IA</strong><span>Seu espaço de conhecimento jurídico</span></div></div><button className="profile-button" onClick={logout}><div className="avatar">{displayName.slice(0, 1).toUpperCase()}</div><div className="profile-copy"><strong>{displayName}</strong><span>Conta pessoal</span></div><Icon name="logout" size={17}/></button></div>
    </aside>

    <section className="workspace">
      <header className="workspace-header"><div className="header-left"><button className="icon-button mobile-menu" aria-label="Abrir menu" onClick={() => setSidebarOpen(true)}><Icon name="menu"/></button><div className="model-selector"><span className="model-status"/><span>Ollo Assistente</span><span className="model-badge">BETA</span><Icon name="chevron" size={15}/></div></div><div className="header-right"><span className="secure-label"><Icon name="shield" size={15}/> Ambiente seguro</span><button className="header-avatar" title={displayName}>{displayName.slice(0, 1).toUpperCase()}</button></div></header>
      <div className={`conversation ${chat.length === 0 ? "conversation-empty" : ""}`}>
        {chat.length === 0 ? <div className="welcome-content"><div className="welcome-emblem"><div className="emblem-ring"><Icon name="scale" size={29}/></div><span className="emblem-spark spark-a">✳</span><span className="emblem-spark spark-b">✦</span></div><div className="welcome-kicker">INTELIGÊNCIA JURÍDICA, REIMAGINADA</div><h1>Como posso ajudar<br/><span>você hoje?</span></h1><p className="welcome-description">Pesquise, compreenda e explore questões jurídicas<br className="desktop-break"/> com mais clareza — uma pergunta de cada vez.</p><div className="suggestion-grid">
          <button className="suggestion-card" onClick={() => void send("Quais são os requisitos para a validade de um contrato no direito brasileiro?")}><span className="suggestion-icon icon-violet"><Icon name="scale" size={19}/></span><span className="suggestion-copy"><strong>Explorar uma questão jurídica</strong><small>Entenda conceitos e fundamentos legais</small></span><Icon name="arrow" size={17}/></button>
          <button className="suggestion-card" onClick={() => void send("Como pesquisar jurisprudência relevante para um caso no Brasil?")}><span className="suggestion-icon icon-blue"><Icon name="search" size={19}/></span><span className="suggestion-copy"><strong>Pesquisar jurisprudência</strong><small>Descubra caminhos para sua pesquisa</small></span><Icon name="arrow" size={17}/></button>
          <button className="suggestion-card" onClick={() => void send("Crie uma estrutura de tópicos para analisar um contrato de prestação de serviços.")}><span className="suggestion-icon icon-amber"><Icon name="file" size={19}/></span><span className="suggestion-copy"><strong>Analisar um documento</strong><small>Organize pontos de atenção e dúvidas</small></span><Icon name="arrow" size={17}/></button>
          <button className="suggestion-card" onClick={() => void send("Explique como identificar a legislação oficial aplicável a uma questão jurídica.")}><span className="suggestion-icon icon-green"><Icon name="book" size={19}/></span><span className="suggestion-copy"><strong>Encontrar a legislação</strong><small>Oriente-se por fontes oficiais</small></span><Icon name="arrow" size={17}/></button>
        </div></div> : <div className="messages-list">{chat.map((m, i) => <article key={i} className={`chat-message ${m.role}`}><div className={`message-avatar ${m.role === "assistant" ? "ollo-avatar" : "user-avatar"}`}>{m.role === "assistant" ? <Icon name="scale" size={17}/> : displayName.slice(0, 1).toUpperCase()}</div><div className="message-body"><div className="message-author">{m.role === "assistant" ? "Ollo" : "Você"}</div><div className="message-text">{m.content}</div></div></article>)}{busy && <article className="chat-message assistant"><div className="message-avatar ollo-avatar"><Icon name="scale" size={17}/></div><div className="message-body"><div className="message-author">Ollo</div><div className="typing"><span/><span/><span/><em>Preparando resposta…</em></div></div></article>}<div ref={bottomRef}/></div>}
      </div>
      <div className="composer-wrap"><div className="composer-container">{error && <div className="chat-error">{error}</div>}<form className="composer" onSubmit={e => { e.preventDefault(); void send(); }}><textarea ref={inputRef} rows={1} placeholder="Pergunte qualquer coisa sobre direito…" value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={onKeyDown} maxLength={8000} aria-label="Mensagem para Ollo"/><div className="composer-bottom"><div className="composer-tools"><span className="composer-hint"><Icon name="shield" size={14}/> Suas conversas são privadas</span></div><div className="composer-actions"><span className="enter-hint">Enter para enviar · Shift + Enter para nova linha</span><button className="send-button" type="submit" disabled={busy || !question.trim()} aria-label="Enviar mensagem"><Icon name="send" size={18}/></button></div></div></form><div className="disclaimer">A Ollo pode cometer erros. Verifique informações jurídicas importantes em fontes oficiais.</div></div></div>
    </section>
  </main>;
}
