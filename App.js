import React, { useState } from "react";
import "./App.css";

export default function App() {
  const [students, setStudents] = useState([
    {
      id: 1,
      idno: "1000",
      lastname: "ALPHA",
      firstname: "BRAVO",
      course: "BSCS",
    },
  ]);

  const [form, setForm] = useState({
    idno: "",
    lastname: "",
    firstname: "",
    course: "",
  });

  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  // ADD
  const handleAdd = () => {
    if (!form.idno || !form.lastname || !form.firstname || !form.course) {
      alert("Fill all fields!");
      return;
    }

    setStudents([
      ...students,
      { id: Date.now(), ...form }
    ]);

    setForm({
      idno: "",
      lastname: "",
      firstname: "",
      course: "",
    });
  };

  // DELETE
  const handleDelete = (id) => {
    setStudents(students.filter((s) => s.id !== id));
  };

  // CLICK EDIT
  const handleEdit = (student) => {
    setEditId(student.id);
    setEditData(student);
  };

  // CHANGE EDIT INPUT
  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  // SAVE UPDATE
  const handleSave = () => {
    setStudents(
      students.map((s) =>
        s.id === editId ? editData : s
      )
    );
    setEditId(null);
  };

  return (
    <div className="container">
      <h1>SCHOOL v1.0</h1>
      <h2>STUDENTS</h2>

      {/* ADD FORM */}
      <div className="form">
        <input
          placeholder="IDNO"
          value={form.idno}
          onChange={(e) => setForm({ ...form, idno: e.target.value })}
        />
        <input
          placeholder="LAST NAME"
          value={form.lastname}
          onChange={(e) => setForm({ ...form, lastname: e.target.value })}
        />
        <input
          placeholder="FIRST NAME"
          value={form.firstname}
          onChange={(e) => setForm({ ...form, firstname: e.target.value })}
        />
        <input
          placeholder="COURSE"
          value={form.course}
          onChange={(e) => setForm({ ...form, course: e.target.value })}
        />
        <button onClick={handleAdd} className="add">Add</button>
      </div>

      {/* TABLE */}
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>IDNO</th>
            <th>LASTNAME</th>
            <th>FIRSTNAME</th>
            <th>COURSE</th>
            <th>ACTIONS</th>
          </tr>
        </thead>

        <tbody>
          {students.map((s, index) => (
            <tr key={s.id}>
              <td>{index + 1}</td>

              <td>
                {editId === s.id ? (
                  <input name="idno" value={editData.idno} onChange={handleEditChange} />
                ) : (
                  s.idno
                )}
              </td>

              <td>
                {editId === s.id ? (
                  <input name="lastname" value={editData.lastname} onChange={handleEditChange} />
                ) : (
                  s.lastname
                )}
              </td>

              <td>
                {editId === s.id ? (
                  <input name="firstname" value={editData.firstname} onChange={handleEditChange} />
                ) : (
                  s.firstname
                )}
              </td>

              <td>
                {editId === s.id ? (
                  <input name="course" value={editData.course} onChange={handleEditChange} />
                ) : (
                  s.course
                )}
              </td>

              <td>
                {editId === s.id ? (
                  <button className="save" onClick={handleSave}>💾</button>
                ) : (
                  <button className="update" onClick={() => handleEdit(s)}>✏️</button>
                )}

                <button className="delete" onClick={() => handleDelete(s.id)}>❌</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}