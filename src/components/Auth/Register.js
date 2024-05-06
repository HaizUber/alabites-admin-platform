import React, { useState } from "react";
import axios from "axios";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../config/firebase";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
  import { useNavigate } from "react-router-dom";
import "../../styles/Register.css";


function AdminRegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [passwordStrength, setPasswordStrength] = useState(0);
    const navigate = useNavigate();
  
    const calculatePasswordStrength = (value) => {
      const hasLowerCase = /[a-z]/.test(value);
      const hasUpperCase = /[A-Z]/.test(value);
      const hasNumbers = /[0-9]/.test(value);
      const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>_]/.test(value);
  
      let strength = 0;
      if (value.length >= 6) strength++;
      if (hasLowerCase && hasUpperCase && hasNumbers && hasSpecialChars) strength++;
  
      return strength;
    };
  
    const handleRegister = async (e) => {
      e.preventDefault();
  
      if (passwordStrength < 2) {
        toast.error("Password is too weak. Password must have at least 6 characters, including uppercase, lowercase, digit, and special character.");
        return;
      }
  
      if (password !== confirmPassword) {
        toast.error("Passwords do not match.");
        return;
      }
  
      try {  
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          toast.error("Invalid email address.");
          return;
        }
      const getFirebaseUID = () => {
          const currentUser = auth.currentUser;
          return currentUser ? currentUser.uid : null;
        };  
// Function to generate a unique admin UID
const generateAdminUID = async () => {
  const prefix = "7000";
  let uid;

  do {
    const randomDigits = Math.floor(100000 + Math.random() * 900000); // Generate random 6-digit number
    uid = prefix + randomDigits;
    console.log(uid);

    try {
      // Check if UID exists by sending a GET request
      const response = await axios.get(`https://alabites-api.vercel.app/admins/query/${uid}`);
      
      // If UID does not exist (returns 404), break out of the loop
      if (response.status === 404) {
        break;
      }
    } catch (error) {
      // Check if the error response status code is 404, if so, break out of the loop
      if (error.response && error.response.status === 404) {
        break;
      }
      
      // Log any other errors encountered during the GET request
      console.error("Error checking UID:", error);
    }
  } while (true);

  return uid;
};

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Generate a unique admin UID
    const uid = await generateAdminUID();

    // Get the Firebase UID of the current user
    const firebaseUID = getFirebaseUID(); 

    // Post the admin data with the generated UID
    await axios.post("https://alabites-api.vercel.app/admins", {
        uid,
        firebaseUID,
        email,
        firstName,
        lastName,
        username,
        role: "Merchant Admin" // Include the initial role here
      });
  
  // Show success toast with a timeout
  toast.success("Registration successful! Redirecting...", {
    autoClose: 3500, // Auto close the toast after 3.5 seconds
  });
  
  // Redirect the user to the login page after 3.5 seconds
  setTimeout(() => {
    navigate('/'); // Redirect to login page after 3.5 seconds
  }, 3500);
  
  
      } catch (error) {
        if (error.code === "auth/email-already-in-use") {
          console.error("Error registering:", error.message);
          toast.error("Email address is already in use. Please use a different email address.");
        } else {
          console.error("Error registering:", error);
          toast.error("An error occurred during registration. Please try again later.");
        }
      }
    };
  
    const handlePasswordChange = (e) => {
      const strength = calculatePasswordStrength(e.target.value);
      setPasswordStrength(strength);
      setPassword(e.target.value);
    };
  
    return (
  <section className="bg-white">
    <div className="lg:grid lg:min-h-screen lg:grid-cols-12">
      <section className="relative flex h-32 items-end bg-gray-900 lg:col-span-5 lg:h-full xl:col-span-6">
        <img
          alt=""
          src="https://wallpaperaccess.com/full/3353940.jpg"
          className="absolute inset-0 h-full w-full object-cover opacity-80"
        />
  
        <div className="hidden lg:relative lg:block lg:p-12">
          <a className="block text-white" href="#">
            <span className="sr-only">Home</span>
            <svg
              className="h-8 sm:h-10"
              viewBox="0 0 28 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0.41 10.3847C1.14777 7.4194 2.85643 4.7861 5.2639 2.90424C7.6714 1.02234 10.6393 0 13.695 0C16.7507 0 19.7186 1.02234 22.1261 2.90424C24.5336 4.7861 26.2422 7.4194 26.98 10.3847H25.78C23.7557 10.3549 21.7729 10.9599 20.11 12.1147C20.014 12.1842 19.9138 12.2477 19.81 12.3047H19.67C19.5662 12.2477 19.466 12.1842 19.37 12.1147C17.6924 10.9866 15.7166 10.3841 13.695 10.3841C11.6734 10.3841 9.6976 10.9866 8.02 12.1147C7.924 12.1842 7.8238 12.2477 7.72 12.3047H7.58C7.4762 12.2477 7.376 12.1842 7.28 12.1147C5.6171 10.9599 3.6343 10.3549 1.61 10.3847H0.41ZM23.62 16.6547C24.236 16.175 24.9995 15.924 25.78 15.9447H27.39V12.7347H25.78C24.4052 12.7181 23.0619 13.146 21.95 13.9547C21.3243 14.416 20.5674 14.6649 19.79 14.6649C19.0126 14.6649 18.2557 14.416 17.63 13.9547C16.4899 13.1611 15.1341 12.7356 13.745 12.7356C12.3559 12.7356 11.0001 13.1611 9.86 13.9547C9.2343 14.416 8.4774 14.6649 7.7 14.6649C6.9226 14.6649 6.1657 14.416 5.54 13.9547C4.4144 13.1356 3.0518 12.7072 1.66 12.7347H0V15.9447H1.61C2.39051 15.924 3.154 16.175 3.77 16.6547C4.908 17.4489 6.2623 17.8747 7.65 17.8747C9.0377 17.8747 10.392 17.4489 11.53 16.6547C12.1468 16.1765 12.9097 15.9257 13.69 15.9447C14.4708 15.9223 15.2348 16.1735 15.85 16.6547C16.9901 17.4484 18.3459 17.8738 19.735 17.8738C21.1241 17.8738 22.4799 17.4484 23.62 16.6547ZM23.62 22.3947C24.236 21.915 24.9995 21.664 25.78 21.6847H27.39V18.4747H25.78C24.4052 18.4581 23.0619 18.886 21.95 19.6947C21.3243 20.156 20.5674 20.4049 19.79 20.4049C19.0126 20.4049 18.2557 20.156 17.63 19.6947C16.4899 18.9011 15.1341 18.4757 13.745 18.4757C12.3559 18.4757 11.0001 18.9011 9.86 19.6947C9.2343 20.156 8.4774 20.4049 7.7 20.4049C6.9226 20.4049 6.1657 20.156 5.54 19.6947C4.4144 18.8757 3.0518 18.4472 1.66 18.4747H0V21.6847H1.61C2.39051 21.664 3.154 21.915 3.77 22.3947C4.908 23.1889 6.2623 23.6147 7.65 23.6147C9.0377 23.6147 10.392 23.1889 11.53 22.3947C12.1468 21.9165 12.9097 21.6657 13.69 21.6847C14.4708 21.6623 15.2348 21.9135 15.85 22.3947C16.9901 23.1884 18.3459 23.6138 19.735 23.6138C21.1241 23.6138 22.4799 23.1884 23.62 22.3947Z"
                fill="currentColor" />
            </svg>
          </a>
  
          <h2 className="mt-6 text-2xl font-bold text-white sm:text-3xl md:text-4xl text-left">
            Welcome to Alabites Admin Dashboard 🍽️
          </h2>
  
          <p className="mt-4 leading-relaxed text-white/90 text-left">
          Start your own store with us by creating an account and start your flavorful business journey!
          </p>
        </div>
      </section>
  
      <main className="flex items-center justify-center px-8 py-8 sm:px-12 lg:col-span-7 lg:px-16 lg:py-12 xl:col-span-6">
        <div className="max-w-xl lg:max-w-3xl">
          <div className="relative -mt-16 block lg:hidden">
            <a
              className="inline-flex size-16 items-center justify-center rounded-full bg-white text-blue-600 sm:size-20"
              href="#"
            >
              <span className="sr-only">Home</span>
              <svg
                className="h-8 sm:h-10"
                viewBox="0 0 28 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                d="M0.41 10.3847C1.14777 7.4194 2.85643 4.7861 5.2639 2.90424C7.6714 1.02234 10.6393 0 13.695 0C16.7507 0 19.7186 1.02234 22.1261 2.90424C24.5336 4.7861 26.2422 7.4194 26.98 10.3847H25.78C23.7557 10.3549 21.7729 10.9599 20.11 12.1147C20.014 12.1842 19.9138 12.2477 19.81 12.3047H19.67C19.5662 12.2477 19.466 12.1842 19.37 12.1147C17.6924 10.9866 15.7166 10.3841 13.695 10.3841C11.6734 10.3841 9.6976 10.9866 8.02 12.1147C7.924 12.1842 7.8238 12.2477 7.72 12.3047H7.58C7.4762 12.2477 7.376 12.1842 7.28 12.1147C5.6171 10.9599 3.6343 10.3549 1.61 10.3847H0.41ZM23.62 16.6547C24.236 16.175 24.9995 15.924 25.78 15.9447H27.39V12.7347H25.78C24.4052 12.7181 23.0619 13.146 21.95 13.9547C21.3243 14.416 20.5674 14.6649 19.79 14.6649C19.0126 14.6649 18.2557 14.416 17.63 13.9547C16.4899 13.1611 15.1341 12.7356 13.745 12.7356C12.3559 12.7356 11.0001 13.1611 9.86 13.9547C9.2343 14.416 8.4774 14.6649 7.7 14.6649C6.9226 14.6649 6.1657 14.416 5.54 13.9547C4.4144 13.1356 3.0518 12.7072 1.66 12.7347H0V15.9447H1.61C2.39051 15.924 3.154 16.175 3.77 16.6547C4.908 17.4489 6.2623 17.8747 7.65 17.8747C9.0377 17.8747 10.392 17.4489 11.53 16.6547C12.1468 16.1765 12.9097 15.9257 13.69 15.9447C14.4708 15.9223 15.2348 16.1735 15.85 16.6547C16.9901 17.4484 18.3459 17.8738 19.735 17.8738C21.1241 17.8738 22.4799 17.4484 23.62 16.6547ZM23.62 22.3947C24.236 21.915 24.9995 21.664 25.78 21.6847H27.39V18.4747H25.78C24.4052 18.4581 23.0619 18.886 21.95 19.6947C21.3243 20.156 20.5674 20.4049 19.79 20.4049C19.0126 20.4049 18.2557 20.156 17.63 19.6947C16.4899 18.9011 15.1341 18.4757 13.745 18.4757C12.3559 18.4757 11.0001 18.9011 9.86 19.6947C9.2343 20.156 8.4774 20.4049 7.7 20.4049C6.9226 20.4049 6.1657 20.156 5.54 19.6947C4.4144 18.8757 3.0518 18.4472 1.66 18.4747H0V21.6847H1.61C2.39051 21.664 3.154 21.915 3.77 22.3947C4.908 23.1889 6.2623 23.6147 7.65 23.6147C9.0377 23.6147 10.392 23.1889 11.53 22.3947C12.1468 21.9165 12.9097 21.6657 13.69 21.6847C14.4708 21.6623 15.2348 21.9135 15.85 22.3947C16.9901 23.1884 18.3459 23.6138 19.735 23.6138C21.1241 23.6138 22.4799 23.1884 23.62 22.3947Z"
                fill="currentColor"
              />
              </svg>
            </a>
  
            <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl text-left">
            Welcome to Alabites Admin Dashboard 🍽️
            </h1>
  
            <p className="mt-4 leading-relaxed text-gray-500 text-left">
            Start your own store with us by creating an account and start your flavorful business journey!
            </p>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl text-left">
            Admin Registration Page
            </h1>
          <form onSubmit={handleRegister} className="mt-8 grid grid-cols-6 gap-6">
            
            <div className="col-span-6 sm:col-span-3">
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 text-left">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="first_name"
                className="form-input mt-1 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700 shadow-sm"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
  
            <div className="col-span-6 sm:col-span-3">
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 text-left">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="last_name"
                className="form-input mt-1 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700 shadow-sm"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
  
            <div className="col-span-6">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 text-left">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="form-input mt-1 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700 shadow-sm50"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
  
            <div className="col-span-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 text-left">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input mt-1 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700 shadow-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
  
    <div className="col-span-6 sm:col-span-3">
      <label htmlFor="password" className="block text-sm font-medium text-gray-700 text-left">
        Password
      </label>
      <input
        type="password"
        id="password"
        className="form-input mt-1 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        value={password}
        onChange={handlePasswordChange}
        required
      />
      <progress
        className="w-full h-2 mt-2 rounded-md"
        max="2"
        value={passwordStrength}
        style={{
          backgroundColor:
            passwordStrength === 0 ? "#f7fafc" : passwordStrength === 2 ? "#10b981" : "#f59e0b"
        }}
      ></progress>
      <p
        className={`mt-1 text-sm ${
          passwordStrength === 0 ? "text-gray-400" : passwordStrength === 2 ? "text-green-600" : "text-yellow-600"
        }`}
      >
        {passwordStrength === 0
          ? "Password must have at least 6 characters, including uppercase, lowercase, digit, and special character"
          : passwordStrength === 2
          ? "Strong password"
          : "Weak password"}
      </p>
    </div>
  
            <div className="col-span-6 sm:col-span-3">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 text-left">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirm_password"
                className="form-input mt-1 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700 shadow-sm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
  
            <div className="col-span-6">
              <p className="text-sm text-gray-500 text-left">
                By creating an account, you agree to our{" "}
                <a href="#" className="text-gray-700 underline">
                  terms and conditions
                </a>{" "}
                and{" "}
                <a href="#" className="text-gray-700 underline">
                  privacy policy
                </a>
                .
              </p>
            </div>
  
            <div className="col-span-6 sm:flex sm:items-center sm:gap-4">
              <button
                type="submit"
                className="inline-block shrink-0 rounded-md border border-blue-600 bg-blue-600 px-12 py-3 text-sm font-medium text-white transition hover:bg-transparent hover:text-blue-600 focus:outline-none focus:ring active:text-blue-500"
              >
                Create an account
              </button>
  
              <p className="mt-4 text-sm text-gray-500 sm:mt-0">
                Already have an account?{" "}
                <a href="#" className="text-gray-700 underline">
                  Log in
                </a>
                .
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
    <ToastContainer />
  </section>

  );
}

export default AdminRegisterPage;
