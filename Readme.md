# VideoTube

A full-stack video sharing platform built with modern web technologies. VideoTube allows users to upload, share, and interact with videos, featuring a comprehensive set of social features including comments, likes, subscriptions, playlists, and community posts.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## Features

### User Management

- User registration with email verification
- Secure authentication with JWT tokens
- Profile management (avatar, cover image, account details)
- Password change functionality
- Account deletion

### Video Features

- Video upload with thumbnail
- Video playback with custom player
- Video metadata (title, description, duration, views)
- Video editing and deletion
- Watch history tracking
- Trending videos
- Video search functionality

### Social Features

- Like/unlike videos
- Comment on videos with edit and delete options
- Subscribe/unsubscribe to channels
- View subscriber count
- Community posts (tweets) for channels
- Like and comment on community posts

### Playlists

- Create and manage playlists
- Add/remove videos from playlists
- Public playlist viewing
- Playlist organization

### Dashboard

- Channel statistics (views, subscribers, videos, likes)
- Video management interface
- Quick access to channel metrics

### Notifications

- Real-time notification system
- Notifications for likes, subscriptions, and comments
- Mark as read/unread functionality
- Notification count badge

## Tech Stack

### Frontend

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TanStack Query (React Query)** - Data fetching and caching
- **React Router v7** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **React Hot Toast** - Toast notifications
- **Axios** - HTTP client

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **Cloudinary** - Media storage and management
- **Nodemailer** - Email service

## Environment Variables

### Backend (.env)

Create a `.env` file in the `Backend` directory with the following variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=your_frontend_url

ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

EMAIL_HOST=your_smtp_host
EMAIL_PORT=587
EMAIL_USER=your_email_address
EMAIL_PASS=your_email_password
EMAIL_FROM=your_sender_email

FRONTEND_URL=your_frontend_url
```

### Frontend (.env)

Create a `.env` file in the `Frontend` directory:

```env
VITE_API_URL=your_backend_url/api/v1
```

## Running the Application

### Development Mode

#### Start Backend Server

```bash
cd Backend
npm run dev
```

The backend server will start on `http://localhost:8000`

#### Start Frontend Development Server

