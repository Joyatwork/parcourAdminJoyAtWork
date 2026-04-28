import React, { useEffect, useState } from "react";

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

interface LegalDocument {
  id: number;
  name: string;
  file_url: string;
  uploaded_at: string;
}

const API = "http://127.0.0.1:8000/api/admin"; // ✔️ bon port

const Accordion = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border rounded-lg bg-white shadow">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center px-6 py-4 text-left font-semibold text-lg hover:bg-gray-50 transition text-black"
      >
        {title}
        <span className="text-xl text-black">{open ? "−" : "+"}</span>
      </button>

      {open && <div className="px-6 pb-6">{children}</div>}
    </div>
  );
};

const AdminRGPD: React.FC = () => {
  const [complianceData, setComplianceData] = useState<Compliance[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  const fetchCompliance = async () => {
    const res = await fetch(`${API}/compliance`);
    setComplianceData(await res.json());
  };

  const fetchAuditLogs = async () => {
    const res = await fetch(`${API}/rgpd-audit`);
    setLogs(await res.json());
  };

  const fetchDocuments = async () => {
    const res = await fetch(`${API}/legal-documents`);
    const data = await res.json();

    const origin = "http://127.0.0.1:8000";

    const fixed = data.map((doc: LegalDocument) => ({
      ...doc,
      file_url: doc.file_url.startsWith("http")
        ? doc.file_url
        : `${origin}/${doc.file_url.replace(/^\/+/, "")}`,
    }));

    setDocuments(fixed);
  };

  useEffect(() => {
    fetchCompliance();
    fetchAuditLogs();
    fetchDocuments();
  }, []);

  const uploadDocument = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("document", file);

    await fetch(`${API}/legal-documents/upload`, {
      method: "POST",
      body: formData,
    });

    fetchDocuments();
  };

  return (
    <div className="p-10 space-y-8">

      {/* PDF PREVIEW */}
      {selectedDoc && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Aperçu du document :</h3>
          <iframe src={selectedDoc} className="w-full h-[600px] border"></iframe>
        </div>
      )}

      {/* COMPLIANCE */}
      <Accordion title="Registre des traitements (obligation RGPD)">
        <p className="text-sm text-gray-600 mb-4">
          Le document CGU décrit explicitement les traitements réalisés par JOYATWORK.
        </p>

        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-2">Nom</th>
              <th className="px-4 py-2">Finalité</th>
              <th className="px-4 py-2">Type de données</th>
              <th className="px-4 py-2">Durée</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {complianceData.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-2">{item.name}</td>
                <td className="px-4 py-2">{item.purpose}</td>
                <td className="px-4 py-2">{item.data_type}</td>
                <td className="px-4 py-2">{item.retention_period}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Accordion>

      {/* AUDIT LOGS */}
      <Accordion title="Journal d’audit RGPD (traçabilité obligatoire)">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-2">Action</th>
              <th className="px-4 py-2">Utilisateur</th>
              <th className="px-4 py-2">Admin</th>
              <th className="px-4 py-2">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="px-4 py-2">{log.action}</td>
                <td className="px-4 py-2">{log.user_id}</td>
                <td className="px-4 py-2">{log.admin_email}</td>
                <td className="px-4 py-2">
                  {new Date(log.created_at).toLocaleString("fr-FR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Accordion>

      {/* LEGAL DOCUMENTS */}
      <Accordion title="Documents légaux (CGU, Politique de confidentialité)">
        <div className="space-y-4">

          {/* Upload */}
          <div className="mb-4">
            <label className="font-semibold"></label>
            <input
              type="file"
              accept="application/pdf"
              onChange={uploadDocument}
              className="mt-2 block"
            />
          </div>

          {/* List */}
          <ul className="space-y-2">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="flex justify-between items-center p-3 border rounded"
              >
                <span className="text-black">{doc.name}</span>
                <button
                  onClick={() => setSelectedDoc(doc.file_url)}
                  className="text-blue-600 underline"
                >
                  Voir
                </button>
              </li>
            ))}
          </ul>
        </div>
      </Accordion>
    </div>
  );
};

export default AdminRGPD;
