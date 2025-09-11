export default function AdminForm({ onAddShift, value, setValue }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2 text-right">הוסף משמרת חדשה</h2>
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 border p-2 rounded"
          placeholder="יום ושעה - למשל: יום רביעי | 00:00–02:00"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={onAddShift}
        >
          שמור משמרת
        </button>
      </div>
    </div>
  );
}