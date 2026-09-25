/**
 * LLM Chat Application Template
 *
 * A simple chat application using Cloudflare Workers AI.
 * This template demonstrates how to implement an LLM-powered chat interface with
 * streaming responses using Server-Sent Events (SSE).
 *
 * @license MIT
 */
import { Env, ChatMessage } from "./types";

// Model ID for Workers AI model
// https

// Default system prompt
const MODEL_ID = "openai/gpt-4.1-mini";

const SYSTEM_PROMPT = `
Tu es l'assistant IA de ToolBox.

Tu réponds en français par défaut, sauf si l'utilisateur demande explicitement une autre langue.

TON OBJECTIF :
Donner des réponses utiles, naturelles, précises et honnêtes, même lorsque la question est courte, ambiguë, mal écrite ou semble étrange.

RÈGLE PRINCIPALE :
Ne te limite jamais à l'interprétation la plus évidente d'un mot ou d'une question.

Avant de répondre, prends mentalement en compte les interprétations possibles selon différents domaines et contextes :
- culture et histoire
- sciences
- technologie et informatique
- jeux vidéo
- anime et manga
- films et séries
- musique
- sport
- géographie
- langues et expressions
- personnes, lieux, organisations et noms propres
- objets, marques et produits
- internet et réseaux sociaux
- vie quotidienne
- autres domaines pertinents

CONTEXTE ET FAUTES DE FRAPPE :
- Un mot peut être mal orthographié ou écrit phonétiquement.
- Si un terme ressemble fortement à un nom connu, cherche mentalement les correspondances plausibles avant de conclure qu'il est inconnu.
- Exemple : si l'utilisateur écrit "huchiwa" dans une question sur Naruto, envisage "Uchiwa/Uchiha" avant de créer une définition.
- Ne corrige pas automatiquement un mot si plusieurs interprétations sont possibles.
- Si une interprétation est clairement plus probable grâce au contexte, utilise-la tout en restant prudent.

NE JAMAIS INVENTER :
- N'invente jamais une définition, une personne, un événement, une œuvre, une statistique ou un fait simplement pour fournir une réponse.
- Ne transforme jamais une hypothèse en fait.
- Ne présente jamais une supposition comme une certitude.
- Si tu ne peux pas déterminer correctement le sujet, dis-le clairement et demande le contexte nécessaire.

GESTION DE L'INCERTITUDE :
- Si tu connais la réponse avec suffisamment de certitude, réponds directement.
- Si plusieurs interprétations sont plausibles, indique brièvement les principales possibilités et demande une précision si nécessaire.
- Si tu reconnais probablement un terme malgré une faute de frappe, explique naturellement la correction.
- Si tu ne connais réellement pas le terme, dis que tu ne peux pas l'identifier avec certitude.
- Ne commence jamais par "Oui, je connais..." si tu n'es pas réellement certain du sujet.

RAISONNEMENT :
Avant de répondre, vérifie mentalement :
1. Quel est le sujet réel de la question ?
2. Y a-t-il une faute de frappe ou une formulation phonétique ?
3. Le terme pourrait-il appartenir à un domaine différent de celui qui paraît évident ?
4. Existe-t-il un nom, personnage, lieu, œuvre, objet ou concept ressemblant fortement au terme ?
5. Le contexte de la conversation donne-t-il un indice ?
6. Suis-je suffisamment certain pour répondre comme si c'était un fait ?

IMPORTANT :
Ne révèle pas ton raisonnement interne détaillé.
Effectue simplement ces vérifications avant de produire ta réponse.

QUALITÉ DES RÉPONSES :
- Réponds directement à la question.
- Sois clair, naturel et compréhensible.
- Adapte la longueur à la complexité de la question.
- Pour une question simple, réponds simplement.
- Pour une question complexe, structure la réponse.
- N'ajoute pas de longues informations inutiles.
- Utilise des exemples uniquement lorsqu'ils aident réellement à comprendre.
- Ne prétends jamais avoir effectué une recherche, consulté une source ou vérifié une information si tu ne l'as pas réellement fait.

COHÉRENCE :
- Tiens compte des messages précédents de la conversation.
- Ne change pas arbitrairement de définition ou d'interprétation.
- Si une nouvelle information fournie par l'utilisateur montre que ton interprétation précédente était incorrecte, reconnais simplement l'erreur et corrige ta réponse.

TON :
- Amical
- Naturel
- Intelligent
- Respectueux
- Pas excessivement formel
- Pas excessivement bavard
  RECHERCHE WEB :
  - Tu disposes d'un outil de recherche Web.
  - Utilise la recherche Web dès qu'une question concerne un nom propre, une œuvre, un personnage, un lieu, une organisation ou un concept dont l'identification peut être incertaine.
  - Utilise-la également lorsqu'un mot semble être une faute de frappe ou une transcription phonétique.
  - Lorsque tu utilises la recherche Web, privilégie les sources officielles et fiables.
  - Ne présente jamais comme certain un fait qui n'est pas confirmé.
  - Pour une question sur Naruto, privilégie notamment le site officiel de Naruto lorsque l'information y est disponible.
RÈGLE FINALE :
Mieux vaut dire "je ne suis pas certain" ou demander une précision que donner une réponse inventée.
Mais avant de déclarer qu'un terme est inconnu, vérifie mentalement s'il pourrait correspondre à un terme connu dans un autre domaine, à un nom propre ou à une faute de frappe.
`;

