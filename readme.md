# 🎫 TicketBlitz - Authentication Service

> **Microservice 1 of 3** in the TicketBlitz High-Concurrency Booking Engine.

The **Auth Service** is the secure gatekeeper for the TicketBlitz ecosystem. It handles user identity, manages sessions via stateless JWTs, and provides high-performance token validation for other microservices using **gRPC**.

![Status](https://img.shields.io/badge/Status-Development-yellow)
![Tech](https://img.shields.io/badge/Stack-Node.js%20%7C%20TypeScript%20%7C%20PostgreSQL-blue)
![Docker](https://img.shields.io/badge/Docker-Ready-green)

---

## 🏗 Architecture

This service acts as the **central authority** for identity. It does not handle booking logic; it strictly manages:
1.  **Public REST API:** For users to Sign Up, Login, and manage their profiles.
2.  **Internal gRPC Server:** A low-latency channel for the *Booking Service* to verify tokens without HTTP overhead.

### Tech Stack
* **Runtime:** Node.js (v18+)
* **Framework:** Express.js with TypeScript
* **Database:** PostgreSQL 15 (via Docker)
* **ORM:** Drizzle ORM (Zero-dependency, high performance)
* **Validation:** Zod (Runtime schema validation)
* **Security:** Bcrypt (Hashing) & JWT (RS256/HS256)
* **Inter-Service:** gRPC (Protocol Buffers)

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v18 or higher)
* Docker & Docker Compose

### 1. Clone & Install
```bash
git clone [https://github.com/your-username/ticket-blitz-auth.git](https://github.com/your-username/ticket-blitz-auth.git)
cd ticket-blitz-auth
npm install