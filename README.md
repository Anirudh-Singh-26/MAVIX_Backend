#   MAVIX Backend

The **MAVIX Backend** powers the platform, handling authentication, AI assistant APIs, database interactions, and payment integrations.

---

## 🔗 Live API Base URL

`https://mavix-backend.onrender.com`

---

## 🔗 Related Repositories

* **MAVIX Frontend** - [https://github.com/Anirudh-Singh-26/MAVIX_Frontend](https://github.com/Anirudh-Singh-26/MAVIX_Frontend)
* **MAVIX Dashboard** - [https://github.com/Anirudh-Singh-26/MAVIX_Dashboard](https://github.com/Anirudh-Singh-26/MAVIX_Dashboard)

---

## 📦 Tech Stack

* Node.js & Express.js
* MongoDB & Mongoose
* JWT authentication with HttpOnly cookies
* Razorpay integration for payments
* Socket.IO for real-time notifications
* Multer & Cloudinary for file uploads
* PDFKit for invoice generation

---

## 🌟 Features

* User authentication & role-based access
* AI assistant endpoints
* Secure payment handling
* CRUD operations for user data and logs
* Real-time notifications via Socket.IO
* PDF invoice generation

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/Anirudh-Singh-26/Mavix-backend.git
cd Mavix-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

Create a `.env` file:

```env
PORT=3002
MONGO_URI=your-mongodb-uri
JWT_SECRET=your_jwt_secret
NODE_ENV=production
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_ORIGIN=https://mavix-frontend.vercel.app
```

### 4. Start the server

```bash
npm start  # production
npm run dev # development
```

---

## 📁 Folder Structure

```
Mavix-backend/
├── controllers/
├── models/
├── routes/
├── middleware/
├── utils/
├── app.js
├── server.js
├── package.json
└── README.md
```

---

## 👤 Author

Anirudh Singh Rathore
[GitHub Profile](https://github.com/Anirudh-Singh-26)

---

## 📄 License

MIT © Anirudh Singh Rathore