```bash
cd Frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

### Production Build

#### Build Frontend

```bash
cd Frontend
npm run build
```

#### Start Production Server

```bash
cd Backend
npm start
```

### Using Start Scripts

Alternatively, you can use the provided start scripts:

**Windows:**

```bash
start.bat
```

**Linux/Mac:**

```bash
chmod +x start.sh
./start.sh
```

## Project Structure

```
Video_Tube/
├── Backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── middlewares/     # Custom middlewares
│   │   ├── utils/           # Utility functions
│   │   ├── db/              # Database configuration
│   │   ├── app.js           # Express app setup
│   │   └── index.js         # Entry point
│   ├── public/temp/         # Temporary file storage
│   └── package.json
│
├── Frontend/
│   ├── src/
│   │   ├── api/             # API client functions
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React context
│   │   ├── hooks/           # Custom hooks
│   │   ├── types/           # TypeScript types
│   │   ├── assets/          # Static assets
│   │   ├── App.tsx          # Root component
│   │   └── main.tsx         # Entry point
│   ├── public/              # Public assets
│   └── package.json
│
├── README.md                # This file
├── start.bat                # Windows start script
└── start.sh                 # Unix start script
```

## API Documentation

### Authentication Endpoints

- `POST /api/v1/users/register` - Register new user
- `POST /api/v1/users/verify-email/:token` - Verify email
- `POST /api/v1/users/login` - User login
- `POST /api/v1/users/logout` - User logout
- `POST /api/v1/users/refresh-token` - Refresh access token

### User Endpoints

- `GET /api/v1/users/current-user` - Get current user
- `PATCH /api/v1/users/update-account` - Update account details
- `PATCH /api/v1/users/avatar` - Update avatar
- `PATCH /api/v1/users/cover-image` - Update cover image
- `POST /api/v1/users/change-password` - Change password
- `GET /api/v1/users/c/:username` - Get channel profile
- `GET /api/v1/users/history` - Get watch history
- `DELETE /api/v1/users/delete-account` - Delete account

### Video Endpoints

- `GET /api/v1/videos` - Get all videos (with search and pagination)
- `POST /api/v1/videos` - Upload video
- `GET /api/v1/videos/:videoId` - Get video by ID
- `PATCH /api/v1/videos/:videoId` - Update video
- `DELETE /api/v1/videos/:videoId` - Delete video
- `PATCH /api/v1/videos/:videoId/toggle-publish` - Toggle publish status

### Comment Endpoints

- `GET /api/v1/comments/:videoId` - Get video comments
- `POST /api/v1/comments/:videoId` - Add comment
- `PATCH /api/v1/comments/c/:commentId` - Update comment
- `DELETE /api/v1/comments/c/:commentId` - Delete comment

### Like Endpoints

- `POST /api/v1/likes/toggle/v/:videoId` - Toggle video like
- `POST /api/v1/likes/toggle/c/:commentId` - Toggle comment like
- `POST /api/v1/likes/toggle/t/:tweetId` - Toggle tweet like
- `GET /api/v1/likes/videos` - Get liked videos

### Subscription Endpoints

- `POST /api/v1/subscriptions/c/:channelId` - Toggle subscription
- `GET /api/v1/subscriptions/c/:channelId` - Get channel subscribers
- `GET /api/v1/subscriptions/u/:subscriberId` - Get user subscriptions

### Playlist Endpoints

- `POST /api/v1/playlists` - Create playlist
- `GET /api/v1/playlists/:playlistId` - Get playlist by ID
- `PATCH /api/v1/playlists/:playlistId` - Update playlist
- `DELETE /api/v1/playlists/:playlistId` - Delete playlist
- `PATCH /api/v1/playlists/add/:videoId/:playlistId` - Add video to playlist
- `PATCH /api/v1/playlists/remove/:videoId/:playlistId` - Remove video from playlist
- `GET /api/v1/playlists/user/:userId` - Get user playlists

### Tweet Endpoints

- `POST /api/v1/tweets` - Create tweet
- `GET /api/v1/tweets/user/:userId` - Get user tweets
- `PATCH /api/v1/tweets/:tweetId` - Update tweet
- `DELETE /api/v1/tweets/:tweetId` - Delete tweet

### Dashboard Endpoints

- `GET /api/v1/dashboard/stats` - Get channel statistics
- `GET /api/v1/dashboard/videos` - Get channel videos

### Notification Endpoints

- `GET /api/v1/notifications` - Get notifications
- `GET /api/v1/notifications/unread-count` - Get unread count
- `PATCH /api/v1/notifications/:notificationId/read` - Mark as read
- `PATCH /api/v1/notifications/mark-all-read` - Mark all as read
- `DELETE /api/v1/notifications/:notificationId` - Delete notification

## Key Features Implementation

### Authentication Flow

1. User registers with email, username, and password
2. Verification email sent to user's email address
3. User clicks verification link to activate account
4. User can log in with email/username and password
5. JWT tokens (access and refresh) manage authentication state

### Video Upload Process

1. User selects video file and thumbnail image
2. Files uploaded to Cloudinary
3. Video metadata stored in MongoDB
4. Video processing for duration and other metadata
5. Video becomes available for viewing

### Notification System

1. Actions (likes, comments, subscriptions) trigger notifications
2. Notifications stored in database with user references
3. Real-time badge update showing unread count
4. Users can view, mark as read, or delete notifications

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built as a learning project to demonstrate full-stack development skills
- Inspired by modern video sharing platforms
- Uses best practices for React, Node.js, and MongoDB development

## Support

For support, email your-email@example.com or open an issue in the repository.

## Authors

- Shubhanshu Singh - Initial work

## Project Status

Active development - Features are being added and improved regularly.
