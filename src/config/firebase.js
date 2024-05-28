// Import the compat namespace functions from the Firebase SDKs
import firebase from "firebase/compat/app"; // Import compat namespace
import "firebase/compat/auth"; // Import compat auth module
import "firebase/compat/storage"; // Import compat storage module

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
const app = firebase.initializeApp(firebaseConfig); // Use initializeApp from compat namespace
const auth = firebase.auth(); // Use auth from compat namespace
const storage = firebase.storage(); // Initialize storage from compat namespace

export { auth, storage }; // Exporting auth and storage here
