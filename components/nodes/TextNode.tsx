'use client';

import React, { useEffect, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { MessageSquare, Send } from 'lucide-react';
import { CustomNodeProps } from '@/types/nodes';

export default function TextNode({ id, data }: CustomNodeProps) {
  const [prompt, setPrompt] = useState(data.prompt || '');

  useEffect(() => {
    setPrompt(data.prompt || '');
  }, [data.prompt]);

  const handleGenerate = () => {
    if (prompt.trim()) {
      // Update node data
      if (window.updateNodeData) {
        window.updateNodeData(id, { prompt });
      }
      // Trigger generation logic
      if (window.triggerGeneration) {
        window.triggerGeneration(id);
      }
    }
  };

  return (
    <div 
      className="node-shell bg-[#141414]/90 border border-white/10 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.55)] min-w-[260px] transition-all duration-200"
      data-type="text-prompt"
    >
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      
      <div className="p-3">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-5 h-5 text-green-400" />
          <h3 className="font-semibold text-gray-100">Text Prompt</h3>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Instruction d'animation
            </label>
            <textarea
              value={prompt}
              onChange={(e) => {
                const next = e.target.value;
                setPrompt(next);
                if (window.updateNodeData) {
                  window.updateNodeData(id, { prompt: next });
                }
              }}
              placeholder="Décrivez l'animation que vous voulez générer..."
              className="w-full h-20 p-2.5 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400"
            />
          </div>
          
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
            Générer
          </button>
        </div>
      </div>
    </div>
  );
}
