import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

export async function generateAnimatedSvg(svgContent: string, prompt: string) {
  const hasGatewayKey = Boolean(process.env.AI_GATEWAY_API_KEY);

  const googleModelRaw = process.env.GOOGLE_MODEL || 'models/gemini-3.1-pro-preview';

  const googleCandidatesRaw = [
    googleModelRaw,
    'models/gemini-3.1-pro-preview',
    'models/gemini-2.5-pro',
    'models/gemini-2.5-flash',
    'models/gemini-pro-latest',
    'models/gemini-flash-latest',
  ];

  const googleCandidates = Array.from(
    new Set(
      googleCandidatesRaw
        .filter(Boolean)
        .map((m) => (m.startsWith('models/') ? m.replace(/^models\//, '') : m))
    )
  );

  const gatewayModelName = process.env.AI_MODEL || 'google/gemini-3.1-pro-preview';

  const systemPrompt = `Tu es un expert en animation SVG. Ton rôle est de créer des animations SVG fluides et élégantes basées sur le SVG fourni et les instructions de l'utilisateur.

Règles importantes:
1. Conserve la structure et le design original du SVG
2. Ajoute uniquement des animations pertinentes et subtiles
3. Utilise les éléments <animate>, <animateTransform>, ou <animateMotion>
4. Assure-toi que les animations sont fluides et non distrayantes
5. Retourne UNIQUEMENT le code SVG complet et valide
6. N'inclus aucun texte explicatif, seulement le code SVG

Le SVG fourni:
${svgContent}

L'instruction d'animation:
${prompt}`;

  const shouldFallback = (message: string) => {
    const lowered = message.toLowerCase();
    return (
      lowered.includes('quota') ||
      lowered.includes('resource_exhausted') ||
      lowered.includes('rate limit') ||
      lowered.includes('retry in') ||
      lowered.includes('429')
    );
  };

  if (hasGatewayKey) {
    try {
      const { text } = await generateText({
        model: gatewayModelName,
        prompt: systemPrompt,
        temperature: 0.7,
      });

      return { svg: text.trim(), model: gatewayModelName };
    } catch (error) {
      console.error(`Error generating animated SVG with model ${gatewayModelName}:`, error);
      const message = error instanceof Error ? error.message : 'Unknown AI error';
      throw new Error(`Failed to generate animated SVG: ${message}`);
    }
  }

  let lastError: unknown;
  let lastModel = googleModelRaw;

  for (const candidate of googleCandidates) {
    lastModel = candidate;
    try {
      const { text } = await generateText({
        model: google(candidate),
        prompt: systemPrompt,
        temperature: 0.7,
      });

      return { svg: text.trim(), model: `models/${candidate}` };
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Error generating animated SVG with model models/${candidate}:`, error);
      if (!shouldFallback(message)) {
        break;
      }
    }
  }

  const finalMessage = lastError instanceof Error ? lastError.message : 'Unknown AI error';
  throw new Error(`Failed to generate animated SVG: ${finalMessage}`);
}
