/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Person } from '../types/family';

interface PersonAvatarProps {
  person: Person;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const PersonAvatar: React.FC<PersonAvatarProps> = ({ person, size = 'md', className = '' }) => {
  const sizeMap = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
  };

  const initials = `${person.firstName[0] || ''}${person.lastName[0] || ''}`.toUpperCase();

  // Dynamic color palette based on gender & generation
  const getGradient = () => {
    if (person.gender === 'female') {
      return person.generation === 1
        ? 'from-amber-600 to-rose-700'
        : person.generation === 2
        ? 'from-rose-500 to-pink-700'
        : 'from-fuchsia-500 to-rose-600';
    }
    return person.generation === 1
      ? 'from-blue-700 to-slate-900'
      : person.generation === 2
      ? 'from-cyan-600 to-indigo-800'
      : 'from-sky-500 to-blue-700';
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full shrink-0 font-medium text-white shadow-sm ring-2 ring-white/80 bg-gradient-to-br ${getGradient()} ${sizeMap[size]} ${className}`}
    >
      <span>{initials}</span>
      {person.relationshipType === 'adopted' && (
        <span
          title="Adopted"
          className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-amber-400 border border-white rounded-full"
        />
      )}
      {person.relationshipType === 'foster' && (
        <span
          title="Foster"
          className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-purple-400 border border-white rounded-full"
        />
      )}
    </div>
  );
};
