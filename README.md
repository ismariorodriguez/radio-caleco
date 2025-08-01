# Radio Calico

A live streaming radio web application featuring real-time audio streaming, dynamic track information, and interactive song rating functionality.

## Features

- **Live HLS Streaming**: High-quality audio streaming using HLS.js technology
- **Real-time Track Information**: Dynamic display of currently playing songs with album artwork
- **Interactive Rating System**: Users can rate songs with thumbs up/down functionality
- **Recently Played Tracks**: View history of recently played songs
- **User Registration**: Simple user registration system
- **Responsive Design**: Mobile-friendly interface with custom theming

## Technology Stack

### Backend
- **Node.js** with Express.js framework
- **SQLite** database for user and rating data
- **CORS** middleware for cross-origin requests
- RESTful API endpoints

### Frontend
- **Vanilla JavaScript** for interactivity
- **HLS.js** for live audio streaming
- **Custom CSS** with mint, forest-green, teal, and calico-orange theme
- Responsive design system using CSS variables

### Infrastructure
- **CloudFront CDN** for HLS stream delivery
- **SQLite** for lightweight data persistence

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/radio-caleco.git
cd radio-caleco
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
# or
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## API Endpoints

### Users
- `GET /api/users` - Retrieve all users
- `POST /api/users` - Register a new user

### Ratings
- `GET /api/ratings` - Get all song ratings
- `POST /api/ratings` - Submit a song rating

## Database Schema

### Users Table
- `id` - Primary key
- `name` - User name
- `email` - User email (unique)
- `created_at` - Registration timestamp

### Ratings Table
- `id` - Primary key
- `song_title` - Song title
- `song_artist` - Artist name
- `thumbs_up` - Number of positive ratings
- `thumbs_down` - Number of negative ratings
- Composite unique constraint on (song_title, song_artist)

## Configuration

The application uses environment variables for configuration:
- `PORT` - Server port (default: 3000)
- Additional configuration via `.env` file

## Development

### Available Scripts
- `npm start` - Start the server
- `npm run dev` - Start in development mode
- `npm test` - Run tests (placeholder)

### Project Structure
```
radio-caleco/
├── server.js          # Express server
├── database.db        # SQLite database
├── public/            # Static frontend files
│   ├── index.html     # Main application
│   ├── style.css      # Custom styling
│   └── script.js      # Frontend JavaScript
├── stream_URL.txt     # HLS stream configuration
└── package.json       # Dependencies and scripts
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Support

For support or questions, please open an issue in the GitHub repository.