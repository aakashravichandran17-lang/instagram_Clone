require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');

const connectDB = require('./config/db');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/error');
const socketService = require('./services/socket.service');

const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');
const Notification = require('./models/Notification');

const bcrypt = require('bcryptjs');


// =====================================================
// APP INITIALIZATION
// =====================================================

const app = express();
const server = http.createServer(app);


// =====================================================
// CORS CONFIGURATION
// =====================================================

const allowedOrigins = [
  'http://localhost:4200',
  'http://localhost:4300',
  'http://localhost:3000',

  // Your Vercel Angular frontend
  'https://instagram-clone-zeta-smoky.vercel.app',

  // Environment variable
  process.env.CLIENT_URL
].filter(Boolean);


app.use(
  cors({
    origin: function (origin, callback) {

      // Allow requests from Postman,
      // server-to-server requests, etc.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log('Blocked CORS origin:', origin);

      return callback(
        new Error(`CORS blocked for origin: ${origin}`)
      );
    },

    credentials: true,

    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS'
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization'
    ]
  })
);


// =====================================================
// BODY PARSING
// =====================================================

app.use(
  express.json({
    limit: '10mb'
  })
);

app.use(
  express.urlencoded({
    extended: true
  })
);


// =====================================================
// HEALTH CHECK
// =====================================================

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'ConnectHub Backend API is running',
    environment: process.env.NODE_ENV || 'development'
  });
});


app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'ConnectHub API is running',
    database: 'connected'
  });
});


// =====================================================
// API ROUTES
// =====================================================

app.use('/api', routes);


// =====================================================
// 404 + ERROR HANDLING
// =====================================================

app.use(notFound);

app.use(errorHandler);


// =====================================================
// SOCKET.IO
// =====================================================

socketService.initialize(server);


// =====================================================
// PORT
// =====================================================

const PORT = process.env.PORT || 5000;


// =====================================================
// AUTO SEED DEMO DATA
// =====================================================

