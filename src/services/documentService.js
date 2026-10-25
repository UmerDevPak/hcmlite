import { INITIAL_DOCUMENTS } from "@/lib/seedData";

const STORAGE_DOCS = "hcm_lite_documents";

function getDocs() {
  if (typeof window === "undefined") return INITIAL_DOCUMENTS;
  const stored = localStorage.getItem(STORAGE_DOCS);
  if (!stored) {
    localStorage.setItem(STORAGE_DOCS, JSON.stringify(INITIAL_DOCUMENTS));
    return INITIAL_DOCUMENTS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_DOCUMENTS;
  }
}

function saveDocs(list) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_DOCS, JSON.stringify(list));
  }
}

export const documentService = {
  async getAllDocuments({ category = "" } = {}) {
    let list = getDocs();
    if (category) list = list.filter((d) => d.category === category);
    return list;
  },

  async uploadDocument(docData) {
    const list = getDocs();
    const newDoc = {
      id: `DOC-${Math.floor(10 + Math.random() * 90)}`,
      updatedAt: new Date().toISOString().split("T")[0],
      version: "v1.0",
      downloadUrl: "#",
      ...docData,
    };
    list.unshift(newDoc);
    saveDocs(list);
    return newDoc;
  },
};
