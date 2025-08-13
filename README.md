# 📝 MERN Blog Application

A **full-stack blog platform** built with **Node.js**, **Express**, **MongoDB**, **React**, **TypeScript**, **React Query**, and **Tailwind CSS**.  
It includes authentication, post management, commenting, likes, bookmarks, and image uploads — with a modern, responsive UI.

---

## 🚀 Features

### Backend (Node.js + Express + MongoDB)
- **User Authentication**: JWT-based login/register with bcrypt password hashing
- **Blog Post CRUD**: Create, read, update, delete posts with author permissions
- **Comment System**: Add/delete comments with author and admin permissions
- **Like & Bookmark**: Toggle likes and bookmarks on posts
- **File Uploads**: Upload cover images using Multer
- **Admin Moderation**: Admin can delete any post or comment
- **Security**: CORS, Helmet, input validation, error handling
- **Testing**: Jest tests for all features

### Frontend (React + TypeScript + Tailwind CSS)
- **Authentication**: Login/register pages with form validation
- **Blog Listing**: Home page with search & featured posts
- **Rich Text Editor**: React Quill for creating posts with formatting
- **Post Management**: Create, edit, and delete posts
- **Interactive Features**: Like, bookmark, and comment on posts
- **Responsive Design**: Works on desktop, tablet, and mobile
- **UX**: Loading states, error handling, smooth navigation

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/yourusername/blog-app.git
cd blog-app
```
### 2️⃣ Install Backend Dependencies
```bash
cd backend
npm install
```
### 3️⃣ Configure Environment Variables
Create a .env file inside the backend folder:
```bash
PORT=5000
MONGO_URI=mongodb://localhost:27017/blog
JWT_SECRET=your_jwt_secret
```
### 4️⃣ Run Backend Server
```bash
npm run dev
```
### 5️⃣ Install Frontend Dependencies
```bash
Open a new terminal:
cd frontend
npm install
```
### 6️⃣ Run Frontend App
```bash
npm run dev
```
### 7️⃣ Access the Application
Open your browser and go to:
```bash
http://localhost:5173
```
## 📡 API Endpoints

---

### **Auth**
| Method | Endpoint              | Description   |
| ------ | --------------------- | ------------- |
| POST   | `/api/auth/register`  | Register user |
| POST   | `/api/auth/login`     | Login user    |

---

### **Posts**
| Method | Endpoint               | Description            |
| ------ | ---------------------- | ---------------------- |
| GET    | `/api/posts`           | Get all posts          |
| GET    | `/api/posts/:id`       | Get single post        |
| POST   | `/api/posts`           | Create post (auth)     |
| PUT    | `/api/posts/:id`       | Update post (auth)     |
| DELETE | `/api/posts/:id`       | Delete post (auth)     |

---

### **Comments**
| Method | Endpoint                               | Description           |
| ------ | -------------------------------------- | --------------------- |
| POST   | `/api/posts/:id/comments`              | Add comment (auth)    |
| DELETE | `/api/posts/:id/comments/:cid`         | Delete comment (auth) |



