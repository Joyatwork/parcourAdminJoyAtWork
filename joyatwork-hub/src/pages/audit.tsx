import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";

export default function Audit() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/admin/rgpd-audit`)
      .then((res) => res.json())
      .then((data) => setLogs(data))
      .catch((err) => console.error("Erreur API :", err));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Audit RGPD</h1>

      {logs.length === 0 ? (
        <p>Aucun log trouvé.</p>
      ) : (
        <table border={1} cellPadding={8} cellSpacing={0}>
          <thead>
            <tr>
              <th>Action</th>
              <th>User</th>
              <th>Admin</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log: any) => (
              <tr key={log.id}>
                <td>{log.action}</td>
                <td>{log.user_id}</td>
                <td>{log.admin_email}</td>
                <td>{new Date(log.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
