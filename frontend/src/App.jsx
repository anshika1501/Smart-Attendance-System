import { useEffect, useState } from "react";

function App() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/students")
      .then((res) => res.json())
      .then((data) => setStudents(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Smart Attendance System</h1>

      <h2>Student List</h2>

      <ul>
        {students.map((student) => (
          <li key={student.id}>
            {student.name} - {student.roll_no}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;