const autoSeed = async () => {

  try {

    const userCount = await User.countDocuments();


    // -------------------------------------------------
    // If MongoDB Atlas already has data,
    // don't seed again.
    // -------------------------------------------------

    if (userCount > 0 && process.env.MONGO_URI) {

      console.log(
        '📦 Database already has data, skipping auto-seed.'
      );

      return;
    }


    // -------------------------------------------------
    // For in-memory database
    // -------------------------------------------------

    if (userCount > 0) {

      console.log(
        '🔄 Clearing in-memory data for fresh seed...'
      );

      await Promise.all([
        User.deleteMany({}),
        Post.deleteMany({}),
        Comment.deleteMany({}),
        Conversation.deleteMany({}),
        Message.deleteMany({}),
        Notification.deleteMany({})
      ]);
    }


    console.log('🌱 Auto-seeding demo data...');


    // -------------------------------------------------
    // Password
    // -------------------------------------------------

    const password = await bcrypt.hash(
      'password123',
      12
    );


    // =================================================
    // USERS
    // =================================================

    const users = await User.create([

      {
        username: 'john_doe',
        fullName: 'John Doe',
        email: 'john@example.com',
        password,
        bio: 'Full-stack developer. Coffee lover. Building cool things with Angular & Node.js.',
        profileImage: 'https://i.pravatar.cc/150?u=john_doe'
      },

      {
        username: 'jane_smith',
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        password,
        bio: 'UI/UX designer & frontend enthusiast. Love creating beautiful interfaces.',
        profileImage: 'https://i.pravatar.cc/150?u=jane_smith'
      },

      {
        username: 'mike_wilson',
        fullName: 'Mike Wilson',
        email: 'mike@example.com',
        password,
        bio: 'Backend engineer. MongoDB & Express.js nerd. Always learning something new.',
        profileImage: 'https://i.pravatar.cc/150?u=mike_wilson'
      },

      {
        username: 'sarah_connor',
        fullName: 'Sarah Connor',
        email: 'sarah@example.com',
        password,
        bio: 'Tech lead & mentor. Passionate about clean code and great user experiences.',
        profileImage: 'https://i.pravatar.cc/150?u=sarah_connor'
      },

      {
        username: 'alex_turner',
        fullName: 'Alex Turner',
        email: 'alex@example.com',
        password,
        bio: 'Mobile & web developer. React, Angular, Flutter — I do it all.',
        profileImage: 'https://i.pravatar.cc/150?u=alex_turner'
      }

    ]);


    // =================================================
    // FOLLOW RELATIONSHIPS
    // =================================================

    users[0].following = [
      users[1]._id,
      users[2]._id,
      users[3]._id
    ];

    users[1].followers = [
      users[0]._id
    ];

    users[2].followers = [
      users[0]._id
    ];

    users[3].followers = [
      users[0]._id
    ];


    users[1].following = [
      users[0]._id,
      users[3]._id,
      users[4]._id
    ];

    users[0].followers.push(
      users[1]._id
    );

    users[3].followers.push(
      users[1]._id
    );

    users[4].followers = [
      users[1]._id
    ];


    users[2].following = [
      users[0]._id,
      users[1]._id
    ];

    users[0].followers.push(
      users[2]._id
    );

    users[1].followers.push(
      users[2]._id
    );


    users[3].following = [
      users[0]._id,
      users[1]._id,
      users[2]._id,
      users[4]._id
    ];

    users[0].followers.push(
      users[3]._id
    );

    users[1].followers.push(
      users[3]._id
    );

    users[2].followers.push(
      users[3]._id
    );

    users[4].followers.push(
      users[3]._id
    );


    users[4].following = [
      users[0]._id,
      users[3]._id
    ];

    users[0].followers.push(
      users[4]._id
    );

    users[3].followers.push(
      users[4]._id
    );


    await Promise.all(
      users.map((user) => user.save())
    );


    // =================================================
    // POSTS
    // =================================================

    const posts = await Post.create([

      {
        author: users[0]._id,
        content:
          'Just shipped a new feature using Angular and Socket.io! Real-time updates are amazing.',
        image:
          'https://picsum.photos/seed/post1/800/500',
        likes: [
          users[1]._id,
          users[2]._id,
          users[3]._id
        ]
      },

      {
        author: users[1]._id,
        content:
          'Design tip: Whitespace is not wasted space. It gives your content room to breathe.',
        image: '',
        likes: [
          users[0]._id,
          users[3]._id
        ]
      },

      {
        author: users[2]._id,
        content:
          'MongoDB aggregation pipelines are incredibly powerful. Just learned how to do complex data transformations.',
        image:
          'https://picsum.photos/seed/post3/800/500',
        likes: [
          users[0]._id,
          users[1]._id,
          users[4]._id
        ]
      },

      {
        author: users[3]._id,
        content:
          'Mentoring junior developers is the most rewarding part of my job. Seeing them grow is priceless.',
        image: '',
        likes: [
          users[0]._id,
          users[1]._id,
          users[2]._id,
          users[4]._id
        ]
      },

      {
        author: users[4]._id,
        content:
          'Working on a new mobile app with Flutter. The hot reload feature is a game changer!',
        image:
          'https://picsum.photos/seed/post5/800/500',
        likes: [
          users[0]._id,
          users[1]._id
        ]
      },

      {
        author: users[0]._id,
        content:
          'Coffee + Code = Perfect Morning. What does your morning routine look like?',
        image: '',
        likes: [
          users[2]._id,
          users[4]._id
        ]
      },

      {
        author: users[1]._id,
        content:
          'Just finished redesigning our dashboard. Bootstrap 5 + custom CSS = beautiful results.',
        image:
          'https://picsum.photos/seed/post7/800/500',
        likes: [
          users[0]._id,
          users[2]._id,
          users[3]._id
        ]
      },

      {
        author: users[2]._id,
        content:
          'Pro tip: Always index your MongoDB collections based on your query patterns. Performance matters!',
        image: '',
        likes: [
          users[0]._id,
          users[3]._id,
          users[4]._id
        ]
      },

      {
        author: users[3]._id,
        content:
          'Team standup in 5 minutes. What did you accomplish yesterday? What are you working on today?',
        image: '',
        likes: [
          users[1]._id
        ]
      },

      {
        author: users[4]._id,
        content:
          'Exploring the new Angular signals API. The future of change detection looks bright!',
        image:
          'https://picsum.photos/seed/post10/800/500',
        likes: [
          users[0]._id,
          users[1]._id,
          users[2]._id,
          users[3]._id
        ]
      }

    ]);


    // =================================================
    // COMMENTS
    // =================================================

    const comments = await Comment.create([

      {
        post: posts[0]._id,
        author: users[1]._id,
        content:
          'That looks awesome! Great work!'
      },

      {
        post: posts[0]._id,
        author: users[2]._id,
        content:
          'Socket.io is the best for real-time features.'
      },

      {
        post: posts[1]._id,
        author: users[0]._id,
        content:
          'So true! Whitespace makes such a difference.'
      },

      {
        post: posts[3]._id,
        author: users[0]._id,
        content:
          'You are an amazing mentor, Sarah!'
      },

      {
        post: posts[3]._id,
        author: users[4]._id,
        content:
          'Agreed! Mentorship is so important.'
      },

      {
        post: posts[6]._id,
        author: users[0]._id,
        content:
          'The new design looks clean! Nice job Jane.'
      },

      {
        post: posts[9]._id,
        author: users[1]._id,
        content:
          'Signals are going to change everything!'
      }

    ]);


    posts[0].comments = [
      comments[0]._id,
      comments[1]._id
    ];

    posts[1].comments = [
      comments[2]._id
    ];

    posts[3].comments = [
      comments[3]._id,
      comments[4]._id
    ];

    posts[6].comments = [
      comments[5]._id
    ];

    posts[9].comments = [
      comments[6]._id
    ];


    await Promise.all(
      posts.map((post) => post.save())
    );


    // =================================================
    // CONVERSATIONS
    // =================================================

    const conv1 = await Conversation.create({
      participants: [
        users[0]._id,
        users[1]._id
      ]
    });

    const conv2 = await Conversation.create({
      participants: [
        users[0]._id,
        users[2]._id
      ]
    });

    const conv3 = await Conversation.create({
      participants: [
        users[0]._id,
        users[3]._id
      ]
    });


    // =================================================
    // MESSAGES
    // =================================================

    const messages1 = await Message.create([

      {
        conversation: conv1._id,
        sender: users[0]._id,
        receiver: users[1]._id,
        message:
          'Hey Jane! How is the new design coming along?',
        isRead: true,
        readAt: new Date()
      },

      {
        conversation: conv1._id,
        sender: users[1]._id,
        receiver: users[0]._id,
        message:
          'Going great! Almost done with the dashboard mockups.',
        isRead: true,
        readAt: new Date()
      },

      {
        conversation: conv1._id,
        sender: users[0]._id,
        receiver: users[1]._id,
        message:
          'Awesome! Can not wait to see them.',
        isRead: true,
        readAt: new Date()
      },

      {
        conversation: conv1._id,
        sender: users[1]._id,
        receiver: users[0]._id,
        message:
          'I will send them over tonight!',
        isRead: false
      }

    ]);


    const messages2 = await Message.create([

      {
        conversation: conv2._id,
        sender: users[2]._id,
        receiver: users[0]._id,
        message:
          'John, did you see the new MongoDB indexing docs?',
        isRead: true,
        readAt: new Date()
      },

      {
        conversation: conv2._id,
        sender: users[0]._id,
        receiver: users[2]._id,
        message:
          'Not yet! Send me the link?',
        isRead: true,
        readAt: new Date()
      },

      {
        conversation: conv2._id,
        sender: users[2]._id,
        receiver: users[0]._id,
        message:
          'Sure, checking now...',
        isRead: false
      }

    ]);


    const messages3 = await Message.create([

      {
        conversation: conv3._id,
        sender: users[3]._id,
        receiver: users[0]._id,
        message:
          'Great presentation today!',
        isRead: true,
        readAt: new Date()
      },

      {
        conversation: conv3._id,
        sender: users[0]._id,
        receiver: users[3]._id,
        message:
          'Thanks Sarah! Your feedback really helped.',
        isRead: false
      }

    ]);


    // =================================================
    // LAST MESSAGE
    // =================================================

    conv1.lastMessage =
      messages1[messages1.length - 1]._id;

    conv2.lastMessage =
      messages2[messages2.length - 1]._id;

    conv3.lastMessage =
      messages3[messages3.length - 1]._id;


    await Promise.all([
      conv1.save(),
      conv2.save(),
      conv3.save()
    ]);


    // =================================================
    // NOTIFICATIONS
    // =================================================

    await Notification.create([

      {
        recipient: users[0]._id,
        sender: users[1]._id,
        type: 'follow',
        message: 'started following you',
        relatedId: users[1]._id
      },

      {
        recipient: users[0]._id,
        sender: users[2]._id,
        type: 'like',
        message: 'liked your post',
        relatedId: posts[0]._id
      },

      {
        recipient: users[0]._id,
        sender: users[3]._id,
        type: 'comment',
        message: 'commented on your post',
        relatedId: posts[0]._id
      },

      {
        recipient: users[0]._id,
        sender: users[1]._id,
        type: 'message',
        message: 'sent you a message',
        relatedId: messages1[3]._id
      },

      {
        recipient: users[1]._id,
        sender: users[0]._id,
        type: 'like',
        message: 'liked your post',
        relatedId: posts[1]._id
      },

      {
        recipient: users[2]._id,
        sender: users[0]._id,
        type: 'follow',
        message: 'started following you',
        relatedId: users[0]._id
      }

    ]);


    console.log(
      '✅ Auto-seed completed successfully!'
    );

    console.log('');
    console.log('Demo login credentials:');
    console.log('Email: john@example.com');
    console.log('Password: password123');
    console.log('');


  } catch (error) {

    console.error(
      '❌ Auto-seed error:',
      error.message
    );
  }
};


// =====================================================
// START SERVER
// =====================================================

const startServer = async () => {

  try {

    await connectDB();

    console.log(
      '✅ MongoDB connected successfully'
    );


    await autoSeed();


    server.listen(PORT, () => {

      console.log(
        `🚀 Server running on port ${PORT}`
      );

      console.log(
        `📡 API running at /api`
      );

      console.log(
        `🌍 Environment: ${
          process.env.NODE_ENV || 'development'
        }`
      );

    });

  } catch (error) {

    console.error(
      '❌ Failed to start server:',
      error.message
    );

    process.exit(1);
  }
};


startServer();