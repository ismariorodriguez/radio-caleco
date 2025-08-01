# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm start` or `npm run dev` - Start the Express.js in the background (runs on port 3000 by default)
- `npm test` - Run tests (currently returns placeholder error - no tests configured)

## Architecture Overview

Radio Calico is a live streaming radio web application with the following architecture:

### Backend (Node.js/Express)
- **Server**: Express.js server (`server.js`) handling both web serving and API endpoints
- **Database**: SQLite database (`database.db`) with two main tables:
  - `users` - User registration data (id, name, email, created_at)
  - `ratings` - Song rating system (id, song_title, song_artist, thumbs_up, thumbs_down, timestamps)
- **API Endpoints**:
  - `/api/users` - GET/POST for user management
  - `/api/ratings` - GET/POST for song rating functionality
- **Static Files**: Serves from `public/` directory

### Frontend (Vanilla HTML/CSS/JavaScript)
- **Main Interface**: Single-page application (`public/index.html`) 
- **HLS Streaming**: Uses HLS.js for live audio streaming from CloudFront CDN
- **Stream URL**: Configured in `stream_URL.txt` (https://d3d4yli4hf5bmh.cloudfront.net/hls/live.m3u8)
- **Features**:
  - Live audio player with HLS support
  - Dynamic track information display with album artwork
  - Real-time song rating system (thumbs up/down)
  - Recently played tracks list
  - Responsive design with custom CSS variables for theming

### Key Technologies
- **Backend**: Express.js, SQLite3, CORS middleware
- **Frontend**: HLS.js for streaming, vanilla JavaScript for interactivity
- **Styling**: Custom CSS with design system using CSS variables (mint, forest-green, teal, calico-orange theme)

### Database Schema
- Users table: Basic user registration with email uniqueness constraint
- Ratings table: Song ratings with composite unique constraint on (song_title, song_artist)

### Development Notes
- Server runs on port 3000 by default (configurable via PORT env var)
- Uses dotenv for environment configuration
- Graceful shutdown handling for database connections
- Mock song database in frontend for demo track rotation (30-60 second intervals)

### Style Guide
- A text version of the styling guide for the webpage is at /radiocalico/RadioCalico_Style_Guide.txt
- The Radio Calico logo if at RadioCalicoLogoTM.png