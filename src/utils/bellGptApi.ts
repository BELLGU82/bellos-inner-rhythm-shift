
// Type for the webhook request payload
export interface BellGptRequest {
  chatInput: string;
  sessionId: string;
}

// Type for the webhook response
export interface BellGptResponse {
  response: string;
  suggestions?: string[];
  error?: string;
}

// Function to generate a session ID
export const generateSessionId = (): string => {
  return `bell-${Math.random().toString(36).substring(2, 9)}`;
};

// Function to make API call to the BellGPT webhook
export const sendToBellGpt = async (input: string, sessionId: string): Promise<BellGptResponse> => {
  try {
    const response = await fetch('https://primary-production-6fe5.up.railway.app/webhook/bo2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatInput: input,
        sessionId: sessionId
      } as BellGptRequest),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling BellGPT webhook:', error);
    return {
      response: "I'm sorry, I couldn't process that request. Please try again later.",
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
