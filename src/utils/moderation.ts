
interface ModerationResult {
  isSafe: boolean;
  reason?: string;
}

export const moderateContent = async (text: string): Promise<ModerationResult> => {
  try {
    const response = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('OPENAI_API_KEY')}`
      },
      body: JSON.stringify({ input: text })
    });

    const data = await response.json();

    if (data.results && data.results[0]) {
      const result = data.results[0];
      const isSafe = !result.flagged;
      
      // Get the specific category that was flagged
      const categories = Object.entries(result.categories)
        .filter(([_, value]) => value)
        .map(([key]) => key);

      return {
        isSafe,
        reason: isSafe ? undefined : `Content flagged for: ${categories.join(', ')}`
      };
    }

    return { isSafe: true };
  } catch (error) {
    console.error('Moderation error:', error);
    return { isSafe: true }; // Fail open for now
  }
};
