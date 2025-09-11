import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function VolunteerSummary() {
  const [users, setUsers] = useState({});
  const [shifts, setShifts] = useState([]);

  useEffect(() => {
    const loadUsersAndShifts = async () => {
      const usersSnap = await getDocs(collection(db, "users"));
      const usersMap = {};
      usersSnap.forEach((doc) => {
        usersMap[doc.id] = doc.data();
      });
      setUsers(usersMap);

      const shiftsSnap = await getDocs(collection(db, "shifts"));
      const shiftsList = shiftsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setShifts(shiftsList);
    };

    loadUsersAndShifts();
  }, []);

  // חישוב לפי מתנדב
  const userStats = {};
  shifts.forEach((shift) => {
    const assigned = shift.assigned || [];
    assigned.forEach((uid) => {
      if (!userStats[uid]) {
        userStats[uid] = {
          signups: 0,
          cancellations: 0,
          dates: [],
        };
      }
      userStats[uid].signups += 1;
      userStats[uid].dates.push(shift.date);
    });
  });

  // ביטולים (נדרשת לוגיקה טובה יותר בעתיד עם לוגים)
  Object.keys(users).forEach((uid) => {
    const stats = userStats[uid];
    if (stats) {
      const totalSigned = shifts.filter(
        (s) => s.assigned && s.assigned.includes(uid)
      ).length;
      stats.cancellations = stats.signups - totalSigned;
    }
  });

  return (
    <div className="mt-10 px-4 max-w-3xl mx-auto" dir="rtl">
      <h3 className="text-xl font-bold mb-4 text-center text-green-800">📊 סיכום לפי מתנדב</h3>
      {Object.entries(userStats).map(([uid, stats]) => (
        <div key={uid} className="border p-3 rounded mb-3 shadow bg-white">
          <div className="text-lg font-semibold">
            {users[uid]?.name || uid}{" "}
            <span className="text-sm text-gray-500">
              ({users[uid]?.group || "ללא קבוצה"})
            </span>
          </div>
          <div className="text-sm text-gray-700 mt-1">✅ נרשם: {stats.signups} פעמים</div>
          <div className="text-sm text-gray-700">❌ ביטולים: {stats.cancellations}</div>
          <div className="text-sm mt-1">
            🗓️ תאריכי משמרות:
            <ul className="list-disc list-inside">
              {stats.dates.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
        </div>
      ))}

      {/* סיכום לפי קבוצה */}
      <h3 className="text-xl font-bold mb-4 text-center text-blue-800 mt-10">📁 סיכום לפי קבוצה</h3>
      {Object.entries(
        Object.entries(userStats).reduce((acc, [uid, stats]) => {
          const group = users[uid]?.group || "ללא קבוצה";
          if (!acc[group]) {
            acc[group] = { signups: 0, cancellations: 0 };
          }
          acc[group].signups += stats.signups;
          acc[group].cancellations += stats.cancellations;
          return acc;
        }, {})
      ).map(([groupName, summary]) => (
        <div key={groupName} className="border p-3 rounded mb-3 shadow bg-gray-50">
          <div className="font-semibold text-md">{groupName}</div>
          <div className="text-sm text-gray-700 mt-1">✅ נרשמו: {summary.signups}</div>
          <div className="text-sm text-gray-700">❌ ביטולים: {summary.cancellations}</div>
        </div>
      ))}

     {/* סיכום לפי חודש */}
<h3 className="text-xl font-bold mb-4 text-center text-purple-800 mt-10">🗓️ סיכום לפי חודש</h3>
{Object.entries(
  shifts.reduce((acc, shift) => {
    if (typeof shift.date === "string" && shift.date.length >= 7) {
      const month = shift.date.slice(0, 7); // YYYY-MM
      const count = shift.assigned?.length || 0;
      if (!acc[month]) acc[month] = 0;
      acc[month] += count;
    }
    return acc;
  }, {})
).map(([month, count]) => (
  <div key={month} className="border p-3 rounded mb-3 shadow bg-gray-100">
    <div className="font-semibold text-md">{month}</div>
    <div className="text-sm text-gray-700 mt-1">✅ מספר רישומים: {count}</div>
  </div>
))}
    </div>
  );
}