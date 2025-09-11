import React, { useState, useRef } from "react";
import { auth, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import ReCAPTCHA from "react-google-recaptcha";

const SITE_KEY = process.env.REACT_APP_RECAPTCHA_SITE_KEY;

export default function AuthForm() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [group, setGroup] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const recaptchaRef = useRef(null);

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      alert("אימייל לא תקין");
      return;
    }

    if (isRegistering && password !== confirmPassword) {
      alert("הסיסמאות לא תואמות");
      return;
    }

    if (isRegistering && !recaptchaRef.current.getValue()) {
      alert("יש לאמת את reCAPTCHA");
      return;
    }

    try {
      let userCredential;

      if (isRegistering) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);

        await setDoc(doc(db, "users", userCredential.user.uid), {
          name,
          email,
          group,
        });

        await setDoc(doc(db, "roles", userCredential.user.uid), {
          role: "user",
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      console.error("Authentication Error:", error.message);
      alert("שגיאה: " + error.message);
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

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="סיסמה"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border p-2 rounded w-full pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 left-0 px-3 text-sm text-blue-600"
          >
            {showPassword ? "הסתר" : "הצג"}
          </button>
        </div>

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

        {isRegistering && (
          <div className="flex justify-center">
            <ReCAPTCHA sitekey={SITE_KEY} ref={recaptchaRef} />
          </div>
        )}

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded w-full"
        >
          {isRegistering ? "צור חשבון" : "התחבר"}
        </button>

        <button
          type="button"
          onClick={() => setIsRegistering(!isRegistering)}
          className="text-blue-600 underline w-full text-center"
        >
          {isRegistering ? "כבר רשום? התחבר" : "אין לך חשבון? הירשם"}
        </button>
      </form>
    </div>
  );
}