# Twitter Clone

A simple Twitter clone built with React, Node.js, Express, SQLite, JWT authentication, and bcrypt for password hashing.

## Features

- ✅ User registration and login with JWT authentication
- ✅ Password hashing with bcrypt
- ✅ Create and view text-based posts
- ✅ Multiple user support with data persistence
- ✅ Modern, responsive UI design
- ✅ Real-time post updates
- ✅ Character limit (280 characters) with live counter
- ✅ Wallet integration (MetaMask) for alternative authentication

## Tech Stack

### Backend
- Node.js
- Express.js
- SQLite database
- JWT for authentication
- bcryptjs for password hashing
- CORS for cross-origin requests

### Frontend
- React 18
- React Router for navigation
- Axios for API calls
- React Hot Toast for notifications
- Lucide React for icons
- CSS3 for styling

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
```

4. Start the backend server:
```bash
npm run dev
```

The backend will be running on `http://localhost:5000`

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will be running on `http://localhost:3000`

## Usage

1. **Register**: Create a new account with username and password
2. **Login**: Sign in with your credentials
3. **Create Posts**: Write posts up to 280 characters
4. **View Feed**: See all posts from all users in chronological order
5. **Logout**: Sign out when done

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token

### Posts
- `POST /api/posts/create` - Create a new post (requires authentication)
- `GET /api/posts/all` - Get all posts (requires authentication)
- `GET /api/posts/user/:userId` - Get posts by specific user (requires authentication)

## Database Schema

### Users Table
- `id` (INTEGER PRIMARY KEY)
- `username` (TEXT UNIQUE)
- `password` (TEXT - hashed with bcrypt)
- `created_at` (DATETIME)

### Posts Table
- `id` (INTEGER PRIMARY KEY)
- `user_id` (INTEGER - foreign key to users)
- `content` (TEXT)
- `created_at` (DATETIME)

## Security Features

- Passwords are hashed using bcrypt with salt rounds
- JWT tokens for stateless authentication
- Input validation on both frontend and backend
- CORS protection
- SQL injection protection through parameterized queries

## Project Structure

```
twitter-clone/
├── backend/
│   ├── database/
│   │   └── init.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── posts.js
│   ├── package.json
│   └── server.js
├── client/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── PostForm.js
│   │   │   ├── PostList.js
│   │   │   └── Register.js
│   │   ├── context/
│   │   │   ├── AuthContext.js
│   │   │   └── WalletContext.js
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
└── README.md
```

## Development

To run both frontend and backend in development mode:

1. Open two terminal windows
2. In the first terminal, start the backend:
```bash
cd backend && npm run dev
```
3. In the second terminal, start the frontend:
```bash
cd client && npm start
```

## License

This project is for educational purposes.
