# Olive Notes

Organize your life, one task at a time!

Olive Notes is a full-stack application for organizing daily, weekly, monthly tasks, and long-term goals, inspired by mid-century modern aesthetics. Built with Node.js, Express, MongoDB, and fully componentized Vanilla JS.

---

## Features

- **JWT Authentication** (login/signup)
- **Tasks** (CRUD, drag-and-drop between columns, custom colors)
- **Long-term goals** (annual and life goals, CRUD)
- **Modern UI** (JS components, responsive design, animations, toasts)
- **Protected RESTful API**

---

## Tech Stack

- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcrypt
- **Frontend:** HTML, CSS (custom properties), Vanilla JS (components), Font Awesome

---

## How to run locally

### 1. Clone the repository

```sh
git clone https://github.com/seu-usuario/olive-notes.git
cd olive-notes-app
```

### 2. Install backend dependencies

```sh
cd server
npm install
```

### 3. Configure the environment

Create a `.env` file in `server/` based on `.env.example`:

```
MONGO_URI=mongodb://localhost:27017/olive_notes
JWT_SECRET=sua_chave_secreta
JWT_EXPIRES_IN=7d
PORT=3000
```

### 4. Start the server

```sh
npm start
```

The backend will be running at http://localhost:3000

### 5. Access the frontend

Open `public/index.html` or `public/app.html` in your browser, or access it via http://localhost:3000 if you are serving static files.

---

## Project structure

```
server/           # Node.js/Express Backend
	config/         # Database configuration
	controllers/    # Business logic
	middleware/     # Middlewares (auth)
	models/         # Mongoose schemas
	routes/         # API routes
	index.js        # Entry point
public/           # Vanilla JS Frontend
	css/            # Styles (variables, app, auth)
	js/             # Logic (api, auth, app, tasks, goals, dragdrop, ui)
	components/     # Reusable JS components
	index.html      # Login/signup page
	app.html        # Main dashboard
```

---

## Useful scripts

- `npm start` — Starts the backend in production mode
- `npm run dev` — Starts the backend with nodemon (dev mode)

---

## License

MIT. Feel free to use, modify, and contribute!
---

## Credits

- Design and code: [Malu Lauar](https://github.com/lauar-m)
- Icons: Font Awesome Font Awesome
- Inspiration: Kanban, Notion, Keep Notes
