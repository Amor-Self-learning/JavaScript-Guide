# Module 25: Ecosystem

The Node.js ecosystem is vast and mature. This module provides an overview of popular frameworks, databases, tools, and libraries commonly used in production applications.

---

## 25.1 Web Frameworks

### Express.js

The most popular Node.js web framework.

```javascript
const express = require('express');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/api/users', async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

app.post('/api/users', async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json(user);
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(3000);
```

### Fastify

High-performance alternative to Express.

```javascript
const fastify = require('fastify')({ logger: true });

// Schema validation built-in
fastify.post('/api/users', {
  schema: {
    body: {
      type: 'object',
      required: ['name', 'email'],
      properties: {
        name: { type: 'string' },
        email: { type: 'string', format: 'email' }
      }
    }
  }
}, async (request, reply) => {
  const user = await createUser(request.body);
  return user;
});

await fastify.listen({ port: 3000 });
```

### NestJS

TypeScript-first framework with Angular-like architecture.

```typescript
// users.controller.ts
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}
  
  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }
  
  @Post()
  @HttpCode(201)
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }
}
```

### Koa

Minimalist framework by Express creators.

```javascript
const Koa = require('koa');
const Router = require('@koa/router');

const app = new Koa();
const router = new Router();

router.get('/users', async (ctx) => {
  ctx.body = await getUsers();
});

app.use(router.routes());
app.listen(3000);
```

---

## 25.2 Databases

### SQL - PostgreSQL with Prisma

```javascript
// schema.prisma
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}

// Usage
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const users = await prisma.user.findMany({
  include: { posts: true }
});

const user = await prisma.user.create({
  data: { email: 'alice@example.com', name: 'Alice' }
});
```

### SQL - Sequelize

```javascript
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('postgres://user:pass@localhost:5432/db');

const User = sequelize.define('User', {
  name: DataTypes.STRING,
  email: { type: DataTypes.STRING, unique: true }
});

await sequelize.sync();
const users = await User.findAll();
```

### MongoDB with Mongoose

```javascript
const mongoose = require('mongoose');

await mongoose.connect('mongodb://localhost/mydb');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

const user = await User.create({ name: 'Alice', email: 'alice@example.com' });
const users = await User.find({ name: /alice/i });
```

### Redis

```javascript
const Redis = require('ioredis');
const redis = new Redis();

// Basic operations
await redis.set('key', 'value');
const value = await redis.get('key');

// With expiration
await redis.set('session', 'data', 'EX', 3600);

// Pub/sub
const sub = new Redis();
sub.subscribe('channel');
sub.on('message', (channel, message) => {
  console.log(`${channel}: ${message}`);
});

const pub = new Redis();
await pub.publish('channel', 'Hello');
```

---

## 25.3 Authentication

### Passport.js

```javascript
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;

// Local strategy
passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await User.findOne({ username });
      if (!user || !await user.verifyPassword(password)) {
        return done(null, false, { message: 'Invalid credentials' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

// JWT strategy
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
}, async (payload, done) => {
  try {
    const user = await User.findById(payload.sub);
    if (!user) return done(null, false);
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// Usage
app.post('/login', passport.authenticate('local'), (req, res) => {
  const token = jwt.sign({ sub: req.user.id }, process.env.JWT_SECRET);
  res.json({ token });
});

app.get('/protected', passport.authenticate('jwt'), (req, res) => {
  res.json({ user: req.user });
});
```

### bcrypt

```javascript
const bcrypt = require('bcrypt');

// Hash password
const saltRounds = 10;
const hash = await bcrypt.hash('password123', saltRounds);

// Verify password
const match = await bcrypt.compare('password123', hash);
```

### JWT

```javascript
const jwt = require('jsonwebtoken');

// Create token
const token = jwt.sign(
  { userId: 123, role: 'admin' },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

// Verify token
try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log(decoded.userId);  // 123
} catch (err) {
  if (err.name === 'TokenExpiredError') {
    console.log('Token expired');
  }
}
```

---

## 25.4 Real-Time Communication

### Socket.IO

```javascript
const { Server } = require('socket.io');
const io = new Server(server);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join', (room) => {
    socket.join(room);
  });
  
  socket.on('message', (data) => {
    io.to(data.room).emit('message', data);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Client
const socket = io();
socket.emit('join', 'room1');
socket.emit('message', { room: 'room1', text: 'Hello!' });
socket.on('message', (data) => console.log(data));
```

### WebSocket (ws)

```javascript
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    // Broadcast to all clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});
```

