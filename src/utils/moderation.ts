
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

interface ModerationResult {
  isSafe: boolean;
  reason?: string;
}

interface ModerationHistoryEntry {
  content_text: string;
  content_source: 'forum' | 'whatsapp' | 'twitter';
  external_message_id?: string;
}

export const moderateContent = async (
  text: string, 
  source: ModerationHistoryEntry['content_source'],
  messageId?: string
): Promise<ModerationResult> => {
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

      // Store the moderation result in Supabase
      const { error } = await supabase
        .from('moderation_history')
        .insert({
          content_text: text,
          content_source: source,
          is_flagged: !isSafe,
          flag_reason: isSafe ? null : categories.join(', '),
          external_message_id: messageId
        });

      if (error) {
        console.error('Error storing moderation history:', error);
      }

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

// Function to get moderation history for the current user
export const getModerationHistory = async () => {
  const { data, error } = await supabase
    .from('moderation_history')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching moderation history:', error);
    return [];
  }

  return data;
};

// Function to check if a user has been repeatedly flagged
export const checkUserReputation = async (userId: string) => {
  const { data, error } = await supabase
    .from('moderation_history')
    .select('*')
    .eq('user_id', userId)
    .eq('is_flagged', true)
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Last 7 days

  if (error) {
    console.error('Error checking user reputation:', error);
    return { isHighRisk: false, flagCount: 0 };
  }

  return {
    isHighRisk: (data?.length || 0) >= 3, // Consider user high risk if flagged 3+ times in a week
    flagCount: data?.length || 0
  };
};
