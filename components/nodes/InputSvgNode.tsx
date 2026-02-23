'use client';

import React, { useState, useRef } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Upload, FileImage, Trash2 } from 'lucide-react';
import { CustomNodeProps } from '@/types/nodes';

export default function InputSvgNode({ id, data }: CustomNodeProps) {
  const [svgContent, setSvgContent] = useState(data.svgContent || '');
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'generate'>('upload');
  const [pastedSvg, setPastedSvg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setSvgContent(content);
        if (window.updateNodeData) {
          window.updateNodeData(id, { svgContent: content });
        }
      };
      reader.readAsText(file);
    }
  };

  const handlePaste = () => {
    if (pastedSvg.trim()) {
      setSvgContent(pastedSvg);
      if (window.updateNodeData) {
        window.updateNodeData(id, { svgContent: pastedSvg });
      }
      setPastedSvg('');
    }
  };

  const handleClear = () => {
    setSvgContent('');
    setPastedSvg('');
    if (window.updateNodeData) {
      window.updateNodeData(id, { svgContent: '' });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setSvgContent(content);
        if (window.updateNodeData) {
          window.updateNodeData(id, { svgContent: content });
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div 
      // Remplacement de min-w-[260px] par w-[320px] pour une largeur fixe et stricte
      className="node-shell bg-[#141414]/90 border border-white/10 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.55)] w-[320px] transition-all duration-200"
      data-type="input-svg"
    >
      <Handle type="source" position={Position.Right} />
      
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileImage className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold text-gray-100">SVG Source</h3>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-600 mb-4">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              activeTab === 'upload' 
                ? 'text-blue-400 border-b-2 border-blue-400' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Upload
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              activeTab === 'paste' 
                ? 'text-blue-400 border-b-2 border-blue-400' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Paste
          </button>
          <button
            onClick={() => setActiveTab('generate')}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              activeTab === 'generate' 
                ? 'text-blue-400 border-b-2 border-blue-400' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Generate
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-4">
          {activeTab === 'upload' && (
            <div
              className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                isDragging ? 'border-blue-500 bg-blue-900/20' : 'border-gray-600 hover:border-gray-500'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {svgContent ? (
                <div className="space-y-3">
                  {/* Container SVG strict : il force le SVG à faire 100% de la div sans jamais déborder */}
                  <div className="svg-viewport border border-white/10 rounded-lg bg-[#0a0a0c] overflow-hidden h-[140px] flex items-center justify-center p-2">
                    <div 
                      className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:object-contain pointer-events-none" 
                      dangerouslySetInnerHTML={{ __html: svgContent }} 
                    />
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    Changer de fichier
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="w-10 h-10 text-gray-500 mx-auto" />
                  <div>
                    <p className="text-gray-400 mb-2 text-sm">Glissez le SVG ici</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-600 hover:text-white transition-colors text-sm font-medium"
                    >
                      Parcourir
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'paste' && (
            <div className="space-y-3">
              <textarea
                value={pastedSvg}
                onChange={(e) => setPastedSvg(e.target.value)}
                placeholder="Collez votre code SVG ici..."
                className="w-full h-32 p-3 bg-[#0a0a0c] border border-white/10 text-gray-100 rounded-lg resize-none focus:ring-1 focus:ring-blue-500 outline-none placeholder-gray-500 font-mono text-xs"
              />
              <button
                onClick={handlePaste}
                disabled={!pastedSvg.trim()}
                className="w-full px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-600 hover:text-white disabled:opacity-50 transition-colors text-sm font-medium"
              >
                Valider le SVG
              </button>
            </div>
          )}

          {activeTab === 'generate' && (
            <div className="space-y-3">
              <textarea
                placeholder="Décrivez le SVG à générer (Bientôt disponible)..."
                disabled
                className="w-full h-32 p-3 bg-[#0a0a0c] border border-white/10 text-gray-100 rounded-lg resize-none placeholder-gray-600 text-sm opacity-50 cursor-not-allowed"
              />
            </div>
          )}

          {/* SVG Code Preview */}
          {svgContent && activeTab !== 'upload' && (
            <div className="bg-[#0a0a0c] border border-white/10 rounded-lg p-3 max-h-24 overflow-y-auto">
              <pre className="text-xs text-gray-400 font-mono">
                {svgContent.substring(0, 150)}{svgContent.length > 150 ? '...' : ''}
              </pre>
            </div>
          )}

          {/* Clear Button */}
          {(svgContent || pastedSvg) && (
            <button
              onClick={handleClear}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Effacer
            </button>
          )}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".svg"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </div>
  );
}