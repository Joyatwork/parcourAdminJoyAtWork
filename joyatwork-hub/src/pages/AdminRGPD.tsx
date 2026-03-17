import React, { useEffect, useState } from "react";

interface User {
  id: number;
  name: string;
  email: string;
}

interface Consent {
  id: number;
  user_id: number;
  consent_type: string;
  status: string;
  granted_at: string;
  user?: User;
}

interface Compliance {
  id: number;
  name: string;
  purpose: string;
  data_type: string;
  retention_period: string;
}

interface AuditLog {
  id: number;
  action: string;
  user_id: number;
  admin_email: string;
  created_at: string;
}

const AdminRGPD: React.FC = () => {
  // Consents
  const [consents, setConsents] = useState<Consent[]>([]);
  const [loadingConsents, setLoadingConsents] = useState(true);

  // Compliance
  const [complianceData, setComplianceData] = useState<Compliance[]>([]);
  const [complianceFilter, setComplianceFilter] = useState("");
  const [loadingCompliance, setLoadingCompliance] = useState(true);

  // Audit Logs
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  // Fetch consents
  const fetchConsents = async () => {
    try {
      const res = await fetch("http://localhost:8001/api/admin/consents");
      const data: Consent[] = await res.json();
      setConsents(data);
    } catch (error) {
      console.error("Erreur fetch consents:", error);
    } finally {
      setLoadingConsents(false);
    }
  };

  // Fetch compliance
  const fetchCompliance = async () => {
    try {
      let url = "http://localhost:8001/api/admin/compliance";
      if (complianceFilter) url += `?data_type=${complianceFilter}`;

      const res = await fetch(url, { credentials: "include" });
      const data: Compliance[] = await res.json();
      setComplianceData(data);
    } catch (error) {
      console.error("Erreur fetch compliance:", error);
    } finally {
      setLoadingCompliance(false);
    }
  };

  // Fetch RGPD audit logs
  const fetchAuditLogs = async () => {
    try {
      const res = await fetch("http://localhost:8001/api/admin/rgpd-audit");
      const data: AuditLog[] = await res.json();
      setLogs(data);
    } catch (error) {
      console.error("Erreur fetch audit logs:", error);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchConsents();
    fetchAuditLogs();
  }, []);

  useEffect(() => {
    fetchCompliance();
  }, [complianceFilter]);

  // RGPD actions
  const revokeConsent = async (id: number) => {
    await fetch(`http://localhost:8001/api/admin/consents/${id}/revoke`, {
      method: "PATCH",
    });
    fetchConsents();
  };

  const anonymizeUser = async (userId: number) => {
    if (!confirm("Confirmer l’anonymisation ?")) return;

    await fetch(`http://localhost:8001/api/admin/users/${userId}/anonymize`, {
      method: "DELETE",
    });

    fetchConsents();
  };

  const exportUser = async (userId: number) => {
    const response = await fetch(
      `http://localhost:8001/api/admin/users/${userId}/export`
    );
    const data = await response.json();

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `export_user_${userId}.json`;
    a.click();
  };

  return (
    <div className="p-10 space-y-10">
      {/* CONSENTS */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Gestion des consents</h2>
        {loadingConsents ? (
          <p className="text-muted-foreground">Chargement...</p>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Nom</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {consents.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{c.user?.name}</td>
                    <td className="px-6 py-4">{c.user?.email}</td>
                    <td className="px-6 py-4">{c.consent_type}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          c.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(c.granted_at).toLocaleString("fr-FR")}
                    </td>
                    <td className="px-6 py-4 space-x-2">
                      {c.status === "active" && (
                        <button
                          onClick={() => revokeConsent(c.id)}
                          className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition"
                        >
                          Révoquer
                        </button>
                      )}
                      <button
                        onClick={() => exportUser(c.user_id)}
                        className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                      >
                        Export
                      </button>
                      <button
                        onClick={() => anonymizeUser(c.user_id)}
                        className="px-3 py-1 text-xs bg-gray-700 text-white rounded hover:bg-gray-800 transition"
                      >
                        Anonymiser
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* COMPLIANCE */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Registre RGPD (Compliance)</h2>

        <select
          value={complianceFilter}
          onChange={(e) => setComplianceFilter(e.target.value)}
          className="mb-4 px-3 py-1 border rounded"
        >
          <option value="">Tous les types</option>
          <option value="email">Email</option>
          <option value="health">Santé</option>
          <option value="rh">Ressources Humaines</option>
        </select>

        {loadingCompliance ? (
          <p className="text-muted-foreground">Chargement...</p>
        ) : complianceData.length === 0 ? (
          <p>Aucune donnée</p>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Nom</th>
                  <th className="px-6 py-3">Finalité</th>
                  <th className="px-6 py-3">Type de données</th>
                  <th className="px-6 py-3">Durée de conservation</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {complianceData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{item.name}</td>
                    <td className="px-6 py-4">{item.purpose}</td>
                    <td className="px-6 py-4">{item.data_type}</td>
                    <td className="px-6 py-4">{item.retention_period}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* AUDIT LOGS */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Tableau d’audit RGPD</h2>

        {loadingLogs ? (
          <p className="text-muted-foreground">Chargement...</p>
        ) : logs.length === 0 ? (
          <p>Aucun log trouvé.</p>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Action</th>
                  <th className="px-6 py-3">Utilisateur</th>
                  <th className="px-6 py-3">Admin</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{log.action}</td>
                    <td className="px-6 py-4">{log.user_id}</td>
                    <td className="px-6 py-4">{log.admin_email}</td>
                    <td className="px-6 py-4">
                      {new Date(log.created_at).toLocaleString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRGPD;