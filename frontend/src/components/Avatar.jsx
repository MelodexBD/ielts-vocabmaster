import { useState } from 'react';

// Round account picture: the Google photo when there is one, otherwise the name's initials.
export default function Avatar({ profile, className = '' }) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const initials = (profile?.name || '').split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase() || 'U';
  const showPhoto = profile?.photoUrl && !photoFailed;
  return (
    <div className={`flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-tr from-forest-700 to-forest-500 font-extrabold text-white ${className}`}>
      {showPhoto
        ? <img src={profile.photoUrl} alt={profile.name} referrerPolicy="no-referrer" className="h-full w-full rounded-full object-cover" onError={() => setPhotoFailed(true)} />
        : initials}
    </div>
  );
}
