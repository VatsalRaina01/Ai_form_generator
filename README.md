# AI Form Generator 🤖📝

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Pinecone](https://img.shields.io/badge/Pinecone-000000?style=for-the-badge&logo=pinecone&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)

> **🚀 Live Demo:** [https://ai-form-generator-frontend-eosin.vercel.app/generate](https://ai-form-generator-frontend-eosin.vercel.app/generate)

An advanced web application that leverages Artificial Intelligence to generate dynamic, interactive forms automatically. Built with the MERN stack and enhanced with vector database capabilities for intelligent context management.

## 🚀 Features

-   **AI-Powered Form Generation**: Describe your form requirements in natural language, and let the AI build it for you.
-   **Dynamic Frontend**: Responsive and modern UI built with Next.js and Tailwind CSS.
-   **Robust Backend**: Scalable API server using Node.js and Express.
-   **Intelligent Search**: Utilizes Pinecone vector database and OpenAI embeddings for semantic search and context retrieval.
-   **Data Persistence**: Securely stores form data and user information in MongoDB.

## 🛠️ Tech Stack

### Frontend
-   **Framework**: [Next.js](https://nextjs.org/) (React)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Icons**: [Lucide React](https://lucide.dev/)

### Backend
-   **Runtime**: [Node.js](https://nodejs.org/)
-   **Framework**: [Express.js](https://expressjs.com/)
-   **Database**: [MongoDB](https://www.mongodb.com/)
-   **Vector DB**: [Pinecone](https://www.pinecone.io/)
-   **AI**: [OpenAI API](https://openai.com/)

## 📋 Prerequisites

Before running the application, ensure you have the following installed:
-   [Node.js](https://nodejs.org/) (v16+)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
-   [MongoDB](https://www.mongodb.com/try/download/community) (running locally or a cloud instance)

## 🏁 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/VatsalRaina01/Ai_form_generator.git
cd Ai_form_generator
```

### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with the following variables:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai_form_generator
GITHUB_TOKEN_CHAT=your_github_token
GITHUB_TOKEN_EMBEDDING=your_github_token
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX=your_index_name
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
JWT_SECRET=your_jwt_secret
```

Start the backend server:

```bash
npm start
# or for development with auto-reload:
# npm run dev
```

### 3. Frontend Setup

Open a new terminal, navigate to the frontend directory, and install dependencies:

```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend` directory if needed (refer to frontend config).

Start the development server:

```bash
npm run dev
```

The application should now be accessible at `http://localhost:3000` (or the port specified).

## 📄 License

This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).
