import React, { useState } from "react";
import { auth, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function AuthForm() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [group, setGroup] = useState("");
  const [error, setError] = useState("");

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("אימייל לא תקין");
      return;
    }

    if (isRegistering && password !== confirmPassword) {
      setError("הסיסמאות אינן תואמות");
      return;
    }

    try {
      let userCredential;

      if (isRegistering) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Save user profile to Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), {
          name,
          email,
          group,
        });

        // Default role is "user"
        await setDoc(doc(db, "roles", userCredential.user.uid), {
          role: "user",
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      console.error("Authentication Error:", error.message);
      setError("שגיאה: " + error.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow" dir="rtl">
      <h2 className="text-xl font-semibold text-center mb-4">
        {isRegistering ? "הרשמה" : "התחברות"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegistering && (
          <>
            <input
              type="text"
              placeholder="שם מלא"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="border p-2 rounded w-full"
            />

            <select
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              required
              className="border p-2 rounded w-full"
            >
              <option value="">בחר קבוצה</option>
              <option value="נוטרים">נוטרים</option>
              <option value="ברנע">ברנע</option>
              <option value="עיר היין">עיר היין</option>
            </select>
          </>
        )}

        <input
          type="email"
          placeholder="אימייל"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border p-2 rounded w-full"
        />

        <input
          type="password"
          placeholder="סיסמה"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border p-2 rounded w-full"
        />

        {isRegistering && (
          <input
            type="password"
            placeholder="אימות סיסמה"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="border p-2 rounded w-full"
          />
        )}

        {error && <div className="text-red-600 text-sm text-center">{error}</div>}

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded w-full"
        >
          {isRegistering ? "צור חשבון" : "התחבר"}
        </button>

        <button
          type="button"
          onClick={() => {
            setIsRegistering(!isRegistering);
            setError("");
          }}
          className="text-blue-600 underline w-full text-center"
        >
          {isRegistering ? "כבר רשום? התחבר" : "אין לך חשבון? הירשם"}
        </button>
      </form>
    </div>
  );
}