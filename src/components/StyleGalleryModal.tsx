/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TreeStyleId } from '../types/family';
import { TREE_STYLES } from './tree-styles/styleRegistry';
import { X, CheckCircle, Sparkles, LayoutGrid } from 'lucide-react';

interface StyleGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStyleId: TreeStyleId;
  onSelectStyle: (styleId: TreeStyleId) => void;
}

export const StyleGalleryModal: React.FC<StyleGalleryModalProps> = ({
  isOpen,
  onClose,
  currentStyleId,
  onSelectStyle,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div>
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">Tree Style Gallery</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose from 10+ genuinely distinct architectural, organic, and artistic genealogy presentations
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gallery Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TREE_STYLES.map((style) => {
            const isSelected = currentStyleId === style.id;

            return (
              <div
                key={style.id}
                onClick={() => {
                  onSelectStyle(style.id);
                  onClose();
                }}
                className={`group relative flex flex-col justify-between p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/40 shadow-md ring-2 ring-indigo-100'
                    : 'border-slate-200 bg-white hover:border-slate-400 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded text-white"
                      style={{ backgroundColor: style.accentColor }}
                    >
                      {style.badgeText}
                    </span>

                    {isSelected && (
                      <span className="flex items-center gap-1 text-xs font-bold text-indigo-600">
                        <CheckCircle className="w-4 h-4 fill-indigo-600 text-white" />
                        Active
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {style.name}
                  </h3>

                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {style.shortDesc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="truncate pr-2 italic">{style.visualTheme}</span>
                  <span className="font-semibold text-indigo-600 shrink-0 group-hover:translate-x-0.5 transition-transform">
                    {isSelected ? 'Applied' : 'Apply →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>All 13 styles share the exact same underlying family records and relationships</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-medium text-xs rounded-lg hover:bg-slate-800 transition-colors"
          >
            Close Gallery
          </button>
        </div>
      </div>
    </div>
  );
};
