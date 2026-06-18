"use client";

import { useMemo, useState } from "react";
import { useAuth } from "./AuthProvider";

type DocumentRecord = {
  id: number;
  document_type: string;
  file_name: string;
  file_url: string;
  uploaded_at: string;
  application_number: string;
  first_name: string;
  last_name: string;
};

export function DocumentManagement() {
  const { user, loading } = useAuth();
  const [applicationNumber, setApplicationNumber] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [results, setResults] = useState<DocumentRecord[]>([]);

  const canUpload = applicationNumber.trim().length > 0 && documentType.trim().length > 0 && file !== null;

  const documentTypes = useMemo(
    () => ["Report Card", "Payment Slip", "Birth Certificate", "Passport Photo"],
    []
  );

  async function uploadDocument(event: React.FormEvent) {
    event.preventDefault();
    setStatus(null);

    if (!file) {
      setStatus("Please choose a file.");
      return;
    }

    const formData = new FormData();
    formData.append("applicationNumber", applicationNumber.trim());
    formData.append("documentType", documentType);
    formData.append("file", file);

    const response = await fetch("/api/documents", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      setStatus("Upload failed. Confirm application number exists.");
      return;
    }

    setStatus("Document uploaded successfully.");
    setFile(null);
    setDocumentType("");
    await loadDocuments();
  }

  async function loadDocuments() {
    const query = new URLSearchParams();
    if (applicationNumber.trim()) query.set("applicationNumber", applicationNumber.trim());
    if (documentType.trim()) query.set("type", documentType);

    const response = await fetch(`/api/documents?${query.toString()}`);
    if (!response.ok) {
      setStatus("Unable to load documents.");
      return;
    }

    const data = await response.json();
    setResults(data.documents || []);
  }

  if (loading) {
    return <p>Loading authentication...</p>;
  }

  if (!user) {
    return <p className="card">Please log in as admin or staff to upload or search documents.</p>;
  }

  return (
    <div>
      <h2>Document Management</h2>
      <form className="grid" style={{ gap: 16 }} onSubmit={uploadDocument}>
        <div className="grid grid-2">
          <label>
            Application number
            <input
              className="input"
              value={applicationNumber}
              onChange={(event) => setApplicationNumber(event.target.value)}
              placeholder="APP-..."
            />
          </label>
          <label>
            Document type
            <select
              className="select"
              value={documentType}
              onChange={(event) => setDocumentType(event.target.value)}
            >
              <option value="">Choose document type</option>
              {documentTypes.map((type) => (
                <option value={type} key={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label>
          Choose file
          <input
            className="input"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
          />
        </label>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button className="button" type="submit" disabled={!canUpload}>
            Upload document
          </button>
          <button
            type="button"
            className="button secondary"
            onClick={loadDocuments}
          >
            Search documents
          </button>
        </div>
      </form>

      {status ? <p style={{ marginTop: 16 }}>{status}</p> : null}

      <div style={{ marginTop: 24 }}>
        {results.length === 0 ? (
          <p>No documents found.</p>
        ) : (
          <div className="grid" style={{ gap: 16 }}>
            {results.map((document) => (
              <div key={document.id} className="card" style={{ padding: 16 }}>
                <p>
                  <strong>{document.document_type}</strong> for {document.first_name} {document.last_name}
                </p>
                <p>Application: {document.application_number}</p>
                <p>File: <a href={document.file_url} target="_blank" rel="noreferrer">{document.file_name}</a></p>
                <p>Uploaded: {new Date(document.uploaded_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
