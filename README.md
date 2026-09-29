# Real-Time Chat Application — MERN + Socket.io

Real-time chat application built with React, Node.js, Express, MongoDB, Socket.io and JavaScript.

## Features
- Real-time messaging with Socket.io
- REST APIs for sending/fetching messages
- MongoDB persistence
- Chat history after refresh
- Timestamps
- Username-based dummy login
- Online/offline users
- Typing indicator
- Connection/disconnection handling
- Responsive UI
- Backend MVC architecture

## Backend MVC

```text
backend/src/
├── config/db.js
├── controllers/messageController.js
├── middleware/errorHandler.js
├── models/Message.js
├── routes/messageRoutes.js
├── sockets/chatSocket.js
├── app.js
└── server.js
```

## Setup

### Backend
```bash
cd backend
npm install
```

Create `.env` from `.env.example`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/realtime_chat
CLIENT_URL=http://localhost:5173
```

Run:
```bash
npm run dev
```

### Frontend
Open another terminal:

```bash
cd frontend
npm install
```

Create `.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Run:
```bash
npm run dev
```

Frontend: `http://localhost:5173`

## API

`GET /api/health`

`GET /api/messages`

`POST /api/messages`

Body:
```json
{
  "username": "Kishan",
  "message": "Hello!"
}
```

## Socket Events

Client → server:
- `user:join`
- `message:send`
- `typing:start`
- `typing:stop`

Server → client:
- `users:update`
- `message:new`
- `typing:update`
- `user:joined`
- `user:left`
- `chat:error`

## Message flow

```text
React
  ↓
Socket.io
  ↓
Node + Express
  ↓
MongoDB
  ↓
Socket.io broadcast
  ↓
Connected clients
```

REST is used for persistent API operations and initial history loading. Socket.io is used for instant delivery.

## Test

Open two browser tabs, enter different usernames, send messages between them, then refresh and verify that messages remain.

## Assumptions

This implementation uses a shared General chat room. Username login is dummy authentication because full authentication is not required by the assignment.
