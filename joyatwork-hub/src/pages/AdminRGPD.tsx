import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";

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

  const exportGovernancePdf = async () => {
    try {
      // Try server-side PDF generation
      const res = await fetch("http://localhost:8001/api/admin/rgpd/export-pdf", {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `gouvernance_export.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        return;
      }

      // Fallback: open printable view for Save as PDF
      console.warn("Server-side PDF export failed, falling back to client print.");
    } catch (err) {
      console.warn("Export PDF request failed, falling back to client print.", err);
    }

    const tableEl = document.getElementById("rgpd-table");
    if (!tableEl) return;
    const newWin = window.open("", "_blank", "width=900,height=700");
    if (!newWin) return;
    const style = `body{font-family: Arial, Helvetica, sans-serif; padding:20px;} table{width:100%; border-collapse: collapse;} th, td{border:1px solid #ddd; padding:8px;} th{background:#f3f4f6; text-align:left;}`;
    newWin.document.write(`<html><head><title>Gouvernance - Export</title><style>${style}</style></head><body>${tableEl.outerHTML}</body></html>`);
    newWin.document.close();
    newWin.focus();
    newWin.print();
  };

  // Upload PDFs (client -> server)
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{id?: number; original_name: string; filename?: string; url?: string;}>>([]);

  const triggerFileInput = () => fileInputRef.current?.click();

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const form = new FormData();
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      // accept only PDFs
      if (f.type !== "application/pdf") continue;
      form.append("files[]", f, f.name);
    }

    try {
      const res = await fetch("http://localhost:8001/api/admin/rgpd/upload-docs", {
        method: "POST",
        credentials: "include",
        body: form,
      });

      if (!res.ok) {
        let details = '';
        try { const j = await res.json(); details = j.message || JSON.stringify(j); } catch { details = await res.text(); }
        console.error('Upload failed', res.status, details);
        alert(`Échec de l'upload (${res.status}). Détails: ${details}`);
        return;
      }

      const data = await res.json();
      // expect { uploaded: [{ original_name, filename, url }, ...] }
      setUploadedFiles(data.uploaded || []);
      alert(`Upload réussi (${(data.uploaded || []).length} fichier(s))`);
    } catch (err) {
      console.error("Upload error", err);
      alert("Échec de l'upload. Vérifie le serveur et console dev (CORS/auth/taille). Voir console pour détails.");
    } finally {
      // reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="p-10 space-y-10">
      {/* GOUVERNANCE */}
      <div>
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-2xl font-bold">Gouvernance & Conformité des Données</h2>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              multiple
              onChange={handleFilesSelected}
              className="hidden"
            />
            <Button variant="ghost" onClick={triggerFileInput}>
              Importer PDF
            </Button>
            <Button variant="secondary" onClick={exportGovernancePdf}>
              Exporter PDF
            </Button>
          </div>
        </div>

        <div className="overflow-hidden bg-white shadow sm:rounded-md">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Section</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Description</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Conservation / Rétention</th>
              </tr>
            </thead>
            <tbody id="rgpd-table" className="divide-y">
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4">Gestion des utilisateurs</td>
                <td className="px-6 py-4">Gérer les comptes utilisateurs (création, lecture, mise à jour, suppression), profils, informations personnelles, recherche, pagination et listes d'utilisateurs inscrits sur la plateforme. Inclut la gestion des statuts (actif/inactif) et des validations côté serveur.</td>
                <td className="px-6 py-4">En base active pendant l'utilisation par le salarié; archivage intermédiaire; purge au plus tard 2 ans après inactivité, départ du salarié, suppression volontaire ou fin du contrat. Restitution ou destruction sous 30 jours après fin de contrat sauf obligations légales contraires.</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4">Authentification & Autorisation</td>
                <td className="px-6 py-4">Inscription, connexion, réinitialisation de mot de passe, gestion des tokens/sessions, vérification d'email et contrôle d'accès basé sur rôles/permissions (admin, praticien, employé, etc.).</td>
                <td className="px-6 py-4">Logs et traces conservés selon finalité; reprise/restauration selon SLA; purge standard: 2 ans d'inactivité; tokens/sessions: durées techniques courtes (ex. 30 jours).</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4">Gestion des rôles et permissions</td>
                <td className="px-6 py-4">Création et attribution de rôles, définition de permissions par rôle, vérification d'accès pour les routes et actions sensibles.</td>
                <td className="px-6 py-4">Conserver selon nécessité d'audit et finalité; purge selon règle générale (2 ans d'inactivité) sauf obligation légale ou d'audit nécessitant conservation plus longue.</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4">Santé / Diagnostics</td>
                <td className="px-6 py-4">Enregistrer, lire et analyser les données de santé (diagnostics, antécédents, symptômes). Gestion des historiques et alertes médicales.</td>
                <td className="px-6 py-4">Données de santé: conservation conforme à la réglementation sanitaire applicable (durées spécifiques selon législation); sinon archivage puis purge selon règle générale (2 ans d'inactivité) si non requis autrement.</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4">Gestion des praticiens</td>
                <td className="px-6 py-4">Ajouter/éditer/supprimer les praticiens; gérer spécialités, disponibilités, profils publics, certifications et liens vers comptes utilisateur.</td>
                <td className="px-6 py-4">Profils/certifications: archivage pendant la relation; purge au plus tard 2 ans après départ sauf obligations légales spécifiques.</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4">Rendez‑vous & Agenda</td>
                <td className="px-6 py-4">Création, modification, annulation et consultation des rendez-vous; gestion des créneaux, conflits, récurrences et notifications associées.</td>
                <td className="px-6 py-4">Rendez‑vous: archivage pendant la relation; purge au bout de 2 ans d'inactivité hors obligations légales métier.</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4">Disponibilités & Planning</td>
                <td className="px-6 py-4">Définition des plages horaires des praticiens, blocage de créneaux, exceptions et règles métier pour proposer des rendez-vous valides.</td>
                <td className="px-6 py-4">Historique planning: archivage intermédiaire; purge au plus tard 2 ans après inactivité sauf nécessité métier ou obligation légale.</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4">Gestion des entreprises</td>
                <td className="px-6 py-4">Ajouter et gérer les entreprises : profil, adresses, contacts, paramètres, utilisateurs liés et délégation d'administration.</td>
                <td className="px-6 py-4">Contrats/entreprises: conservation selon obligations légales (ex. 10 ans) ; sinon archivage puis purge conforme aux instructions du responsable de traitement.</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4">Gestion des contrats</td>
                <td className="px-6 py-4">Création et suivi des contrats (type, période, conditions), liaison entreprise↔contrat↔utilisateur, status et renouvellements.</td>
                <td className="px-6 py-4">Contrats: conservation selon obligations légales (ex. 10 ans) ; purge après fin de conservation légale.</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4">Gestion des documents & pièces jointes</td>
                <td className="px-6 py-4">Upload, stockage, accès et suppression de fichiers (contrats, certificats, rapports) avec contrôles de sécurité et permissions.</td>
                <td className="px-6 py-4">Documents: conservation selon type et obligations légales (contrats, RH, factures); sinon purge selon règle générale (2 ans d'inactivité) ou instruction du responsable.</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4">Paiements & Facturation</td>
                <td className="px-6 py-4">Enregistrement des transactions, génération de factures, suivi des paiements et intégration de passerelles si nécessaire.</td>
                <td className="px-6 py-4">Facturation: conservation selon obligations comptables (ex. 7 ans) ; purge après échéance légale.</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4">Notifications & Communications</td>
                <td className="px-6 py-4">Envoi d'emails, SMS ou notifications push pour confirmations, rappels et alertes; templates et préférences utilisateur.</td>
                <td className="px-6 py-4">Notifications & préférences: archivage court (ex. 1 an) ; logs d'envoi conservés selon nécessité de preuve et règles d'audit.</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4">Challenges / Programmes</td>
                <td className="px-6 py-4">Création et gestion de défis/programmes, suivi de progression, récompenses et statistiques de participation.</td>
                <td className="px-6 py-4">Données programmes/challenges: archivage puis purge au plus tard 2 ans après inactivité, sauf consentement contraire ou obligation légale.</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4">API & Endpoints</td>
                <td className="px-6 py-4">Routes API CRUD pour toutes les entités, validation des entrées, format de réponse standardisé et gestion des erreurs.</td>
                <td className="px-6 py-4">Endpoints/implémentation: logs et traces conservés selon finalité (1-3 ans) ; données exportées/importées selon règle par entité.</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4">Import / Export de données</td>
                <td className="px-6 py-4">Endpoints/scripts pour importer/exporter des lots de données (CSV/JSON) et migration assistée.</td>
                <td className="px-6 py-4">Imports/exports: logs conservés (ex. 3 ans); fichiers importés conservés selon finalité et instructions du responsable.</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4">Tests & Validation</td>
                <td className="px-6 py-4">Suites de tests unitaires et fonctionnels, validations serveur et garanties de stabilité des fonctionnalités critiques.</td>
                <td className="px-6 py-4">Tests/artefacts CI: conservés selon politique interne; pas de conservation de données personnelles en tests sauf pseudo/anonymisation.</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4">Migrations & Seeders</td>
                <td className="px-6 py-4">Scripts de migration de la base de données et seeders pour environnement de développement/test.</td>
                <td className="px-6 py-4">Migrations & seeders: code (git) conservé; ne pas stocker de données personnelles en clair dans les seeders.</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4">Sécurité & Audit</td>
                <td className="px-6 py-4">Journalisation des actions sensibles, protection contre les injections, chiffrement des données sensibles et logs d'audit.</td>
                <td className="px-6 py-4">Logs d'audit immuables: conservés pour audit (ex. 5-10 ans) selon criticité et obligations légales; accès restreint.</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4">Conformité RGPD & gestion des données personnelles</td>
                <td className="px-6 py-4">Registre des traitements, gestion des consentements, droit à l'effacement et portabilité, anonymisation/pseudonymisation des données sensibles (santé), journaux d'audit immuables, chiffrement et procédures DPO (notification des incidents, DPIA).</td>
                <td className="px-6 py-4">Registre des traitements et logs: conservés pour démontrer conformité (ex. 5-10 ans); données personnelles: conservation selon finalité et obligations légales (purge 2 ans d'inactivité par défaut).</td>
              </tr>

              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4">Rapports & Analytics</td>
                <td className="px-6 py-4">Génération de rapports opérationnels et KPI (rendez-vous, taux d'occupation, contrats actifs) consultables via tableau de bord.</td>
                <td className="px-6 py-4">Rapports & analytics: données agrégées pseudonymisées de préférence; conservation selon finalité (ex. 3-5 ans); logs détaillés selon besoin (1-2 ans).</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Uploaded files list */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4 bg-white p-4 rounded border">
          <h3 className="font-semibold mb-2">Fichiers importés</h3>
          <ul className="list-disc pl-5">
            {uploadedFiles.map((f, idx) => (
              <li key={f.id || idx} className="mb-1">
                {f.url ? (
                  <a href={f.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                    {f.original_name}
                  </a>
                ) : (
                  <span>{f.original_name}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

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
