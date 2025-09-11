import { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [shifts, setShifts] = useState([]);
  const [users, setUsers] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const isAdmin = await checkAdminRole(u.uid);
        setIsAdmin(isAdmin);

        if (!isAdmin) {
          alert("אין לך הרשאה לגשת לדף זה.");
          navigate("/");
          return;
        }

        fetchShifts();
        fetchUsers();
      } else {
        await signInAnonymously(auth);
      }
    });

    return () => unsub();
  }, [navigate]); // ✅ הוספת navigate לתלותות

  const checkAdminRole = async (uid) => {
    const docRef = doc(db, "roles", uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() && docSnap.data().role === "admin";
  };

  const fetchShifts = async () => {
    const snapshot = await getDocs(collection(db, "shifts"));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    setShifts(data);
  };

  const fetchUsers = async () => {
    const snapshot = await getDocs(collection(db, "users"));
    const map = {};
    snapshot.docs.forEach((doc) => {
      map[doc.id] = doc.data().name;
    });
    setUsers(map);
  };

  const toggleAttendance = async (shiftId, current) => {
    await updateDoc(doc(db, "shifts", shiftId), {
      attended: !current
    });
    fetchShifts();
  };

  return (
    <div dir="rtl" className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-right text-green-700">
        לוח מנהלים - ניהול משמרות 👮‍♂️
      </h1>

      <table className="w-full border text-right text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">תאריך ושעה</th>
            <th className="p-2 border">מתנדב</th>
            <th className="p-2 border">UID</th>
            <th className="p-2 border">נוכחות</th>
          </tr>
        </thead>
        <tbody>
          {shifts.map((shift) => (
            <tr key={shift.id} className="border-b hover:bg-gray-50">
              <td className="p-2 border">{shift.time}</td>
              <td className="p-2 border text-green-700">
                {users[shift.user] || (shift.user ? "ללא שם" : "פנוי")}
              </td>
              <td className="p-2 border text-xs">{shift.user || "-"}</td>
              <td className="p-2 border text-center">
                {shift.user ? (
                  <input
                    type="checkbox"
                    checked={!!shift.attended}
                    onChange={() => toggleAttendance(shift.id, shift.attended)}
                  />
                ) : (
                  "-"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}