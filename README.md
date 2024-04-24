# Employee Team Tracking Application 🚀

## Overview 🌟

This Node.js application provides a comprehensive solution for user registration 📝, authentication 🔐, and employee management 🧑‍💼 with MongoDB as the database 📊. It allows users to register, login, manage employees 👥, departments 📁, and view login history ⏰, along with the ability to upload and view images 📷.

## Features 🛠️

### User Authentication ✅

- **Register**: Users can register by providing their username, email, and password 📝.
- **Login**: Secure login mechanism using hashed passwords with `bcryptjs` 🔒.
- **Logout**: Option to logout and end the session with `client-sessions` 🚪.

### Employee Management 🧑‍💼

- **Add Employees**: Users can add new employees with personal details such as name, email, and department 👤 using `sequelize` and `pg` for database operations.
- **Manage Departments**: Users can create and manage departments, which can be assigned to employees using `sequelize` and `pg-hstore` 📁.
  
### Image Upload and Viewing 🖼️

- **Upload Images**: Users can upload images using `multer`, which are saved locally to the project directory 📂.
- **View Images**: Ability to view uploaded images in the application 🖼️.

### Login History 📜

- **View Login History**: Users can view their login history showing device details 📱, timestamp ⏰, and browser information 🌐 using `client-sessions` for session management.

## Conclusion 🎉

Building this Node.js application provided hands-on experience in developing a full-stack web application with user authentication, database management, file uploads, and more 🚀, at the very base level. It helped in gaining a deeper understanding of Node.js, Express.js, MongoDB, Sequelize, and related technologies, preparing a solid foundation for building more complex and scalable web applications 🌟 that I am actually building right now, please do check them out as well.
