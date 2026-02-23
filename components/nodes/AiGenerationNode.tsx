'use client';

import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Sparkles, Download, RefreshCw, Maximize2, X, Move, Scan } from 'lucide-react';
import { saveAs } from 'file-saver';
import { CustomNodeProps } from '@/types/nodes';

export default function AiGenerationNode({ id, data }: CustomNodeProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<'fit' | 'scroll'>('fit');
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleDownload = () => {
    if (data.generatedSvg) {
      const blob = new Blob([data.generatedSvg], { type: 'image/svg+xml' });
      saveAs(blob, 'animated-svg.svg');
    }
  };

  const handleRegenerate = () => {
    setIsRegenerating(true);
    // Trigger regeneration logic
    if (window.triggerRegeneration) {
      window.triggerRegeneration(id);
    }
    setTimeout(() => setIsRegenerating(false), 2000);
  };

  const handleExpand = () => {
    setIsPreviewOpen(true);
    setPreviewMode('fit');
  };

  return (
    <>
      <div 
        className="node-shell bg-[#141414]/90 border border-white/10 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.55)] transition-all duration-200 min-w-[280px]"
        data-type="ai-generation"
      >
      <Handle type="target" position={Position.Left} />
      
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold text-gray-100">AI Generation</h3>
          </div>
          <button
            onClick={handleExpand}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            title="Agrandir l'aperçu"
          >
            <Maximize2 className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        
        <div className="flex-1 flex flex-col">
          {data.isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <div className="animate-spin">
                <Sparkles className="w-8 h-8 text-purple-400" />
              </div>
              <p className="text-gray-400">Génération en cours...</p>
            </div>
          ) : data.generatedSvg ? (
            <div className="flex-1 flex flex-col gap-3">
              <div
                className="ai-svg-viewport border border-white/10 rounded-lg bg-black/20 overflow-auto flex-1 h-[160px]"
              >
                <div
                  className="ai-svg-content w-full h-full"
                  dangerouslySetInnerHTML={{ __html: data.generatedSvg }}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleDownload}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Télécharger
                </button>
                <button
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-600 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                  {isRegenerating ? 'Régénération...' : 'Régénérer'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p>En attente de génération...</p>
              <p className="text-sm text-gray-400 mt-1">
                Connectez un SVG et un prompt pour commencer
              </p>
            </div>
          )}
        </div>
      </div>
      </div>

      {isPreviewOpen ? (
        <div
          className="fixed inset-0 z-50 bg-[#050506]"
          onMouseDown={() => setIsPreviewOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-[#050506] overflow-hidden"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="absolute right-3 top-3 flex items-center gap-2 z-10">
              <button
                onClick={() => setPreviewMode('fit')}
                className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors ${
                  previewMode === 'fit'
                    ? 'bg-white/10 border-white/20 text-gray-100'
                    : 'bg-black/30 hover:bg-black/45 border-white/10 text-gray-200'
                }`}
                title="Adapter à l'écran"
              >
                <Scan className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewMode('scroll')}
                className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors ${
                  previewMode === 'scroll'
                    ? 'bg-white/10 border-white/20 text-gray-100'
                    : 'bg-black/30 hover:bg-black/45 border-white/10 text-gray-200'
                }`}
                title="Mode défilement"
              >
                <Move className="w-4 h-4" />
              </button>
              <button
                onClick={handleDownload}
                disabled={!data.generatedSvg}
                className="w-9 h-9 rounded-lg bg-black/30 hover:bg-black/45 border border-white/10 flex items-center justify-center text-gray-200 disabled:opacity-40 disabled:hover:bg-black/30 transition-colors"
                title="Télécharger"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="w-9 h-9 rounded-lg bg-black/30 hover:bg-black/45 border border-white/10 flex items-center justify-center text-gray-200 disabled:opacity-40 disabled:hover:bg-black/30 transition-colors"
                title="Régénérer"
              >
                <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
              </button>
              <button
                className="w-9 h-9 rounded-lg bg-black/30 hover:bg-black/45 border border-white/10 flex items-center justify-center text-gray-200 transition-colors"
                onClick={() => setIsPreviewOpen(false)}
                title="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="h-full w-full">
              <div
                className={`ai-preview-modal ai-preview-${previewMode} ai-svg-viewport w-full h-full bg-black ${
                  previewMode === 'scroll' ? 'overflow-auto' : 'overflow-hidden'
                }`}
              >
                {data.generatedSvg ? (
                  <div
                    className="ai-svg-content w-full h-full"
                    dangerouslySetInnerHTML={{ __html: data.generatedSvg }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-gray-400">
                    Aucun SVG généré.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
