import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

export default function ShiftEditor({ user, setShifts }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");

  const handleAddShift = async () => {
    if (!date || !time) return;

    await addDoc(collection(db, "shifts"), {
      date,
      time,
      note,
      assigned: [],
      createdBy: user.uid,
    });

    // Load updated shifts
    const snapshot = await getDocs(collection(db, "shifts"));
    const updated = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setShifts(updated);

    // Reset form
    setDate("");
    setTime("");
    setNote("");
  };

  return (
    <div className="mt-8 max-w-md mx-auto">
      <h3 className="text-lg font-semibold text-center mb-4">
        הוסף משמרת חדשה
      </h3>
      <div className="space-y-3">
        {/* Label for date */}
        <p className="text-xs text-gray-500 text-right">בחר תאריך למשמרת:</p>
        <div className="bg-white p-2 rounded shadow-sm">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border p-2 rounded w-full bg-white text-black shadow"
          />
        </div>

        <input
          type="text"
          placeholder="שעה (למשל 20:00)"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="border p-2 rounded w-full"
        />

        <input
          type="text"
          placeholder="הערה (אופציונלי)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="border p-2 rounded w-full"
        />

        <button
          onClick={handleAddShift}
          className="bg-green-600 text-white px-4 py-2 rounded w-full"
        >
          הוסף משמרת
        </button>
      </div>
    </div>
  );
}