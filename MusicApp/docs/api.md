# MusicApp API Documentation

## Overview

MusicApp is a music streaming application with REST API built using Node.js, Express, and Sequelize. The API provides endpoints for user authentication, music search, playlists, favorites, and YouTube integration.

Base URL: `http://localhost:3000/api` (development) or your deployed URL.

## Authentication

Most endpoints require authentication using JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication Routes (`/auth`)

#### Register User

- **Method**: `POST`
- **Endpoint**: `/auth/register`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "User Name"
  }
  ```
- **Response**: User object with token

#### Login User

- **Method**: `POST`
- **Endpoint**: `/auth/login`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**: User object with token

#### Google OAuth

- **Method**: `POST`
- **Endpoint**: `/auth/google`
- **Body**:
  ```json
  {
    "token": "google-id-token"
  }
  ```
- **Response**: User object with token

#### Get Current User

- **Method**: `GET`
- **Endpoint**: `/auth/me`
- **Auth Required**: Yes
- **Response**: Current user object

#### Update Profile

- **Method**: `PUT`
- **Endpoint**: `/auth/profile`
- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "name": "New Name",
    "email": "newemail@example.com"
  }
  ```
- **Response**: Updated user object

### Music Routes (`/music`)

#### Search Music

- **Method**: `GET`
- **Endpoint**: `/music/search?q=query&limit=20`
- **Auth Required**: Yes
- **Query Params**: `q` (search term), `limit` (optional, default 20)
- **Response**: Array of tracks

#### Search by Genre

- **Method**: `GET`
- **Endpoint**: `/music/genre/:genre`
- **Auth Required**: Yes
- **Response**: Array of tracks by genre

#### Search by Mood

- **Method**: `POST`
- **Endpoint**: `/music/mood`
- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "mood": "happy",
    "limit": 20
  }
  ```
- **Response**: Array of tracks matching mood

#### Get Song Details

- **Method**: `GET`
- **Endpoint**: `/music/:id`
- **Auth Required**: Yes
- **Response**: Song details object

#### Get Song Lyrics

- **Method**: `GET`
- **Endpoint**: `/music/:id/lyrics`
- **Auth Required**: Yes
- **Response**: Lyrics object

#### Get Search History

- **Method**: `GET`
- **Endpoint**: `/music/history/user`
- **Auth Required**: Yes
- **Response**: Array of search history

#### Generate AI Lyrics

- **Method**: `POST`
- **Endpoint**: `/music/:id/generate-lyrics`
- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "prompt": "custom prompt"
  }
  ```
- **Response**: Generated lyrics

### Playlist Routes (`/playlists`)

#### Create Playlist

- **Method**: `POST`
- **Endpoint**: `/playlists/`
- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "name": "My Playlist",
    "description": "Description"
  }
  ```
- **Response**: Created playlist object

#### Get User Playlists

- **Method**: `GET`
- **Endpoint**: `/playlists/`
- **Auth Required**: Yes
- **Response**: Array of user's playlists

#### Get Playlist by ID

- **Method**: `GET`
- **Endpoint**: `/playlists/:id`
- **Auth Required**: Yes
- **Response**: Playlist object with songs

#### Generate Playlist Description

- **Method**: `POST`
- **Endpoint**: `/playlists/:id/generate-description`
- **Auth Required**: Yes
- **Response**: Generated description

#### Update Playlist

- **Method**: `PUT`
- **Endpoint**: `/playlists/:id`
- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "name": "Updated Name",
    "description": "Updated Description"
  }
  ```
- **Response**: Updated playlist object

#### Delete Playlist

- **Method**: `DELETE`
- **Endpoint**: `/playlists/:id`
- **Auth Required**: Yes
- **Response**: Success message

#### Add Song to Playlist

- **Method**: `POST`
- **Endpoint**: `/playlists/:playlistId/songs`
- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "songId": "song-id",
    "spotifyId": "spotify-id"
  }
  ```
- **Response**: Success message

#### Remove Song from Playlist

- **Method**: `DELETE`
- **Endpoint**: `/playlists/:playlistId/songs/:songId`
- **Auth Required**: Yes
- **Response**: Success message

### Favorites Routes (`/favorites`)

#### Add to Favorites

- **Method**: `POST`
- **Endpoint**: `/favorites/`
- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "songId": "song-id",
    "spotifyId": "spotify-id",
    "title": "Song Title",
    "artists": ["Artist"],
    "album": "Album",
    "imageUrl": "image-url",
    "duration": 300000,
    "previewUrl": "preview-url",
    "externalUrl": "external-url"
  }
  ```
- **Response**: Created favorite object

#### Get All Favorites

- **Method**: `GET`
- **Endpoint**: `/favorites/`
- **Auth Required**: Yes
- **Response**: Array of favorite songs

#### Check if Song is Favorite

- **Method**: `GET`
- **Endpoint**: `/favorites/:songId`
- **Auth Required**: Yes
- **Response**: Boolean indicating if favorite

#### Remove from Favorites

- **Method**: `DELETE`
- **Endpoint**: `/favorites/:songId`
- **Auth Required**: Yes
- **Response**: Success message

### YouTube Routes (`/youtube`)

#### Search YouTube

- **Method**: `GET`
- **Endpoint**: `/youtube/search/:query`
- **Auth Required**: No
- **Response**: YouTube video object

### Health Check

- **Method**: `GET`
- **Endpoint**: `/health`
- **Auth Required**: No
- **Response**:
  ```json
  {
    "status": "Server is running",
    "timestamp": "2025-12-12T..."
  }
  ```

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": "Error message",
  "details": "Additional details (optional)"
}
```

Common HTTP status codes:

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Data Models

### User

```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "User Name",
  "googleId": null,
  "createdAt": "2025-12-12T...",
  "updatedAt": "2025-12-12T..."
}
```

### Song

```json
{
  "id": "song-id",
  "spotifyId": "spotify-id",
  "title": "Song Title",
  "artists": ["Artist Name"],
  "album": "Album Name",
  "imageUrl": "image-url",
  "duration": 300000,
  "previewUrl": "preview-url",
  "externalUrl": "external-url"
}
```

### Playlist

```json
{
  "id": 1,
  "name": "Playlist Name",
  "description": "Description",
  "userId": 1,
  "songs": [...]
}
```

## Notes

- All requests should include `Content-Type: application/json` header.
- Timestamps are in ISO 8601 format.
- Spotify integration requires valid API credentials.
- AI features (lyrics generation, playlist descriptions) may require additional API keys.</content>
  <parameter name="filePath">D:/Hamdi/Hacktiv8/Phase2/Individual Project/IP-HCK90/MusicApp/docs/api.md
