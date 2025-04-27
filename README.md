# SHACL Forms Visualizer

A lightweight full-stack web app for **SHACL form validation** and **RDF data visualization**.  
Backend built with **Spring Boot**, frontend built with **React**. Everything runs smoothly in **Docker**.

---

## Prerequisites

Make sure you have the following installed:

- **Docker & Docker Compose**

---

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/BrauoOue/vv-shaclgraph.git
cd vv-shaclgrap
```

### 2. Build and Run Everything in Docker

```bash
docker-compose up --build
```

This will spin up:

- Backend service → available at **http://localhost:9090**
- Frontend UI → available at **http://localhost:3000**

### 3. Access the App

- Open the **Frontend UI**: [http://localhost:3000](http://localhost:3000)
- Test the **Backend API**: [http://localhost:9090/status](http://localhost:9090/status) (should return `Working`)

### 4. Stop the App

```bash
docker-compose down
```

---

## Development Mode (Without Docker)

If you prefer to run the backend and frontend separately:

### Backend

```bash
cd backend
mvn clean spring-boot:run
```
> **Requires:** JDK 17+ and Maven installed.

### Frontend

```bash
cd frontend
npm install
npm start
```
> Opens automatically on [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
shacl-forms-visualizer/
│
├── backend/         # Spring Boot service
│    ├── src/
│    ├── pom.xml
│    └── Dockerfile
│
├── frontend/        # React app
│    ├── src/
│    ├── package.json
│    └── Dockerfile
│
├── docker-compose.yml
└── README.md
```

---

## Tips & Troubleshooting

- **Ports in use?**  
  Change ports inside `docker-compose.yml` or stop the service that's using them.

- **CORS errors?**  
  The backend controller already supports cross-origin requests by default. If needed, you can add `@CrossOrigin` annotations manually.

- **Build failures?**  
  Make sure Docker is running.  
  For local development, ensure you have **JDK 17+** (with `javac`) and **Maven** installed.

---

## License

This project is open-sourced. Feel free to use, modify, and contribute!

---

Enjoy validating and visualizing your SHACL forms! 🚀
