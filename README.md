# Serverless Static Debt Management Web App with Firebase Realtime Database

![License](https://img.shields.io/badge/license-MIT-blue.svg)

A simple **debt management web application** built with **HTML, CSS, and JavaScript**, using **Firebase** for authentication and database management.

## 🔑 Key Features

* **Authentication**: Google & GitHub login via Firebase.  
* **Debt Tracking**: Manage debts with due dates, status (paid/unpaid), and notes.  
* **Debtor Management**: Add, edit, delete, and track debtors with custom settings.
* **Statistics Dashboard**: Real-time stats for total, paid, and unpaid debts.  
* **CSV Import/Export**: Backup or transfer data easily.  
* **Offline Handling**: Alerts when disconnected from the internet.  
* **Idle Timeout**: Automatic logout after inactivity for security.  
* **Responsive Design**: Works on desktop and mobile, with Tailwind CSS.  
* **Dark Mode**: Built-in theme toggle for better usability at night.

## ⚙️ Tech Stack

-   Frontend: HTML, CSS, Tailwind CSS, JavaScript 
-   Firebase SDKs: Authentication, Realtime Database
-   Tools: Firebase CLI

## ❔ How to Use?

1. Clone this repository:
   ```bash
   git clone https://github.com/diyyo/loan-tracker.git
   cd loan-tracker
   ```

2. Open the project in your code editor.  

3. Update your Firebase credentials in **`config.js`**:  
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
     databaseURL: "YOUR_DATABASE_URL",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT_ID.appspot.com",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID",
     measurementId: "YOUR_MEASUREMENT_ID"
   };
   ```

4. Run/Deploy the application:
    * Open the `index.html` file directly in your browser.
    * For the best experience, it's recommended to use an extension like "Live Server" in Visual Studio Code to run a local development server.

## ⚖️ License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for more details.

(c) diyyo White 2025 MIT License.
