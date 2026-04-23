import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
    apiKey: "AIzaSyD-Pj9xzpP14kKQGbq-NNoPo4wVzZbFXzw",
    authDomain: "focus-web-c2f4c.firebaseapp.com",
    projectId: "focus-web-c2f4c",
    storageBucket: "focus-web-c2f4c.firebasestorage.app",
    messagingSenderId: "231497880168",
    appId: "1:231497880168:web:bfd22deafcda2e9c30e1dd"
};


const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)