"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";

interface Compliance {
  id: number;
  name: string;
  purpose: string;
  data_type: string;
  retention_period: string;
}

export default function CompliancePage() {
  const [data, setData] = useState<Compliance[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    let url = `${API_BASE_URL}/admin/compliance`;

    if (filter) {
      url += `?data_type=${filter}`;
    }

    const response = await fetch(url, {
      credentials: "include",
    });

    const result = await response.json();
    setData(result);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Registre RGPD</h1>

      {/* Filtre */}
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{ marginBottom: "20px" }}
      >
        <option value="">Tous les types</option>
        <option value="email">Email</option>
        <option value="health">Santé</option>
        <option value="rh">Ressources Humaines</option>
      </select>

      {/* Tableau */}
      <table border={1} cellPadding={10}>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Finalité</th>
            <th>Type de données</th>
            <th>Durée de conservation</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.purpose}</td>
              <td>{item.data_type}</td>
              <td>{item.retention_period}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