---

## 25.5 Task Queues

### Bull

```javascript
const Queue = require('bull');

const emailQueue = new Queue('email', 'redis://localhost:6379');

// Producer
await emailQueue.add({
  to: 'user@example.com',
  subject: 'Welcome',
  body: 'Hello!'
}, {
  attempts: 3,
  backoff: { type: 'exponential', delay: 1000 }
});

// Consumer
emailQueue.process(async (job) => {
  await sendEmail(job.data);
  return { sent: true };
});

emailQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed:`, result);
});

emailQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});
```

### Agenda

```javascript
const Agenda = require('agenda');
const agenda = new Agenda({ db: { address: 'mongodb://localhost/agenda' } });

agenda.define('send email', async (job) => {
  await sendEmail(job.attrs.data);
});

await agenda.start();

// Schedule job
await agenda.schedule('in 5 minutes', 'send email', { to: 'user@example.com' });

// Recurring job
await agenda.every('1 hour', 'send report');
```

---

## 25.6 File Uploads

### Multer

```javascript
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },  // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images allowed'));
    }
  }
});

app.post('/upload', upload.single('image'), (req, res) => {
  res.json({ file: req.file });
});

app.post('/upload-multiple', upload.array('images', 5), (req, res) => {
  res.json({ files: req.files });
});
```

---

## 25.7 Email

### Nodemailer

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.example.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

await transporter.sendMail({
  from: '"App" <noreply@example.com>',
  to: 'user@example.com',
  subject: 'Welcome',
  text: 'Hello, welcome to our app!',
  html: '<h1>Hello</h1><p>Welcome to our app!</p>'
});
```

---

## 25.8 HTTP Clients

### Axios

```javascript
const axios = require('axios');

// GET
const response = await axios.get('https://api.example.com/users');
console.log(response.data);

// POST
const { data } = await axios.post('https://api.example.com/users', {
  name: 'Alice',
  email: 'alice@example.com'
});

// With config
const client = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 5000,
  headers: { 'Authorization': `Bearer ${token}` }
});

// Interceptors
client.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Handle unauthorized
    }
    return Promise.reject(error);
  }
);
```

### node-fetch

```javascript
const fetch = require('node-fetch');

const response = await fetch('https://api.example.com/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Alice' })
});

const data = await response.json();
```

---

## 25.9 Validation

### Joi

```javascript
const Joi = require('joi');

const schema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().pattern(/^[a-zA-Z0-9]{8,30}$/).required(),
  age: Joi.number().integer().min(0).max(150)
});

const { error, value } = schema.validate(req.body);
if (error) {
  throw new ValidationError(error.details[0].message);
}
```

### Zod (TypeScript-first)

```typescript
import { z } from 'zod';

const UserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().int().positive().optional()
});

type User = z.infer<typeof UserSchema>;

const user = UserSchema.parse(req.body);  // Throws if invalid
const result = UserSchema.safeParse(req.body);  // Returns { success, data/error }
```

---

## 25.10 Process Management

### PM2

```bash
# Install
npm install -g pm2

# Start app
pm2 start app.js
pm2 start app.js --name "my-app" -i max  # Cluster mode

# Manage
pm2 list
pm2 logs
pm2 monit
pm2 restart all
pm2 stop all
pm2 delete all

# Config file (ecosystem.config.js)
module.exports = {
  apps: [{
    name: 'my-app',
    script: 'app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
```

---

## 25.11 Summary

| Category | Popular Choices |
|----------|-----------------|
| **Web Frameworks** | Express, Fastify, NestJS, Koa |
| **ORM/ODM** | Prisma, Sequelize, TypeORM, Mongoose |
| **Databases** | PostgreSQL, MySQL, MongoDB, Redis |
| **Authentication** | Passport.js, JWT, bcrypt |
| **Real-Time** | Socket.IO, ws |
| **Task Queues** | Bull, Agenda, BullMQ |
| **File Upload** | Multer, Formidable |
| **Email** | Nodemailer |
| **HTTP Client** | Axios, node-fetch, got |
| **Validation** | Joi, Zod, Yup |
| **Logging** | Winston, Pino, Bunyan |
| **Testing** | Jest, Mocha, Vitest |
| **Process Manager** | PM2, Forever |
| **API Documentation** | Swagger, OpenAPI |
| **GraphQL** | Apollo, GraphQL Yoga |

---

**End of Module 25: Ecosystem**

This completes the Node.js section of the JavaScript Mastery Guide.
