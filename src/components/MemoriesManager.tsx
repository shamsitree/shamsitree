import { PREVIEW_ONLY, PREVIEW_MESSAGE } from '../utils/previewMode';
import React, { useState, useEffect } from 'react';
import { FamilyMemory } from '../types/family';
import { uploadFamilyPhotoXHR } from '../utils/photoStorage';
import { supabase } from '../utils/supabaseClient';
import { Plus, Image, Trash2, Edit3, X, Calendar, RefreshCw } from 'lucide-react';

interface MemoriesManagerProps {
  userId?: string;
}

export const MemoriesManager: React.FC<MemoriesManagerProps> = ({ userId }) => {
  const [memories, setMemories] = useState<FamilyMemory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<FamilyMemory | null>(null);

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const storageKey = `shamsitree_memories_${userId || 'guest'}`;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setMemories(JSON.parse(raw));
    } catch {
      setMemories([]);
    }
  }, [storageKey]);

  const saveToStorage = (list: FamilyMemory[]) => {
    setMemories(list);
    try {
      localStorage.setItem(storageKey, JSON.stringify(list));
    } catch {
      // ignore
    }
  };

  const openAdd = () => {
    setEditingMemory(null);
    setTitle('');
    setNotes('');
    setSelectedFile(null);
    setPhotoPreview('');
    setIsModalOpen(true);
  };

  const openEdit = (m: FamilyMemory) => {
    setEditingMemory(m);
    setTitle(m.title);
    setNotes(m.notes);
    setSelectedFile(null);
    setPhotoPreview(m.photo_path ? getPhotoUrl(m.photo_path) : '');
    setIsModalOpen(true);
  };

  const getPhotoUrl = (path: string) => {
    if (/^https?:\/\//i.test(path) || /^data:/i.test(path)) return path;
    try {
      const { data } = supabase.storage.from('family-photos').getPublicUrl(path);
      return data?.publicUrl || '';
    } catch {
      return '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (PREVIEW_ONLY) { alert(PREVIEW_MESSAGE); return; }
    if (!title.trim() && !notes.trim() && !selectedFile) {
      alert('Please provide a title, notes, or select a photo.');
      return;
    }

    setIsUploading(true);
    try {
      const id = editingMemory?.id || crypto.randomUUID();
      let photoPath = editingMemory?.photo_path || null;

      if (selectedFile && userId) {
        photoPath = await uploadFamilyPhotoXHR({
          file: selectedFile,
          folder: 'memories',
          recordId: id,
          userId
        });
      }

      const item: FamilyMemory = {
        id,
        title: title.trim(),
        notes: notes.trim(),
        photo_path: photoPath,
        created_at: editingMemory?.created_at || new Date().toISOString()
      };

      let updated: FamilyMemory[];
      if (editingMemory) {
        updated = memories.map(m => m.id === id ? item : m);
      } else {
        updated = [item, ...memories];
      }

      saveToStorage(updated);
      setIsUploading(false);
      setIsModalOpen(false);
    } catch (err: any) {
      setIsUploading(false);
      alert('Could not save memory:\n' + (err.message || String(err)));
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this family memory?')) {
      const updated = memories.filter(m => m.id !== id);
      saveToStorage(updated);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Image className="w-5 h-5 text-emerald-700" />
            <span>Family Memories & Heritage Album</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Preserve stories, historic photos, and cherished family recollections.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Memory</span>
        </button>
      </div>

      {/* Grid of memories */}
      {memories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {memories.map((m) => {
            const url = m.photo_path ? getPhotoUrl(m.photo_path) : null;
            return (
              <div
                key={m.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  {url && (
                    <img
                      src={url}
                      alt=""
                      className="w-full h-44 object-cover border-b border-gray-100"
                    />
                  )}
                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-gray-900 text-sm">{m.title || "Untitled Memory"}</h3>
                    <p className="text-xs text-gray-600 line-clamp-4 leading-relaxed whitespace-pre-wrap">
                      {m.notes}
                    </p>
                  </div>
                </div>

                <div className="p-4 border-t border-gray-100 flex justify-between items-center text-[11px] text-gray-400 bg-gray-50/50">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(m.created_at).toLocaleDateString()}</span>
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(m)}
                      className="text-gray-600 hover:text-emerald-700 p-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="text-gray-600 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-2xl border border-gray-200 text-gray-500">
          <Image className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-bold text-gray-800 text-base">No Memories Recorded Yet</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Upload family photos, ancestral portraits, or record historical stories to start your album.
          </p>
          <button
            onClick={openAdd}
            className="mt-4 inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Memory</span>
          </button>
        </div>
      )}

      {/* Modal for Add / Edit Memory */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-200 p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base text-gray-900">
                {editingMemory ? 'Edit Memory' : 'Add Family Memory'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Ancestral Home in Rampur (1945)"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Story & Details
                </label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe the occasion, people present, historical background..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Photo (Optional)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setSelectedFile(f);
                      setPhotoPreview(URL.createObjectURL(f));
                    }
                  }}
                  className="text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-emerald-700 file:text-white cursor-pointer"
                />

                {photoPreview && (
                  <img
                    src={photoPreview}
                    alt=""
                    className="w-full h-36 object-cover rounded-xl mt-3 border"
                  />
                )}
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isUploading}
                  className="px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-50 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  {isUploading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isUploading ? 'Saving...' : 'Save Memory'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
