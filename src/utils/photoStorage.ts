import { PREVIEW_ONLY, PREVIEW_MESSAGE } from './previewMode';
import { SUPABASE_URL, SUPABASE_KEY, supabase } from './supabaseClient';
import { FamilyMember } from '../types/family';

export function photoFor(member: Partial<FamilyMember> | null | undefined): string {
  if (member?.profile_photo) {
    if (/^https?:\/\//i.test(member.profile_photo) || /^data:/i.test(member.profile_photo)) {
      return member.profile_photo;
    }
    try {
      const { data } = supabase.storage.from('family-photos').getPublicUrl(member.profile_photo);
      if (data?.publicUrl) return data.publicUrl;
    } catch {
      // fallback to placeholder
    }
  }

  const isFemale = String(member?.gender || '').toLowerCase() === 'female';
  const emoji = isFemale ? '👩' : '👨';
  const bg = isFemale ? '#fde8ef' : '#e8f2fb';

  return (
    'data:image/svg+xml;charset=UTF-8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
        <rect width="100" height="100" fill="${bg}"/>
        <text x="50" y="60" text-anchor="middle" font-size="44">${emoji}</text>
      </svg>`
    )
  );
}

export async function uploadFamilyPhotoXHR({
  file,
  folder,
  recordId,
  userId,
  onProgress
}: {
  file: File;
  folder: 'profile' | 'members' | 'memories';
  recordId: string;
  userId: string;
  onProgress?: (percent: number) => void;
}): Promise<string> {
  if (PREVIEW_ONLY) throw new Error(PREVIEW_MESSAGE);
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowed.includes(file.type)) {
    throw new Error('Only JPG, PNG, WEBP or GIF images are allowed.');
  }

  const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
  if (sessionErr || !sessionData.session?.access_token) {
    throw new Error('Your login session has expired. Please login again.');
  }
  const token = sessionData.session.access_token;

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${userId}/${folder}/${recordId}.${ext}`;
  const url = `${SUPABASE_URL}/storage/v1/object/family-photos/${path}`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.setRequestHeader('apikey', SUPABASE_KEY);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.setRequestHeader('x-upsert', 'true');

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(path);
      } else {
        let msg = 'Photo upload failed.';
        try {
          const r = JSON.parse(xhr.responseText);
          msg = r.message || r.error || msg;
        } catch {
          // ignore
        }
        reject(new Error(msg));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Network error while uploading photo.')));
    xhr.addEventListener('abort', () => reject(new Error('Photo upload cancelled.')));
    xhr.timeout = 300000;
    xhr.addEventListener('timeout', () => reject(new Error('Photo upload timed out.')));

    xhr.send(file);
  });
}
