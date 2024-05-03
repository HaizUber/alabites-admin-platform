// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC1jticEcRonbvSYwyYgDKMxC6dX3neUXE",
    authDomain: "alabites-admin-platform.firebaseapp.com",
    projectId: "alabites-admin-platform",
    storageBucket: "alabites-admin-platform.appspot.com",
    messagingSenderId: "367530158164",
    appId: "1:367530158164:web:63260800c63369704165c1",
    measurementId: "G-0MD0N75W8R"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { auth }; // Exporting auth here