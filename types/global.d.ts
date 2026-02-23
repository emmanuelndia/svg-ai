export {};

declare global {
  interface Window {
    updateNodeData?: (id: string, data: any) => void;
    triggerGeneration?: (promptNodeId?: string) => void;
    triggerRegeneration?: (nodeId: string) => void;
  }
}
