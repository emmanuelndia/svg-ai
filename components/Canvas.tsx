'use client';

import React, { useState, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Panel,
  SelectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import InputSvgNode from './nodes/InputSvgNode';
import TextNode from './nodes/TextNode';
import AiGenerationNode from './nodes/AiGenerationNode';
import { NodeData } from '@/types/nodes';
import { FileImage, MessageSquare, Sparkles } from 'lucide-react';

const nodeTypes = {
  'input-svg': InputSvgNode,
  'text-prompt': TextNode,
  'ai-generation': AiGenerationNode,
};

const initialNodes: Node<NodeData>[] = [];

const initialEdges: Edge[] = [];

export default function Canvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes as any);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nextNodeId, setNextNodeId] = useState(1);
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(true);
  const [toast, setToast] = useState<{ message: string; variant: 'error' | 'info' } | null>(null);
  const toastTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = useCallback((message: string, variant: 'error' | 'info' = 'info') => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({ message, variant });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 3500);
  }, []);

  const addNode = useCallback((type: 'input-svg' | 'text-prompt' | 'ai-generation') => {
    const newNode: Node<NodeData> = {
      id: `node-${nextNodeId}`,
      type,
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 300 + 100 
      },
      data: { 
        label: type === 'input-svg' ? 'Input SVG' : type === 'text-prompt' ? 'Text Prompt' : 'AI Generation',
        type 
      },
    };
    
    setNodes((nds) => [...nds, newNode]);
    setNextNodeId((prev) => prev + 1);
  }, [nextNodeId, setNodes]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const updateNodeData = useCallback((nodeId: string, newData: Partial<NodeData>) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...newData } }
          : node
      )
    );
  }, [setNodes]);

  const getNode = useCallback(
    (nodeId: string) => nodes.find((n) => n.id === nodeId),
    [nodes]
  );

  const getUpstreamSource = useCallback(
    (targetId: string) => edges.find((e) => e.target === targetId)?.source,
    [edges]
  );

  const runGeneration = useCallback(
    async (svgNodeId: string, promptNodeId: string, aiNodeId: string) => {
      const svgNode = getNode(svgNodeId);
      const promptNode = getNode(promptNodeId);
      const aiNode = getNode(aiNodeId);

      const svgContent = svgNode?.data.svgContent;
      const prompt = promptNode?.data.prompt;

      if (!svgContent || !prompt || !aiNode) {
        notify('Connectez un SVG Source, un Text Prompt, et un AI Generation avant de générer.', 'error');
        return;
      }
      updateNodeData(aiNodeId, { isLoading: true });

      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ svgContent: String(svgContent), prompt: String(prompt) }),
        });

        const json = (await res.json()) as {
          svg?: string;
          error?: string;
          retryAfterSeconds?: number;
          model?: string;
          mode?: string;
        };
        if (!res.ok || !json.svg) {
          if (res.status === 429) {
            const retry = json.retryAfterSeconds
              ? ` Réessayez dans ~${json.retryAfterSeconds}s.`
              : '';
            throw new Error((json.error || 'Quota exceeded.') + retry);
          }
          throw new Error(json.error || 'Generation failed');
        }

        updateNodeData(aiNodeId, {
          generatedSvg: json.svg,
          isLoading: false,
        });
      } catch (error) {
        console.error('Generation failed:', error);
        updateNodeData(aiNodeId, { isLoading: false });
        notify(error instanceof Error ? error.message : 'Erreur lors de la génération', 'error');
      }
    },
    [getNode, notify, updateNodeData]
  );

  const triggerGeneration = useCallback(
    async (promptNodeId?: string) => {
      const promptNode = promptNodeId
        ? getNode(promptNodeId)
        : nodes.find((n) => n.type === 'text-prompt');
      if (!promptNode) {
        notify('Ajoutez un noeud Text Prompt.', 'error');
        return;
      }

      const svgNodeId = getUpstreamSource(promptNode.id);
      if (!svgNodeId) {
        notify('Connectez un SVG Source au Text Prompt.', 'error');
        return;
      }

      const aiNodeId = edges.find((e) => e.source === promptNode.id)?.target;
      if (!aiNodeId) {
        notify('Connectez le Text Prompt à un noeud AI Generation.', 'error');
        return;
      }

      await runGeneration(svgNodeId, promptNode.id, aiNodeId);
    },
    [edges, getNode, getUpstreamSource, nodes, notify, runGeneration]
  );

  const triggerRegeneration = useCallback(
    async (aiNodeId: string) => {
      const promptNodeId = getUpstreamSource(aiNodeId);
      if (!promptNodeId) {
        notify('Connectez un Text Prompt au noeud AI Generation.', 'error');
        return;
      }

      const svgNodeId = getUpstreamSource(promptNodeId);
      if (!svgNodeId) {
        notify('Connectez un SVG Source au Text Prompt.', 'error');
        return;
      }

      await runGeneration(svgNodeId, promptNodeId, aiNodeId);
    },
    [getUpstreamSource, notify, runGeneration]
  );

  // Set up global window functions for node communication
  React.useEffect(() => {
    window.updateNodeData = updateNodeData;
    window.triggerGeneration = triggerGeneration;
    window.triggerRegeneration = triggerRegeneration;

    return () => {
      delete window.updateNodeData;
      delete window.triggerGeneration;
      delete window.triggerRegeneration;
    };
  }, [updateNodeData, triggerGeneration, triggerRegeneration]);

  return (
    <div className="w-full h-screen bg-gray-900">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.05}
        maxZoom={2}
        attributionPosition="bottom-left"
        selectionMode={SelectionMode.Partial}
        selectNodesOnDrag={false}
        className="bg-gray-900"
        style={{ background: '#1a1a1a' }}
        onPaneClick={(e) => {
          if ((e as unknown as MouseEvent).altKey) {
            setIsAddPanelOpen(true);
          }
        }}
        onPaneContextMenu={(e) => {
          e.preventDefault();
          setIsAddPanelOpen((v) => !v);
        }}
      >
        <Background
          color="#2a2a2a"
          gap={28}
          size={1}
          variant={BackgroundVariant.Dots}
        />
        <Controls />

        {toast ? (
          <Panel position="top-center" className="pointer-events-none mt-3">
            <div
              className={`px-3 py-2 rounded-lg border shadow-[0_12px_40px_rgba(0,0,0,0.65)] backdrop-blur-md text-sm max-w-[520px] ${
                toast.variant === 'error'
                  ? 'bg-red-950/60 border-red-500/30 text-red-100'
                  : 'bg-[#141414]/80 border-white/10 text-gray-100'
              }`}
            >
              {toast.message}
            </div>
          </Panel>
        ) : null}
        
        {isAddPanelOpen ? (
          <Panel
            position="top-left"
            className="bg-[#141414]/90 border border-white/10 rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.65)] backdrop-blur-md overflow-hidden"
          >
            <div className="px-4 pt-3 pb-2 flex items-center justify-between gap-3">
              <div className="text-[11px] tracking-widest text-gray-500 font-semibold">
                ADD BLOCK
              </div>
              <button
                onClick={() => setIsAddPanelOpen(false)}
                className="text-[11px] text-gray-500 hover:text-gray-300"
              >
                Hide
              </button>
            </div>

            <div className="px-2 pb-2">
              <button
                onClick={() => addNode('input-svg')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-200 hover:bg-white/5 transition-colors"
              >
                <FileImage className="w-4 h-4 text-blue-400" />
                <span className="flex-1 text-left">SVG Source</span>
              </button>

              <button
                onClick={() => addNode('text-prompt')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-200 hover:bg-white/5 transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-green-400" />
                <span className="flex-1 text-left">Animation Prompt</span>
              </button>

              <button
                onClick={() => addNode('ai-generation')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-200 hover:bg-white/5 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="flex-1 text-left">AI Generation</span>
              </button>
            </div>
          </Panel>
        ) : (
          <Panel
            position="top-left"
            className="bg-[#141414]/85 border border-white/10 rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.65)] backdrop-blur-md overflow-hidden"
          >
            <div className="p-1 flex flex-col gap-1">
              <button
                onClick={() => setIsAddPanelOpen(true)}
                className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors"
                title="Show Add Block"
              >
                <FileImage className="w-4 h-4 text-gray-300" />
              </button>

              <button
                onClick={() => addNode('input-svg')}
                className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors"
                title="Add SVG Source"
              >
                <FileImage className="w-4 h-4 text-blue-400" />
              </button>

              <button
                onClick={() => addNode('text-prompt')}
                className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors"
                title="Add Animation Prompt"
              >
                <MessageSquare className="w-4 h-4 text-green-400" />
              </button>

              <button
                onClick={() => addNode('ai-generation')}
                className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors"
                title="Add AI Generation"
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
              </button>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}
