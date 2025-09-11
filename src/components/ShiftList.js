import React, { useEffect, useState } from "react";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function ShiftList({ user, shifts = [], setShifts, onDeleteShift }) {
  const [users, setUsers] = useState({});
  const [editingShiftId, setEditingShiftId] = useState(null);
  const [noteInput, setNoteInput] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const map = {};
      snapshot.forEach((doc) => {
        map[doc.id] = doc.data();
      });
      setUsers(map);
    };
    loadUsers();
  }, []);

  const toggleSignup = async (shift) => {
    const isSignedUp = shift.assigned?.includes(user.uid);
    const updatedAssigned = isSignedUp
      ? shift.assigned.filter((id) => id !== user.uid)
      : [...(shift.assigned || []), user.uid];

    const updatedShift = { ...shift, assigned: updatedAssigned };
    await updateDoc(doc(db, "shifts", shift.id), updatedShift);
    setShifts((prev) =>
      prev.map((s) => (s.id === shift.id ? updatedShift : s))
    );
  };

  const handleNoteSave = async (shiftId) => {
    await updateDoc(doc(db, "shifts", shiftId), {
      note: noteInput,
    });
    setShifts((prev) =>
      prev.map((s) => (s.id === shiftId ? { ...s, note: noteInput } : s))
    );
    setEditingShiftId(null);
  };

  return (
    <div className="space-y-4">
      {shifts.map((shift) => (
        <div key={shift.id} className="border p-4 rounded shadow">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-bold">
                {shift.date} | {shift.time}
              </div>
              <div className="text-sm mt-1">
                <strong>משובצים:</strong>
                {(shift.assigned || []).map((uid) => (
                  <div key={uid} className="ml-2 text-sm">
                    {users[uid]?.name || uid}
                    {users[uid]?.group && (
                      <span className="text-gray-500 text-xs ml-1">
                        ({users[uid].group})
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Note Display or Edit */}
              {editingShiftId === shift.id ? (
                <div className="mt-2">
                  <input
                    type="text"
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    className="border p-1 rounded w-full"
                    placeholder="הכנס הערה"
                  />
                  <button
                    onClick={() => handleNoteSave(shift.id)}
                    className="bg-blue-500 text-white px-2 py-1 mt-1 rounded"
                  >
                    שמור
                  </button>
                </div>
              ) : shift.note ? (
                <div className="text-sm mt-2">
                  <strong>הערה:</strong> {shift.note}
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-2 items-end">
              <button
                onClick={() => toggleSignup(shift)}
                className={`px-3 py-1 rounded text-white ${
                  shift.assigned?.includes(user.uid)
                    ? "bg-yellow-600"
                    : "bg-green-600"
                }`}
              >
                {shift.assigned?.includes(user.uid) ? "בטל הרשמה" : "הירשם"}
              </button>

              {onDeleteShift && (
                <button
                  onClick={() => onDeleteShift(shift.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  מחק
                </button>
              )}

              {onDeleteShift && (
                <button
                  onClick={() => {
                    setEditingShiftId(shift.id);
                    setNoteInput(shift.note || "");
                  }}
                  className="text-gray-500 text-xs underline"
                >
                  ✏️ ערוך הערה
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}