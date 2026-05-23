# Issue Tracker API
 
A RESTful backend API for managing bug reports and feature requests, built with Express, TypeScript, and PostgreSQL (NeonDB).
 
## Live URL
 
```
https://bug-fixer-assignment-2.vercel.app/
```
 
---
 
## Features
 
- User authentication with JWT (register, login, logout)
- Role-based access control (contributor, maintainer)
- Create, read, update, and delete issues
- Filter issues by type and status
- Sort issues by newest or oldest
- Nested reporter details in issue responses
- Global error handling with custom AppError class
---
 
## Tech Stack
 
| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express 5 |
| Language | TypeScript |
| Database | PostgreSQL (NeonDB) |
| Query | Raw SQL with `pg` |
| Auth | JWT (jsonwebtoken) |
| Password | bcryptjs |
| Build | tsup |
| Dev Server | tsx |
 
---
 
## Setup & Installation
 
### 1. Clone the repository
 
```bash
git clone https://github.com/MasadRayan/Batch-7-Assignment-2
cd your-repo
```
 
### 2. Install dependencies
 
```bash
npm install
```
 
### 3. Create `.env` file
 
```env
DATABASE_CONNECTION_STRING=your_neondb_connection_string
PORT=your_port
ACCESSTOKEN_KEY=jwt_secret
```
 
### 4. Run in development
 
```bash
npm run dev
```
 
### 5. Build for production
 
```bash
npm run build
npm start
```
 
---
 
## API Endpoints
 
### Auth
 
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/users/register` | Public | Register a new user |
| POST | `/api/users/login` | Public | Login and get JWT token |
 
### Issues
 
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/issues` | Contributor, Maintainer | Create a new issue |
| GET | `/api/issues` | Public | Get all issues (with filters) |
| GET | `/api/issues/:id` | Public | Get a single issue |
| PATCH | `/api/issues/:id` | Contributor (own, open), Maintainer (any) | Update an issue |
| DELETE | `/api/issues/:id` | Maintainer | Delete an issue |
 
### Query Parameters for `GET /api/issues`
 
| Param | Values | Default |
|-------|--------|---------|
| `sort` | `newest`, `oldest` | `newest` |
| `type` | `bug`, `feature_request` | none |
| `status` | `open`, `in_progress`, `resolved` | none |
 
**Example:**
```
GET /api/issues?sort=oldest&type=bug&status=open
```
 
---
 
## Database Schema
 
### `users`
 
| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| name | VARCHAR(50) | NOT NULL |
| email | VARCHAR(100) | UNIQUE, NOT NULL |
| password | TEXT | NOT NULL |
| role | VARCHAR(50) | DEFAULT 'contributor' |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |
 
### `issues`
 
| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| title | VARCHAR(200) | NOT NULL |
| description | TEXT | NOT NULL |
| type | VARCHAR(20) | NOT NULL, CHECK IN ('bug', 'feature_request') |
| status | VARCHAR(30) | DEFAULT 'open' |
| reporter_id | INT | NOT NULL, REFERENCES users(id) ON DELETE CASCADE |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |
 
---
 
## Role Permissions
 
| Action | Contributor | Maintainer |
|--------|-------------|------------|
| Create issue | ✅ | ✅ |
| View issues | ✅ | ✅ |
| Update own issue (status: open) | ✅ | ✅ |
| Update any issue | ❌ | ✅ |
| Delete issue | ❌ | ✅ |
 
---
 
## Request & Response Examples
 
### Register
 
```json
POST /api/users/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```
 
### Create Issue
 
```json
POST /api/issues
Authorization: <JWT_TOKEN>
{
  "title": "Database connection timeout",
  "description": "Pool exhausts after 50+ concurrent queries",
  "type": "bug"
}
```
 
### Success Response Shape
 
```json
{
  "success": true,
  "message": "Issue created successfully",
  "data": { ... }
}
```
 
### Error Response Shape
 
```json
{
  "success": false,
  "message": "Unauthorized Access!"
}
```
 