# Olive Notes

Organize sua vida, uma tarefa de cada vez!

Olive Notes é um aplicativo fullstack para organização de tarefas diárias, semanais, mensais e metas de longo prazo, inspirado no visual mid-century modern. Feito com Node.js, Express, MongoDB e Vanilla JS totalmente componentizado.

---

## Funcionalidades

- **Autenticação JWT** (login/cadastro)
- **Tarefas** (CRUD, drag-and-drop entre colunas, cores personalizadas)
- **Metas de longo prazo** (anuais e de vida, CRUD)
- **UI moderna** (componentes JS, responsivo, animações, toasts)
- **API RESTful** protegida

---

## Tecnologias

- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcrypt
- **Frontend:** HTML, CSS (custom properties), Vanilla JS (componentes), Font Awesome

---

## Como rodar localmente

### 1. Clone o repositório

```sh
git clone https://github.com/seu-usuario/olive-notes.git
cd olive-notes-app
```

### 2. Instale as dependências do backend

```sh
cd server
npm install
```

### 3. Configure o ambiente

Crie um arquivo `.env` em `server/` baseado no `.env.example`:

```
MONGO_URI=mongodb://localhost:27017/olive_notes
JWT_SECRET=sua_chave_secreta
JWT_EXPIRES_IN=7d
PORT=3000
```

### 4. Inicie o servidor

```sh
npm start
```

O backend estará em http://localhost:3000

### 5. Acesse o frontend

Abra `public/index.html` ou `public/app.html` no navegador, ou acesse via http://localhost:3000 se estiver servindo arquivos estáticos.

---

## Estrutura do projeto

```
server/           # Backend Node.js/Express
	config/         # Configuração do banco
	controllers/    # Lógica de negócio
	middleware/     # Middlewares (auth)
	models/         # Schemas Mongoose
	routes/         # Rotas da API
	index.js        # Entry point
public/           # Frontend Vanilla JS
	css/            # Estilos (variables, app, auth)
	js/             # Lógica (api, auth, app, tasks, goals, dragdrop, ui)
	components/     # Componentes JS reutilizáveis
	index.html      # Tela de login/cadastro
	app.html        # Dashboard principal
```

---

## Scripts úteis

- `npm start` — Inicia o backend em modo produção
- `npm run dev` — Inicia o backend com nodemon (dev)

---

## Licença

MIT. Sinta-se livre para usar, modificar e contribuir!

---

## Créditos

- Design e código: [Malu Lauar]
- Ícones: Font Awesome
- Inspiração: Kanban, Notion, Notas do Keep
