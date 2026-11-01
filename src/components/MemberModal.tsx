import React, { useState, useEffect } from 'react';
import { FamilyMember, Gender, ChildRelationshipType, FamilyUnion } from '../types/family';
import { BIRADARI_OPTIONS } from '../data/initialShamsiData';
import { photoFor, uploadFamilyPhotoXHR } from '../utils/photoStorage';
import { X, Upload, AlertCircle, RefreshCw } from 'lucide-react';

interface MemberModalProps {
  standalone?: boolean;
  cloudReadOnly?: boolean;
  isOpen: boolean;
  onClose: () => void;
  member: FamilyMember | null;
  allMembers: FamilyMember[];
  onSave: (memberData: Partial<FamilyMember>, parentage?: { fatherId?: string; motherId?: string; spouseId?: string; relationshipType?: ChildRelationshipType }) => Promise<void>;
  userId?: string;
  defaultRelation?: { targetMember: FamilyMember; relationType: 'father' | 'mother' | 'spouse' | 'child'; union?: FamilyUnion } | null;
}

export const MemberModal: React.FC<MemberModalProps> = ({
  standalone = false,
  cloudReadOnly = false,
  isOpen,
  onClose,
  member,
  allMembers,
  onSave,
  userId,
  defaultRelation
}) => {
  const [reuseId, setReuseId] = useState('');
  const [allowDuplicate, setAllowDuplicate] = useState(false);
  const [draftId, setDraftId] = useState(() => crypto.randomUUID());
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [dob, setDob] = useState('');
  const [dod, setDod] = useState('');
  const [isDeceased, setIsDeceased] = useState(false);
  const [phone, setPhone] = useState('');
  const [biradari, setBiradari] = useState('Shamsi');
  const [birthplace, setBirthplace] = useState('');
  const [currentResidence, setCurrentResidence] = useState('');
  const [notes, setNotes] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');

  // Relationships
  const [fatherId, setFatherId] = useState('');
  const [motherId, setMotherId] = useState('');
  const [spouseId, setSpouseId] = useState('');
  const [childRelType, setChildRelType] = useState<ChildRelationshipType>('biological');

  // Photo upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setReuseId('');
    setAllowDuplicate(false);
    if (member) {
      setFullName(member.full_name || '');
      setGender(member.gender || 'male');
      setDob(member.date_of_birth || '');
      setDod(member.date_of_death || '');
      setIsDeceased(!!member.date_of_death);
      setPhone(member.phone || '');
      setBiradari(member.biradari || 'Shamsi');
      setBirthplace(member.birthplace || '');
      setCurrentResidence(member.current_residence || member.location || '');
      setNotes(member.notes || '');
      setProfilePhoto(member.profile_photo || '');
      setPhotoPreview(member.profile_photo ? photoFor(member) : '');
      setFatherId('');
      setMotherId('');
      setSpouseId('');
      setChildRelType('biological');
    } else {
      setDraftId(crypto.randomUUID());
      setFullName('');
      setGender('male');
      setDob('');
      setDod('');
      setIsDeceased(false);
      setPhone('');
      setBiradari('Shamsi');
      setBirthplace('');
      setCurrentResidence('');
      setNotes('');
      setProfilePhoto('');
      setPhotoPreview('');
      setFatherId('');
      setMotherId('');
      setSpouseId('');
      setChildRelType('biological');

      // Preset from defaultRelation if opened via Quick Add
      if (defaultRelation) {
        if (defaultRelation.relationType === 'father') {
          setGender('male');
        } else if (defaultRelation.relationType === 'mother') {
          setGender('female');
        } else if (defaultRelation.relationType === 'spouse') {
          setGender(defaultRelation.targetMember.gender === 'male' ? 'female' : 'male');
          setSpouseId(defaultRelation.targetMember.id);
        } else if (defaultRelation.relationType === 'child') {
          if (defaultRelation.union) {
            const parents = [defaultRelation.union.partner1_id, defaultRelation.union.partner2_id]
              .map(id => allMembers.find(m => m.id === id)).filter(Boolean);
            setFatherId(parents.find(p => p!.gender === 'male')?.id || '');
            setMotherId(parents.find(p => p!.gender === 'female')?.id || '');
          } else if (defaultRelation.targetMember.gender === 'male') setFatherId(defaultRelation.targetMember.id);
          else setMotherId(defaultRelation.targetMember.id);
        }
      }
    }
    setSelectedFile(null);
    setUploadProgress(null);
    setUploadError(null);
  }, [member, defaultRelation, isOpen]);

  useEffect(() => () => { if (photoPreview.startsWith('blob:')) URL.revokeObjectURL(photoPreview); }, [photoPreview]);
  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadError(null);
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cloudReadOnly) { alert('Cloud editing awaits database safety approval.'); return; }
    if (reuseId) {
      const person = allMembers.find(m => m.id === reuseId);
      if (!person) return;
      setIsSaving(true);
      try { await onSave(person, {relationshipType: childRelType}); onClose(); }
      catch (err) { alert(String(err)); } finally { setIsSaving(false); }
      return;
    }
    if (!member && !allowDuplicate && allMembers.some(m => m.full_name.trim().toLocaleLowerCase() === fullName.trim().toLocaleLowerCase())) {
      alert('A person with this name exists. Reuse their record, or confirm this is a different person.'); return;
    }
    if (dob && dod && isDeceased && dob > dod) { alert('Death date cannot precede birth date.'); return; }
    if (!fullName.trim()) {
      alert('Please enter member full name.');
      return;
    }

    setIsSaving(true);
    setUploadError(null);

    try {
      let finalPhotoPath = profilePhoto;

      if (selectedFile && standalone) {
        if (selectedFile.size > 1024 * 1024) throw new Error('Please choose a photo smaller than 1 MB for device storage.');
        if (!['image/jpeg','image/png','image/webp','image/gif'].includes(selectedFile.type)) throw new Error('Choose JPG, PNG, WEBP or GIF.');
        finalPhotoPath = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error('Photo could not be read.')); reader.readAsDataURL(selectedFile);
        });
      }
      if (selectedFile && userId && !standalone) {
        setUploadProgress(10);
        try {
          const tempId = member?.id || draftId;
          finalPhotoPath = await uploadFamilyPhotoXHR({
            file: selectedFile,
            folder: 'members',
            recordId: tempId,
            userId,
            onProgress: (p) => setUploadProgress(p)
          });
        } catch (err: any) {
          setUploadError(err.message || 'Photo upload failed. You can retry or save without photo.');
          setIsSaving(false);
          return;
        }
      }

      await onSave(
        {
          id: member?.id || draftId,
          full_name: fullName.trim(),
          gender,
          date_of_birth: dob || null,
          date_of_death: isDeceased ? (dod || null) : null,
          ...(!standalone ? {phone: phone.trim() || null} : {}),
          biradari: biradari.trim() || 'Shamsi',
          birthplace: birthplace.trim() || null,
          current_residence: currentResidence.trim() || null,
          location: currentResidence.trim() || null,
          notes: notes.trim() || null,
          profile_photo: finalPhotoPath || null
        },
        {
          fatherId: fatherId || undefined,
          motherId: motherId || undefined,
          spouseId: spouseId || undefined,
          relationshipType: childRelType
        }
      );

      setIsSaving(false);
      onClose();
    } catch (err: any) {
      setIsSaving(false);
      alert('Could not save member:\n' + (err.message || String(err)));
    }
  };

  const otherMembers = allMembers.filter(m => m.id !== member?.id);
  const maleCandidates = otherMembers.filter(m => m.gender === 'male');
  const femaleCandidates = otherMembers.filter(m => m.gender === 'female');

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
          <h2 className="text-lg font-bold text-gray-900">
            {member ? 'Edit Family Member' : 'Add Family Member'}
          </h2>
          <button
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close member form"
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-sm">
          {!member && defaultRelation && <label className="block">Reuse an existing person
            <select aria-label="Reuse existing person" className="w-full border rounded-lg p-2" value={reuseId} onChange={e => setReuseId(e.target.value)}>
              <option value="">Create a new person</option>
              {allMembers.filter(m => m.id !== defaultRelation.targetMember.id).map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
            </select>
          </label>}
          <fieldset disabled={!!reuseId || cloudReadOnly} className="space-y-5">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Full Name *
              </label>
              <input
                type="text"
                aria-label="Full name"
                required={!reuseId}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Mohammad Bilal Shamsi"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Gender *
              </label>
              <select
                aria-label="Gender"
                disabled={defaultRelation?.relationType === 'father' || defaultRelation?.relationType === 'mother'}
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none bg-white text-gray-900"
              >
                <option value="male">Male (مرد)</option>
                <option value="female">Female (عورت)</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Biradari (برادری)
              </label>
              <select
                value={biradari}
                onChange={(e) => setBiradari(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none bg-white text-gray-900"
              >
                {BIRADARI_OPTIONS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none text-gray-900"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-gray-700 uppercase">
                  Life Status
                </label>
                <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDeceased}
                    onChange={(e) => setIsDeceased(e.target.checked)}
                    className="rounded text-emerald-600"
                  />
                  <span>Deceased (انتقال شدہ)</span>
                </label>
              </div>
              {isDeceased ? (
                <input
                  type="date"
                  value={dod}
                  onChange={(e) => setDod(e.target.value)}
                  placeholder="Date of Death"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none text-gray-900"
                />
              ) : (
                <div className="px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-500 text-xs">
                  Living (حیات ہیں)
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Birth City / Country
              </label>
              <input
                type="text"
                aria-label="Birthplace"
                list="city-suggestions"
                value={birthplace}
                onChange={(e) => setBirthplace(e.target.value)}
                placeholder="e.g. Rampur, UP, India"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Current Residence
              </label>
              <input
                type="text"
                aria-label="Current residence"
                list="city-suggestions"
                value={currentResidence}
                onChange={(e) => setCurrentResidence(e.target.value)}
                placeholder="e.g. Delhi, India"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none text-gray-900"
              />
            </div>

            {!standalone && <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Phone / Mobile
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 / +92 / etc."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none text-gray-900"
              />
            </div>}
          </div>

          {/* Photo Section */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
              Profile Photo
            </label>
            <div className="flex items-center gap-4">
              <img
                src={photoPreview || photoFor({ gender })}
                alt=""
                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-xs"
              />
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileChange}
                  className="text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-emerald-700 file:text-white hover:file:bg-emerald-800 cursor-pointer"
                />
                {uploadProgress !== null && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-600 mb-1">Uploading... {uploadProgress}%</div>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}
                {uploadError && (
                  <div className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{uploadError}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <datalist id="city-suggestions">{['Delhi, India', 'Rampur, Uttar Pradesh, India', 'Moradabad, Uttar Pradesh, India', 'Mumbai, Maharashtra, India', 'Karachi, Pakistan', 'London, United Kingdom'].map(city => <option key={city} value={city}/>)}</datalist>
          {/* Direct Relationships */}
          {!defaultRelation && <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/80 space-y-3">
            <div className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider">
              Family Connections
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Father (والد)
                </label>
                <select
                  value={fatherId}
                  onChange={(e) => setFatherId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white outline-none"
                >
                  <option value="">Select Father (or leave blank)</option>
                  {maleCandidates.map(m => (
                    <option key={m.id} value={m.id}>{m.full_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Mother (والدہ)
                </label>
                <select
                  value={motherId}
                  onChange={(e) => setMotherId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white outline-none"
                >
                  <option value="">Select Mother (or leave blank)</option>
                  {femaleCandidates.map(m => (
                    <option key={m.id} value={m.id}>{m.full_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Husband / Wife (شریک حیات)
                </label>
                <select
                  value={spouseId}
                  onChange={(e) => setSpouseId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white outline-none"
                >
                  <option value="">Select Spouse (or leave blank)</option>
                  {otherMembers.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.full_name} ({m.gender})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Parentage Lineage Type
                </label>
                <select
                  value={childRelType}
                  onChange={(e) => setChildRelType(e.target.value as ChildRelationshipType)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white outline-none"
                >
                  <option value="biological">Biological (حقیقی اولاد)</option>
                  <option value="adopted">Adopted (لے پالک / متبنیٰ)</option>
                  <option value="foster">Foster (رضاعی)</option>
                  <option value="step">Step (سوتیلا)</option>
                </select>
              </div>
            </div>
          </div>

          }
          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Notes / Family History
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add occupation, achievements, notable stories, or memories..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none text-gray-900"
            />
          </div>

          </fieldset>
          {!member && !reuseId && allMembers.some(m => m.full_name.trim().toLowerCase() === fullName.trim().toLowerCase()) && <label className="block bg-amber-50 p-3"><input type="checkbox" checked={allowDuplicate} onChange={e => setAllowDuplicate(e.target.checked)} /> This is a different person with the same name.</label>}
          {defaultRelation && <p className="text-emerald-800">Adding {defaultRelation.relationType} of {defaultRelation.targetMember.full_name}{defaultRelation.union ? ' in the selected marriage branch.' : '.'}</p>}
          {/* Actions */}
          <div className="pt-3 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || cloudReadOnly}
              className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              {isSaving && <RefreshCw className="w-4 h-4 animate-spin" />}
              <span>{isSaving ? 'Saving...' : member ? 'Save Changes' : 'Save Member'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
