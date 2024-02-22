"use client";
import { useState, useEffect } from "react";
import style from "./page.module.css";
import Link from "next/link";

export default function List() {
  const [data, setData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [updatedText, setUpdatedText] = useState("");
  const [fieldName, setFieldName] = useState("");

  useEffect(() => {
    async function fetchData() {
      const response = await fetch("http://localhost:3030/data");
      const jsonData = await response.json();
      jsonData
              .sort((a,b) => a.question_id - b.question_id)
              .sort((a,b) => a.num - b.num)
              .sort((a, b) => a.index - b.index)
      setData(jsonData);
    }
    fetchData();
  }, []);
  const handleEdit = (id, text, fieldName = 'answers') => {
    setEditingId(id);
    setUpdatedText(text);
    setFieldName(fieldName);
  };

  const handleUpdate = async (id, field) => {
    const updatedItem = data.find((item) => item._id === id);
    // Update the relevant field with the updated text
    if (editingId === id) {
      updatedItem[fieldName] = updatedText;
      setEditingId(null);
      // Send updated data to the server
      await fetch(`http://localhost:3030/data/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value: updatedText,field:fieldName }), // Send only the updated field
      });
      // Update local state with the updated item
      const updatedData = data.map((item) =>
        item._id === id ? updatedItem : item
      );
      setData(updatedData);
    }
  };
  const handleDelete = async (id) => {
    if (id !== '') {
      const deletedItem = data.find((item) => item._id === id);
      setEditingId(null);
      setFieldName('');
    
      // Send request to delete data from the server
      await fetch(`http://localhost:3030/data/${id}`, {
          method: "DELETE",
          headers: {
              "Content-Type": "application/json",
          },
      });

      // Update local state to reflect the deleted item
      const updatedData = data.filter((item) => item._id !== id);
      setData(updatedData);
    }
  };

  const handleExport = () => {
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
    <ul className={style.list}>
      {data.map((item) => (
        <li
          className={style.list_item}
          key={item._id}
          style={{ border: !item.answers ? "3px red solid" : item.questions === 'טיפ' ? "3px orange solid" : ''}}
        >
          <div className={style.item}>
            <div className={style.class_header}>
              <div className={style.header_left}>
                <div className={style.index}>Item ID - {item.index}.</div>
                <div className={style.num}>Story ID - {item.num} ( {" "}
                  <div style={{display:'inline-block'}} className={style.question_id}>
                  {item.question_id}#
                </div>
                {" "})</div>
                
              </div>
              <div className={`${style.header_right} ${style.he}`}>
              <button className={style.submit_button} style={{backgroundColor:"red"}} onClick={() => handleDelete(item._id)}>
                      Delete
                    </button>
                <h3>{item.category}</h3>
              </div>
            </div>
            <div className={style.class_body}>
              <div  className={style.he}>
                {(editingId !== item._id || fieldName !==  'questions') && (
                  <h3 style={{color:item.questions === 'טיפ' ? "orange" : ''}} onClick={() => handleEdit(item._id, item.questions,'questions')}>
                    {item.questions}
                  </h3>
                )}
                {editingId === item._id && fieldName === 'questions' && (
                  <div>
                    <input
                    className={style.input}
                      type="text"
                      sx={{fontSize:'1.17em'}}
                      value={updatedText}
                      onChange={(e) => setUpdatedText(e.target.value)}
                    />
                    <button className={style.submit_button} onClick={() => handleUpdate(item._id)}>OK</button>
                  </div>
                )}
              </div>
              <div>
                {item.answers && (editingId !== item._id || fieldName !== 'answers' ) && (
                  <h2  className={style.he} onClick={() => handleEdit(item._id, item.answers)}>
                    {item.answers}
                  </h2>
                )}
                {item.answers && editingId === item._id && fieldName === 'answers' && (
                  <div className={style.he}>
                    <textarea
                    rows={8}
                    className={style.input}
                      type="text"
                      value={updatedText}
                      onChange={(e) => setUpdatedText(e.target.value)}
                    />
                    <button className={style.submit_button} onClick={() => handleUpdate(item._id, "answers")}>
                      OK
                    </button>
                    
                  </div>
                )}
              </div>

              <br />
              <br />
              <Link href={item.path}>Link to Story</Link>
            </div>
          </div>
        </li>
      ))}
    </ul>
    <button onClick={handleExport}>Export Data as JSON</button>

    </>
  );
}
// {
//   "_id":{"$oid":"65d7420485a7023e69f29e8e"},
//   "category":"אטרקציות לחתונה",
//   "num":{"$numberInt":"1"},
//   "path":"https://www.google.com/url?q=https://www.mit4mit.co.il/blog/article/604f1b02eeee0d115345b7d8&sa=D&source=editors&ust=1708603975590384&usg=AOvVaw2jZMD66v2OBbuJKVYHt3Rz",
//   "questions":"האם הקורונה השפיעה על בחירת האטרקציות לחתונות?",
//   "answers":"כן, הקורונה גרמה לזוגות לחפש אטרקציות ייחודיות ומקוריות יותר, כמו בלוקים מעץ עם תמונות האורחים או בלוקים מזכוכית. בנוסף, זוגות רבים נותנים עדיפות לאטרקציות שמוסיפות תחושה של חגיגה לאירוע ומעודדות ריקודים, כמו מופעי בלונים או זיקוקים.",
//   "index":{"$numberInt":"0"},
//   "question_id":{"$numberInt":"1"}
// }
