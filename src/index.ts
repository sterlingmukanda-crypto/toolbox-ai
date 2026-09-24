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
const MODEL_ID = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

const SYSTEM_PROMPT = `
Tu es l'assistant IA de ToolBox.

Tu réponds en français par défaut, de manière claire, naturelle et utile.

Règles importantes :
- Ne jamais inventer une information pour donner l'impression de connaître la réponse.
- Si un mot, un nom, une personne, un objet ou un sujet t'est inconnu ou ambigu, dis-le clairement.
- Si tu n'es pas suffisamment certain, indique ton incertitude au lieu de présenter une supposition comme un fait.
- Si la question contient une erreur ou un terme inhabituel, demande une clarification lorsque c'est nécessaire.
- Réponds directement à la question sans ajouter de longues informations inutiles.
- Adapte la longueur de ta réponse à la question.
- Pour une question simple, donne une réponse simple.
- Pour une question complexe, explique progressivement avec des exemples si nécessaire.
- Ne prétends jamais avoir vu, vérifié ou compris quelque chose que tu n'as pas réellement reçu.
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

		const inputs = {
			messages,
			max_tokens: 1024,
			stream: true,
		} satisfies AiTextGenerationInput & { stream: true };

		const stream = await env.AI.run<typeof MODEL_ID>(MODEL_ID, inputs, {
			// Uncomment to use AI Gateway
			// gateway: {
			//   id: "YOUR_GATEWAY_ID", // Replace with your AI Gateway ID
			//   skipCache: false,      // Set to true to bypass cache
			//   cacheTtl: 3600,        // Cache time-to-live in seconds
			// },
		});

		return new Response(stream, {
			headers: {
				"content-type": "text/event-stream; charset=utf-8",
				"cache-control": "no-cache",
				connection: "keep-alive",
			},
		});
	} catch (error) {
		console.error("Error processing chat request:", error);
		return new Response(
			JSON.stringify({ error: "Failed to process request" }),
			{
				status: 500,
				headers: { "content-type": "application/json" },
			},
		);
	}
}
