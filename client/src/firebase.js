import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCMKHQrLuac8gp4Ad30zRkcK2z-KNhHpVk",
  authDomain: "employeetrackr-46e63.firebaseapp.com",
  projectId: "employeetrackr-46e63",
  storageBucket: "employeetrackr-46e63.firebasestorage.app",
  messagingSenderId: "964196505438",
  appId: "1:964196505438:web:646304679e374a891921cf",
  measurementId: "G-B6S5VREED4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
