# file-handler

A solution built with Node.js + Express API and a React frontend for the file handler Toolbox's coding challenge.

## Prerequisites

- Node.js 14+ (for API)
- Node.js 16+ (for frontend)
- Docker + Docker Compose (optional)

## Project Structure

```
file-handler/
├── api/         Node.js + Express REST API
└── frontend/    React + Webpack frontend
```

---

## API

### Setup & Run

```bash
cd api
npm install
npm start
```

### Run Tests

```bash
cd api
npm test
```

### Endpoints

| Method | Path                             | Description                                   |
| ------ | -------------------------------- | --------------------------------------------- |
| GET    | `/files/list`                    | Returns the list of available files           |
| GET    | `/files/data`                    | Returns all files with valid parsed CSV lines |
| GET    | `/files/data?fileName=file1.csv` | Returns data for a specific file              |

---

## Frontend

### Setup & Run

```bash
cd frontend
npm install
npm start
```

> Note: The API must be running on port 3001 for the frontend to work.

---

## Docker Compose (all-in-one)

### Build

```bash
docker compose build
```

### Run

```bash
docker compose up -d
```

### Stop

```bash
docker compose down
```

- API: http://localhost:3001
- Frontend: http://localhost:3000
