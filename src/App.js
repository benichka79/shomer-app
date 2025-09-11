import React, { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
} from "firebase/firestore";

import ShiftList from "./components/ShiftList";
import ShiftEditor from "./components/ShiftEditor";
import AuthForm from "./components/Auth";
import VolunteerSummary from "./components/VolunteerSummary";

function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState("user");
  const [shifts, setShifts] = useState([]);
  const [viewSummary, setViewSummary] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const roleRef = doc(db, "roles", currentUser.uid);
        const roleSnap = await getDoc(roleRef);
        if (roleSnap.exists()) {
          setUserRole(roleSnap.data().role || "user");
        } else {
          setUserRole("user");
        }
      } else {
        setUser(null);
        setUserRole("user");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchShifts = async () => {
      const snapshot = await getDocs(collection(db, "shifts"));
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setShifts(fetched);
    };
    fetchShifts();
  }, []);

  const handleDeleteShift = async (shiftId) => {
    await deleteDoc(doc(db, "shifts", shiftId));
    setShifts((prev) => prev.filter((s) => s.id !== shiftId));
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (!user) return <AuthForm />;

  if (viewSummary) {
    return (
      <div dir="rtl" style={{ fontFamily: "Arial", padding: "2rem" }}>
        <button
          onClick={handleLogout}
          className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded shadow"
        >
          התנתק
        </button>

        <h2 style={{ textAlign: "center", color: "green" }}>
          לוח משמרות - סיכום מתנדבים
        </h2>
        <VolunteerSummary />
        <div className="text-center mt-8">
          <button
            onClick={() => setViewSummary(false)}
            className="bg-gray-600 text-white px-4 py-2 rounded"
          >
            חזור לעמוד הראשי
          </button>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" style={{ fontFamily: "Arial", padding: "2rem", position: "relative" }}>
      <button
        onClick={handleLogout}
        className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded shadow"
      >
        התנתק
      </button>

      <h2 style={{ textAlign: "center", color: "green" }}>
        לוח משמרות - משמר השכונה
      </h2>
      <p style={{ textAlign: "center", fontSize: "0.9rem", color: "gray" }}>
        UID שלך: {user.uid}
      </p>

      {userRole === "admin" && (
        <>
          <ShiftEditor user={user} setShifts={setShifts} />
          <div className="text-center mt-4">
            <button
              onClick={() => setViewSummary(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              סטטיסטיקה של מתנדבים
            </button>
          </div>
        </>
      )}

      <ShiftList
        user={user}
        shifts={shifts}
        setShifts={setShifts}
        onDeleteShift={userRole === "admin" ? handleDeleteShift : null}
      />
    </div>
  );
}

export default App;