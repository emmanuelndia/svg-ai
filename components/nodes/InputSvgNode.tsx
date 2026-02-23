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
      className="node-shell bg-[#141414]/90 border border-white/10 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.55)] min-w-[260px] transition-all duration-200"
      data-type="input-svg"
    >
      <Handle type="source" position={Position.Right} />
      
      <div className="p-3">
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
        <div className="space-y-3">
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
                  <div className="svg-viewport border border-white/10 rounded-md bg-black/20 overflow-hidden h-[140px]">
                    <div className="svg-content w-full h-full" dangerouslySetInnerHTML={{ __html: svgContent }} />
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    Change file
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="w-12 h-12 text-gray-500 mx-auto" />
                  <div>
                    <p className="text-gray-400 mb-2">Drag SVG here</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Browse
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
                placeholder="Paste your SVG code here..."
                className="w-full h-32 p-3 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 font-mono text-sm"
              />
              <button
                onClick={handlePaste}
                disabled={!pastedSvg.trim()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                Paste SVG
              </button>
            </div>
          )}

          {activeTab === 'generate' && (
            <div className="space-y-3">
              <textarea
                placeholder="Describe the SVG you want to generate..."
                className="w-full h-32 p-3 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
              />
              <button
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Generate SVG
              </button>
            </div>
          )}

          {/* SVG Preview */}
          {svgContent && (
            <div className="space-y-3">
              <div className="svg-viewport border border-white/10 rounded-lg bg-black/20 overflow-hidden h-[140px]">
                <div className="svg-content w-full h-full" dangerouslySetInnerHTML={{ __html: svgContent }} />
              </div>
              
              {/* SVG Code Preview */}
              <div className="bg-gray-900 rounded-lg p-3 max-h-24 overflow-y-auto">
                <pre className="text-xs text-gray-400 font-mono">
                  {svgContent.substring(0, 200)}{svgContent.length > 200 ? '...' : ''}
                </pre>
              </div>
            </div>
          )}

          {/* Clear Button */}
          {(svgContent || pastedSvg) && (
            <button
              onClick={handleClear}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear
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
