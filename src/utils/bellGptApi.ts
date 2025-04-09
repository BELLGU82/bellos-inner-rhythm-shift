
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
  // Check if we have an existing session ID
  const existingId = localStorage.getItem('bellGPT-session-id');
  if (existingId) return existingId;
  
  // Create and store new session ID
  const newId = `bell-${Math.random().toString(36).substring(2, 9)}`;
  localStorage.setItem('bellGPT-session-id', newId);
  return newId;
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

// Process BellGPT response for actions
export const processBellGptAction = (response: string) => {
  // Check if response contains action commands
  if (response.includes("[CREATE_TASK]")) {
    // Extract task details and return action object
    const taskMatch = response.match(/\[CREATE_TASK\](.*?)\[\/CREATE_TASK\]/s);
    if (taskMatch && taskMatch[1]) {
      return {
        action: 'CREATE_TASK',
        data: taskMatch[1].trim()
      };
    }
  }
  
  if (response.includes("[ADD_EVENT]")) {
    // Extract event details and return action object
    const eventMatch = response.match(/\[ADD_EVENT\](.*?)\[\/ADD_EVENT\]/s);
    if (eventMatch && eventMatch[1]) {
      return {
        action: 'ADD_EVENT',
        data: eventMatch[1].trim()
      };
    }
  }
  
  if (response.includes("[SAVE_INSIGHT]")) {
    // Extract insight details and return action object
    const insightMatch = response.match(/\[SAVE_INSIGHT\](.*?)\[\/SAVE_INSIGHT\]/s);
    if (insightMatch && insightMatch[1]) {
      return {
        action: 'SAVE_INSIGHT',
        data: insightMatch[1].trim()
      };
    }
  }
  
  // No action found
  return null;
};
