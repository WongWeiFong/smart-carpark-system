import { useEffect, useState } from "react";
import axios from "axios";

function TestDynamo() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3001/entry")
      .then((res) => setUsers(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1>DynamoDB Users</h1>
      <ul>
        {users.map((user, index) => (
          <li key={index}>
            Plate: {user.plateNumber} | Balance: {user.walletBalance}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TestDynamo;
