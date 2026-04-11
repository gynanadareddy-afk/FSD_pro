# CSE Department Website

A responsive department site with a Node.js backend that now runs fully locally using an in-memory MongoDB instance.

## Local Development

### What changed
- The local backend uses `mongodb-memory-server-core`, so you do not need a separately installed MongoDB server.
- The frontend now reads homepage data from the Node API instead of falling back to hardcoded arrays in the browser.
- Contact form submissions are stored in the in-memory database for the current run.

### Prerequisites
- Node.js 18+
- npm

If the project is opened through WSL, make sure `node` and `npm` are installed inside Ubuntu as native Linux tools. Using Windows `npm` against the `\\wsl.localhost` path will break package installation.

### Start the app
1. Go to the backend folder:
  ```bash
  cd backend
  ```
2. Install dependencies:
  ```bash
  npm install
  ```
3. Start the local server:
  ```bash
  npm start
  ```

For auto-reload during development:

```bash
npm run dev
```

Open `http://localhost:5000`.

## Local API

- `GET /api/health`
- `GET /api/faculty`
- `GET /api/news?limit=3`
- `GET /api/events?limit=3`
- `GET /api/courses`
- `POST /api/contact`

## Notes

- Data is seeded automatically every time the server starts.
- Because the database is in memory, any submitted contact messages are cleared when the server stops.
- The PHP/MySQL files under `backend/api`, `backend/config`, and `backend/database` are still present, but they are no longer required for the local Node-based flow.

## Website Sections

### 1. Hero Section
- Eye-catching gradient background
- Animated floating cards
- Call-to-action buttons
- Smooth scroll indicator

### 2. About Section
- Department overview
- Statistics with animated counters
- Mission and vision

### 3. Academic Programs
- B.Tech CSE
- M.Tech CSE
- Ph.D. Program
- Each program features highlights and curriculum focus

### 4. Faculty Section
- Faculty profiles with specializations
- Contact information
- Professional backgrounds

### 5. Research Areas
- Artificial Intelligence
- Cybersecurity
- Cloud Computing
- Big Data Analytics
- IoT & Embedded Systems
- Virtual Reality

### 6. Events & News
- Latest department news
- Upcoming events calendar
- Workshops and seminars

### 7. Contact Section
- Department contact information
- Interactive contact form
- Location details

### 8. Footer
- Quick navigation links
- Social media links
- Contact information

## Design Features

### Visual Elements
- **Color Scheme**: Professional blue and purple gradients
- **Typography**: Clean Inter font family
- **Icons**: Font Awesome icons throughout
- **Animations**: Smooth transitions and micro-interactions

### Interactive Features
- **Responsive Navigation**: Mobile-friendly hamburger menu
- **Smooth Scrolling**: Seamless navigation between sections
- **Hover Effects**: Interactive card animations
- **Parallax Scrolling**: Hero section depth effect
- **Loading Animations**: Content reveal on scroll

### Performance Optimizations
- **Lazy Loading**: Images and content loaded as needed
- **Optimized Animations**: CSS transforms for smooth performance
- **Responsive Images**: Properly sized for different devices
- **Minified Code**: Clean, efficient code structure

## Database Schema

### Faculty Collection
```javascript
{
  name: String,
  designation: String,
  email: String,
  specialization: [String],
  image: String,
  bio: String
}
```

### News Collection
```javascript
{
  title: String,
  content: String,
  date: Date,
  author: String,
  category: String
}
```

### Events Collection
```javascript
{
  title: String,
  description: String,
  date: Date,
  venue: String,
  speaker: String,
  type: String
}
```

### Courses Collection
```javascript
{
  name: String,
  code: String,
  credits: Number,
  semester: String,
  description: String,
  faculty: String
}
```

## Customization

### Adding Your College Information
1. Update the college name and details in `index.html`
2. Modify the contact information in the footer section
3. Update the MongoDB connection string in `.env`
4. Customize the color scheme in `styles.css`

### Adding New Content
1. Add new items to the MongoDB collections
2. The frontend will automatically display the new data
3. Modify the API endpoints if needed

## Browser Support

- Chrome (v60+)
- Firefox (v55+)
- Safari (v12+)
- Edge (v79+)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For any questions or issues, please contact:
- Email: hod.cse@college.edu
- Phone: +91 12345 67890

---

**Note**: Make sure MongoDB is running on your system before starting the backend server. The application will automatically populate the database with sample data on first run.
