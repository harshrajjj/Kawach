# 🚀 Kawach

Kawach is a MERN stack app designed to provide secure and private document sharing, ensuring that your sensitive data remains safe from misuse.

The Problem:  
Imagine you’re a customer who needs to share a document — let’s say a contract or personal identification — with a cafe owner or any other business for a service, such as printing. In a typical scenario, the cafe owner might save your document on their computer or device. Over time, this could lead to risks such as your private information being misused, sold, or shared without your consent.  

For example, when you hand over your document for printing, there’s a chance it could be stored on their system indefinitely. If the document isn’t deleted properly after the service, it might get copied, shared, or even resold without your knowledge. Worse still, if it ends up in the hands of a third party, you might never know where your sensitive data has gone or how it’s being used.  

This creates a significant risk to your privacy and data security in what should be a simple transaction.


## 👨‍💻 Contributors
- Sujal Raj
- Harsh Kumar
- Vansh Tyagi


## 🌟 Key Features
- 📄 **Secure Document Upload**: Share your documents with confidence, knowing they are handled with the utmost care.  
- 📱 **One-Time QR Code Generation**: Generate a unique, single-use QR code for easy and secure document sharing.  
- 🔑 **Privacy-First Approach**: Your data is yours. No tracking, no selling—just secure and private sharing.  
- 💡 **Designed for Safety**: Built to ensure your documents are shared and used only as intended, safeguarding your personal information.  

## 🛠 Tech Stack
- Frontend: React.js ⚛ ,Vite, Tailwind CSS
- Backend: Node.js 🟩, Express.js
- Database: MongoDB, Cloudinary(for file saving) 🗃
- Encryption: Libraries for document security 🔐
- QR Code Generation: Libraries to generate one-time use QR codes 📸



## 🔧 Setup Instructions

### ⚙ Prerequisites
- Node.js (v14.x or higher) 📦
- MongoDB 🌱
- Git 🧑‍💻


### 🚀 Installation Guide  

Follow these steps to set up and run the project on your local machine.  

#### 1. Clone the Repository  
```bash
git clone ///
cd kawachh
```  

---

#### 2. Backend Setup  
1. Navigate to the server directory:  
   ```bash
   cd server
   ```  

2. Install dependencies (force install if there are version mismatches):  
   ```bash
   npm install 
   ```  

3. Create a `.env` file in the `server` directory and add the following:  
   ```env
   PORT=8080
   DEV_MODE=development
   MONGO_URL=your_mongo_connection_string_here
   JWT_SECRET=your_jwt_secret_here
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name_here
   CLOUDINARY_API_KEY=your_cloudinary_api_key_here
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret_here
   CLOUDINARY_URL=your_cloudinary_url_here
   FRONTEND_URL=http://localhost:5173
   ```  

4. Start the server:  
   ```bash
   npm start
   ```  

---

#### 3. Frontend Setup  
1. Navigate to the client directory:  
   ```bash
   cd ../client
   ```  

2. Install dependencies (force install if necessary):  
   ```bash
   npm install
   ```  

3. Create a `.env` file in the `client` directory and add the following:  
   ```env
   VITE_BACKEND_API=http://localhost:8080
   ```  

4. Start the frontend application:  
   ```bash
   npm run dev
   ```  

---

#### 4. Access the Application  
- Open your browser and navigate to `http://localhost:5173`.  
- Ensure both the backend and frontend are running concurrently.  

---

#### 🛠 Troubleshooting  
- **Dependency Issues**: Use `npm install --legacy-peer-deps` for version mismatches.  
- **MongoDB Connection**: Ensure your MongoDB instance is running and accessible.  
- **Environment Variables**: Double-check `.env` files for accuracy.  
```

```

## 🖥 Usage Guide
- Upload documents securely through the frontend interface.
- Receive a one-time QR code after uploading.
- Property shop owners scan this QR code to access and print the document.
- Once scanned, the QR code expires, ensuring no one else can use it!

## 📸 Screenshots
[1]![image](https://github.com/user-attachments/assets/644868c4-59b4-4fdf-b661-5605045379ea)

[2]![image](https://github.com/user-attachments/assets/d534657a-0eb1-4289-8155-8e4d8cef52f8)

[3]![image](https://github.com/user-attachments/assets/003a036a-e4a9-4fe9-bc66-6762495ff44a)

[4]![image](https://github.com/user-attachments/assets/8e0cd0ea-cf5b-4cec-99ac-7751f51b97ee)

[5]![image](https://github.com/user-attachments/assets/4b80e5c0-421e-4c54-a3b0-55dc4221af32)

[6]![image](https://github.com/user-attachments/assets/235276c5-b80f-449e-8bc3-fb323234d3f7)

## 👨‍💻 Contributing to Kawach
1. Fork the repository.
2. Create a branch for your feature (`git checkout -b feature-name`).
3. Commit your changes (`git commit -m 'Add feature'`).
4. Push the branch (`git push origin feature-name`).
5. Create a Pull Request to propose your changes.

## 📞 Contact
If you have any questions, suggestions, or feedback, feel free to reach out to us!

- Email:  
  [rajsujal2004@gmail.com](mailto:rajsujal2004@gmail.com)

We’re excited to connect with you and appreciate your interest in Kawach!

## 📜 License
This project is licensed under the MIT License – see the [LICENSE](./LICENSE) file for more details.

