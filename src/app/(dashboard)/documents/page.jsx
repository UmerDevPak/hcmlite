"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Plus,
  Search,
  CheckCircle2,
  Lock,
  FileCheck2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { documentService } from "@/services/documentService";
import { DOCUMENT_CATEGORIES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";

export default function DocumentsPage() {
  const { isHR } = useAuth();
  const { notifySuccess, notifyError } = useNotification();

  const [docs, setDocs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: DOCUMENT_CATEGORIES[0],
    size: "1.2 MB",
  });

  const loadData = async () => {
    const list = await documentService.getAllDocuments({ category: selectedCategory });
    setDocs(list);
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      await documentService.uploadDocument(formData);
      notifySuccess("Document Published", `${formData.name} added to repository.`);
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      notifyError("Failed to upload document", err.message);
    }
  };

  const handleDownload = (doc) => {
    notifySuccess("Downloading Policy", `${doc.name} (${doc.version}) download initiated.`);
  };

  const filteredDocs = docs.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Documents & Compliance Library
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Official company handbooks, benefits schedules, confidentiality agreements, and tax forms.
          </p>
        </div>

        {isHR && (
          <Button size="sm" icon={Plus} onClick={() => setIsModalOpen(true)}>
            Upload Document
          </Button>
        )}
      </div>

      {/* Filter and search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search documents by policy name..."
            icon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-60">
          <Select
            placeholder="All Document Categories"
            options={DOCUMENT_CATEGORIES}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          />
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map((doc) => (
          <Card key={doc.id} className="p-5 flex items-start justify-between gap-4 hover:border-zinc-700/80 transition-colors">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                  {doc.name}
                </h4>
                <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                  <span>{doc.category}</span>
                  <span>•</span>
                  <span>{doc.size}</span>
                  <span>•</span>
                  <span className="font-mono">{doc.version}</span>
                </div>
                <div className="text-[11px] text-zinc-500 mt-2">
                  Updated {formatDate(doc.updatedAt)}
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={() => handleDownload(doc)}
            >
              Download
            </Button>
          </Card>
        ))}
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Publish Organization Document"
        description="Upload official policy or contract document for team distribution."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleUpload} className="space-y-4">
          <Input
            label="Document Title"
            placeholder="e.g. Remote Work Safety & Ergonomics Guideline"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Select
            label="Category"
            options={DOCUMENT_CATEGORIES}
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />

          <Input
            label="File Size"
            value={formData.size}
            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Publish Document</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
