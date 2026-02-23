export interface NodeData extends Record<string, unknown> {
  label: string;
  type: 'input-svg' | 'text-prompt' | 'ai-generation';
  svgContent?: string;
  prompt?: string;
  generatedSvg?: string;
  isLoading?: boolean;
}

export interface CustomNodeProps {
  id: string;
  data: NodeData;
}