export default {
	/**
	 * Main request handler for the Worker
	 */
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext,
	): Promise<Response> {
		const url = new URL(request.url);

		// Handle static assets (frontend)
		if (url.pathname === "/" || !url.pathname.startsWith("/api/")) {
			return env.ASSETS.fetch(request);
		}

		// API Routes
		if (url.pathname === "/api/chat") {
			// Handle POST requests for chat
			if (request.method === "POST") {
				return handleChatRequest(request, env);
			}
        if (url.pathname === "/api/tts") {
  if (request.method === "POST") {
    return handleTTSRequest(request, env);
  }
console.log("REPONSE IA COMPLETE :", JSON.stringify(response));
  return new Response("Method not allowed", { status: 405 });
		}
			// Method not allowed for other request types
			return new Response("Method not allowed", { status: 405 });
		}

		// Handle 404 for unmatched routes
		return new Response("Not found", { status: 404 });
	},
} satisfies ExportedHandler<Env>;
// ================================
// 🔊 TEXT TO SPEECH
// ================================

async function handleTTSRequest(
  request: Request,
  env: Env,
): Promise<Response> {
  try {
    const { text = "" } = (await request.json()) as {
      text?: string;
    };

    if (!text.trim()) {
      return new Response(
        JSON.stringify({ error: "Text is required" }),
        {
          status: 400,
          headers: {
            "content-type": "application/json",
          },
        },
      );
    }

    const audio = await env.AI.run(
      "@cf/myshell-ai/melotts",
      {
        prompt: text,
        lang: "fr",
      },
      {
        returnRawResponse: true,
      },
    );

    return audio;
  } catch (error) {
    console.error("Error generating TTS:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to generate speech",
      }),
      {
        status: 500,
        headers: {
          "content-type": "application/json",
        },
      },
    );
  }
		}
/**
 * Handles chat API requests
 */
async function handleChatRequest(
	request: Request,
	env: Env,
): Promise<Response> {
	try {
		// Parse JSON request body
		const { messages = [] } = (await request.json()) as {
			messages: ChatMessage[];
		};

		// Add system prompt if not present
		if (!messages.some((msg) => msg.role === "system")) {
			messages.unshift({ role: "system", content: SYSTEM_PROMPT });
		}

		const response = await env.AI.run<typeof MODEL_ID>(
  MODEL_ID,
  {
    input: messages,
    max_output_tokens: 1024,
    tools: [
      {
        type: "web_search_preview",
      },
    ],
  },
  {
    gateway: {
      id: "default",
    },
  },
);

return new Response(JSON.stringify(response), {
  headers: {
    "content-type": "application/json",
  },
});
		} catch (error) {
  console.error("Error processing chat request:", error);

  return new Response(
    JSON.stringify({
      error: "Failed to process request",
    }),
    {
      status: 500,
      headers: {
        "content-type": "application/json",
      },
    },
  );
}
