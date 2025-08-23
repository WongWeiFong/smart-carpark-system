// frontend/src/pages/TestDynamo.jsx
import { useEffect, useState } from "react";
import axios from "axios";

function TestDynamo() {
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/slots")
      .then((res) => setSlots(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1>DynamoDB Data</h1>
      <ul>
        {slots.map((slot, index) => (
          <li key={index}>{JSON.stringify(slot)}</li>
        ))}
      </ul>
    </div>
  );
}

export default TestDynamo;
