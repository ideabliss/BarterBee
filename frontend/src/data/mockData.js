// Mock data for BarterBee application

export const mockUsers = [
  {
    id: 1,
    username: "tanishka_cook",
    name: "Tanishka Sharma",
    email: "tanishka@example.com",
    contact: "+91 9876543210",
    address: "Mumbai, Maharashtra",
    profilePicture: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    skills: [
      {
        id: 1,
        name: "Cooking",
        description: "Expert in Indian cuisine, 5+ years experience",
        category: "Culinary",
        image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop"
      },
      {
        id: 2,
        name: "Photography",
        description: "Portrait and landscape photography",
        category: "Creative",
        image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=300&h=200&fit=crop"
      }
    ],
    things: [
      {
        id: 1,
        name: "White Nights Book",
        description: "Dostoevsky's classic novel in excellent condition",
        category: "Books",
        image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=200&fit=crop",
        available: true
      }
    ],
    opinions: [
      {
        id: 1,
        question: "Which programming language should I learn first?",
        type: "text",
        options: ["JavaScript", "Python", "Java", "C++"],
        votes: [15, 23, 8, 4],
        totalVotes: 50
      }
    ],
    points: 15
  },
  {
    id: 2,
    username: "rudra_guitar",
    name: "Rudra Patel",
    email: "rudra@example.com",
    contact: "+91 9876543211",
    address: "Pune, Maharashtra",
    profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    skills: [
      {
        id: 3,
        name: "Guitar Playing",
        description: "Classical and acoustic guitar, 3+ years experience",
        category: "Music",
        image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=300&h=200&fit=crop"
      },
      {
        id: 4,
        name: "Web Development",
        description: "React, Node.js, and modern web technologies",
        category: "Technology",
        image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=200&fit=crop"
      }
    ],
    things: [
      {
        id: 2,
        name: "Metamorphosis Book",
        description: "Kafka's masterpiece, great for literature lovers",
        category: "Books",
        image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop",
        available: true
      },
      {
        id: 3,
        name: "Acoustic Guitar",
        description: "Yamaha FG800, perfect for beginners",
        category: "Instruments",
        image: "https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=300&h=200&fit=crop",
        available: false
      }
    ],
    opinions: [
      {
        id: 2,
        question: "Which gift is better for a book lover?",
        type: "image",
        options: [
          {
            text: "Vintage Bookends",
            image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=150&fit=crop"
          },
          {
            text: "Reading Light",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=150&fit=crop"
          }
        ],
        votes: [12, 18],
        totalVotes: 30
      }
    ],
    points: 8
  },
  {
    id: 3,
    username: "priya_artist",
    name: "Priya Singh",
    email: "priya@example.com",
    contact: "+91 9876543212",
    address: "Delhi, India",
    profilePicture: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    skills: [
      {
        id: 5,
        name: "Digital Art",
        description: "Character design and digital illustrations",
        category: "Creative",
        image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=200&fit=crop"
      }
    ],
    things: [
      {
        id: 4,
        name: "Drawing Tablet",
        description: "Wacom Intuos, barely used",
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1586953268751-09cb3ac5c228?w=300&h=200&fit=crop",
        available: true
      }
    ],
    opinions: [],
    points: 12
  }
];

export const mockBarterRequests = [
  {
    id: 1,
    type: "skill",
    from: mockUsers[0],
    to: mockUsers[1],
    fromSkill: mockUsers[0].skills[0], // Cooking
    toSkill: mockUsers[1].skills[0], // Guitar
    status: "pending",
    message: "I'd love to learn guitar in exchange for cooking lessons!",
    createdAt: "2024-03-15T10:30:00Z",
    scheduledDate: null,
    scheduledTime: null
  },
  {
    id: 2,
    type: "thing",
    from: mockUsers[1],
    to: mockUsers[0],
    fromThing: mockUsers[1].things[0], // Metamorphosis
    toThing: mockUsers[0].things[0], // White Nights
    status: "accepted",
    message: "Book exchange for 2 weeks?",
    createdAt: "2024-03-14T15:45:00Z",
    barterPeriod: 14, // days
    trackingInfo: {
      packageSent: true,
      packageReceived: false,
      returnSent: false,
      returnReceived: false
    }
  }
];

export const mockSessions = [
  {
    id: 1,
    barterRequestId: 1,
    participants: [mockUsers[0], mockUsers[1]],
    scheduledDate: "2024-03-20",
    scheduledTime: "18:00",
    status: "scheduled", // scheduled, ongoing, completed
    sessionNumber: 1,
    notes: ""
  }
];

export const mockPolls = [
  {
    id: 1,
    userId: 2,
    user: mockUsers[1],
    question: "Which programming language should I learn for web development?",
    type: "text",
    options: ["JavaScript", "Python", "TypeScript", "Go"],
    votes: [25, 15, 12, 8],
    totalVotes: 60,
    userVoted: false,
    createdAt: "2024-03-15T12:00:00Z"
  },
  {
    id: 2,
    userId: 0,
    user: mockUsers[0],
    question: "Which outfit looks better for a job interview?",
    type: "image",
    options: [
      {
        text: "Formal Suit",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=250&fit=crop"
      },
      {
        text: "Business Casual",
        image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=250&fit=crop"
      },
      {
        text: "Smart Casual",
        image: "https://images.unsplash.com/photo-1594824709592-48f06af964f8?w=200&h=250&fit=crop"
      }
    ],
    votes: [18, 22, 10],
    totalVotes: 50,
    userVoted: true,
    userVote: 1,
    createdAt: "2024-03-14T09:30:00Z"
  },
  {
    id: 3,
    userId: 2,
    user: mockUsers[2],
    question: "Best color scheme for a mobile app?",
    type: "image",
    options: [
      {
        text: "Blue & White",
        image: "https://images.unsplash.com/photo-1586953268751-09cb3ac5c228?w=200&h=150&fit=crop"
      },
      {
        text: "Dark Mode",
        image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&h=150&fit=crop"
      }
    ],
    votes: [15, 20],
    totalVotes: 35,
    userVoted: false,
    createdAt: "2024-03-13T14:15:00Z"
  }
];

export const mockNotifications = [
  {
    id: 1,
    type: "barter_request",
    title: "New Barter Request",
    message: "Rudra wants to exchange books with you",
    read: false,
    createdAt: "2024-03-15T16:30:00Z",
    actionUrl: "/profile"
  },
  {
    id: 2,
    type: "session_reminder",
    title: "Session Starting Soon",
    message: "Your cooking session with Rudra starts in 30 minutes",
    read: false,
    createdAt: "2024-03-15T17:30:00Z",
    actionUrl: "/session/1"
  },
  {
    id: 3,
    type: "package_update",
    title: "Package Delivered",
    message: "Your book has been delivered to Tanishka",
    read: true,
    createdAt: "2024-03-14T11:00:00Z",
    actionUrl: "/barter/2"
  }
];

// Current user (for demo purposes)
export const currentUser = mockUsers[0];