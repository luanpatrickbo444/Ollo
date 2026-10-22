# Ollo — backend + interface mínima

Projeto Next.js (Node.js Runtime na Vercel) com autenticação Supabase, recuperação de senha, conversas e chat configurável para Jurema.

## Atenção sobre o modelo Jurema

O modelo `Jurema-br/Jurema-7B` está pronto como pesos no Hugging Face, mas **não está atualmente implantado num Inference Provider serverless do Hugging Face**. Logo, não basta definir `HF_TOKEN` ou chamar o Router. Para a API funcionar na Vercel, é necessário criar um endpoint de inferência hospedado (por exemplo, um Hugging Face Inference Endpoint que suporte a arquitetura/modelo) ou usar um endpoint OpenAI-compatible hospedado por você. O código já está configurado para chamar um endpoint compatível via `JUREMA_API_BASE_URL`, `JUREMA_API_KEY` e `JUREMA_MODEL`. Não inventa um endpoint e não funciona até preencher esses valores reais.

Referências:
- Modelo: https://huggingface.co/Jurema-br/Jurema-7B
- Guia Inference Endpoints: https://huggingface.co/docs/inference-endpoints/index
- O arquivo GGUF comunitário é quantizado, mas também não está hospedado num provider serverless: https://huggingface.co/mauroneto/Jurema-7B-Q4_K_M-GGUF

## 1. Instalar

Requer Node.js 20+ recomendado.

```bash
npm install
cp .env.example .env.local
npm run dev
```

## 2. Supabase

1. Crie um projeto em https://supabase.com/dashboard.
2. Em Project Settings → API, copie Project URL, publishable/anon key e service role key para `.env.local`.
3. No SQL Editor, execute todo o arquivo `supabase/schema.sql`.
4. Em Authentication → URL Configuration, defina Site URL e adicione `http://localhost:3000/reset-password` aos Redirect URLs. Para produção, adicione o domínio final da Ollo e `https://SEU-DOMINIO/reset-password`.
5. Configure SMTP para produção. O serviço de e-mail padrão do Supabase é limitado e não é recomendado para envio de e-mails de produção.

## 3. Conectar Jurema

1. Abra o modelo: https://huggingface.co/Jurema-br/Jurema-7B.
2. Crie um endpoint de inferência compatível com chat completions, ou hospede o modelo num serviço que exponha API OpenAI-compatible.
3. Defina `JUREMA_API_BASE_URL` com a base terminada em `/v1`, `JUREMA_API_KEY` com o token exigido pelo endpoint e `JUREMA_MODEL` com o nome de modelo esperado pelo servidor.
4. Teste o endpoint do provedor separadamente antes de testar `/api/chat`.

O modelo não roda dentro da Vercel. A Vercel executa o app e a API; o endpoint Jurema roda em infraestrutura de inferência separada e pode ter custo próprio.

## 4. Vercel

Importe o repositório no Vercel ou faça upload via GitHub. Em Project → Settings → Environment Variables configure todas as variáveis de `.env.example` para Production, Preview e Development conforme necessário. `APP_URL` deve ser o domínio completo sem barra final. Faça redeploy depois de mudar variáveis.

## API REST e testes

A API usa HTTP/JSON e autenticação `Authorization: Bearer <access_token>` nas rotas privadas. A especificação OpenAPI está em `docs/openapi.yaml` e a coleção de testes do Postman em `docs/postman_collection.json`. Importe esses arquivos no Swagger Editor/Swagger UI e no Postman, respectivamente, e troque `SEU-PROJETO.vercel.app` pela URL real após publicar.

## Rotas

- `GET /api/health` — saúde básica do processo.
- `POST /api/auth/register` — cadastro `{email,password,name?}`.
- `POST /api/auth/login` — login `{email,password}`.
- `POST /api/auth/forgot-password` — recuperação `{email}`.
- `POST /api/auth/update-password` — atualizar senha com `Authorization: Bearer <access_token>`.
- `POST /api/auth/logout` — valida a sessão; o cliente deve também chamar `supabase.auth.signOut()` para limpar a sessão local.
- `GET /api/me` — usuário autenticado.
- `GET/POST /api/conversations` — lista/cria conversas.
- `GET /api/conversations/:id/messages` — histórico.
- `POST /api/chat` — `{message, conversationId?}` com bearer token.

A interface mínima na raiz oferece cadastro, login, recuperação e chat para smoke test. Para recuperação, Supabase retorna ao browser com tokens no fragmento da URL; a página `/reset-password` tenta estabelecer a sessão e atualizar a senha.

## Segurança e limitações

- Não commit `.env.local`, nem exponha `SUPABASE_SERVICE_ROLE_KEY` ou `JUREMA_API_KEY` no browser.
- O chat exige login e valida propriedade da conversa. RLS está habilitado nas tabelas.
- Antes de abrir ao público, adicione rate limiting distribuído (por exemplo Upstash), cotas por usuário, monitoramento de custo e logs sem dados pessoais.
- Este pacote é um ponto de partida funcional, não um produto auditado. Não inclua dados sigilosos de clientes no protótipo.
- A IA não tem RAG ainda: não consulta legislação ou jurisprudência automaticamente e não deve ser tratada como fonte oficial.
