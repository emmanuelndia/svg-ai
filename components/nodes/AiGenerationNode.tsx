'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Handle, Position } from '@xyflow/react';
import { Sparkles, Download, RefreshCw, Maximize2, X } from 'lucide-react';
import { saveAs } from 'file-saver';
import { CustomNodeProps } from '@/types/nodes';

export default function AiGenerationNode({ id, data }: CustomNodeProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleDownload = () => {
    if (data.generatedSvg) {
      const blob = new Blob([data.generatedSvg], { type: 'image/svg+xml' });
      saveAs(blob, 'animated-svg.svg');
    }
  };

  const handleRegenerate = () => {
    setIsRegenerating(true);
    if (window.triggerRegeneration) {
      window.triggerRegeneration(id);
    }
    setTimeout(() => setIsRegenerating(false), 2000);
  };

  // Modale plein écran (sans mode défilement)
  const ModalContent = isMounted && isPreviewOpen ? (
    createPortal(
      <div
        className="fixed inset-0 z-[9999] bg-[#050506]/95 backdrop-blur-md flex items-center justify-center"
        onMouseDown={() => setIsPreviewOpen(false)}
        role="dialog"
      >
        <div
          className="absolute inset-4 md:inset-10 bg-[#121214] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#1a1a1c]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h3 className="font-semibold text-gray-100">Aperçu de la Génération</h3>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                disabled={!data.generatedSvg}
                className="flex items-center gap-2 px-4 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-colors text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Télécharger</span>
              </button>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="w-9 h-9 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 flex items-center justify-center transition-colors ml-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 w-full bg-[#0a0a0c] p-6 flex items-center justify-center overflow-hidden">
            {data.generatedSvg ? (
              <div
                className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:object-contain"
                dangerouslySetInnerHTML={{ __html: data.generatedSvg }}
              />
            ) : (
              <div className="text-center text-gray-500">Aucun SVG généré pour l'instant.</div>
            )}
          </div>
        </div>
      </div>,
      document.body
    )
  ) : null;

  return (
    <>
      <div 
        // Largeur fixe w-[320px] pour correspondre parfaitement aux autres nœuds
        className="node-shell bg-[#141414]/90 border border-white/10 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.55)] w-[320px] transition-all duration-200"
        data-type="ai-generation"
      >
        <Handle type="target" position={Position.Left} />
        
        <div className="p-4 flex flex-col h-full">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h3 className="font-semibold text-gray-100 text-sm">AI Generation</h3>
            </div>
            {data.generatedSvg && !data.isLoading && (
              <button
                onClick={() => setIsPreviewOpen(true)}
                className="flex items-center justify-center gap-1.5 px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors group text-xs text-gray-300"
              >
                <Maximize2 className="w-3.5 h-3.5 text-gray-400 group-hover:text-white" />
                Agrandir
              </button>
            )}
          </div>
          
          <div className="flex-1 flex flex-col">
            {data.isLoading ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-3 bg-black/20 rounded-lg border border-white/5">
                <div className="animate-spin">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                </div>
                <p className="text-xs text-gray-400 font-medium">Génération en cours...</p>
              </div>
            ) : data.generatedSvg ? (
              <div className="flex-1 flex flex-col gap-4">
                <div 
                  className="border border-white/10 rounded-lg bg-[#0a0a0c] overflow-hidden h-[140px] relative group flex items-center justify-center p-2 cursor-pointer hover:border-purple-500/50 transition-colors" 
                  onClick={() => setIsPreviewOpen(true)}
                >
                  <div
                    className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:object-contain pointer-events-none"
                    dangerouslySetInnerHTML={{ __html: data.generatedSvg }}
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleDownload}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-600 hover:text-white transition-colors text-sm font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-lg hover:bg-purple-600 hover:text-white disabled:opacity-50 transition-colors text-sm font-medium"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                    {isRegenerating ? '...' : 'Replay'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500 bg-black/20 rounded-lg border border-white/5 border-dashed">
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-gray-600/50" />
                <p className="text-xs">Aucun rendu</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {ModalContent}
    </>
  );
}