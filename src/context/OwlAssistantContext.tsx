import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import { askOwl, type ChatMessage } from '../lib/gemini';
import { getFeatureContext } from '../data/featureAIContext';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DrawerMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface OwlAssistantContextType {
  /** Whether the chat drawer is currently visible */
  isOpen: boolean;
  /** ID of the feature the user is currently viewing (e.g. 'campus-nav') */
  currentFeatureId: string | null;
  /** All messages in the mini chat drawer */
  messages: DrawerMessage[];
  /** Whether the AI is currently generating a response */
  isTyping: boolean;
  /** Open the drawer (optionally with a pre-filled message) */
  openDrawer: (prefillMessage?: string) => void;
  /** Close the drawer */
  closeDrawer: () => void;
  /** Toggle the drawer open/closed */
  toggleDrawer: () => void;
  /** Set the current feature context (called by FeaturePage on mount) */
  setFeatureContext: (featureId: string | null) => void;
  /** Send a message to the AI */
  sendMessage: (text: string) => Promise<void>;
  /** Input state for the drawer's text input */
  inputValue: string;
  setInputValue: (v: string) => void;
  /** Stop the current AI response */
  stopGeneration: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const OwlAssistantContext = createContext<OwlAssistantContextType>({
  isOpen: false,
  currentFeatureId: null,
  messages: [],
  isTyping: false,
  openDrawer: () => {},
  closeDrawer: () => {},
  toggleDrawer: () => {},
  setFeatureContext: () => {},
  sendMessage: async () => {},
  inputValue: '',
  setInputValue: () => {},
  stopGeneration: () => {},
});

export const useOwlAssistant = () => useContext(OwlAssistantContext);

// ─── Provider ─────────────────────────────────────────────────────────────────

function buildGreeting(featureId: string | null): DrawerMessage {
  const greetings: Record<string, string> = {
    academic: "Hi! 👋 I see you're checking your academics. Need help understanding your grades, GPA, or enrollment requirements?",
    'campus-nav': "Hi! 🗺️ I see you're exploring the campus map. Want help finding a specific building, room, or office?",
    transport: "Hi! 🚌 I see you're checking transport schedules. Ask me about e-jeep routes, stops, or the SakayUDD app!",
    exam: "Hi! 📋 I see you're reviewing your exam schedule. Need help with exam protocols or what to bring?",
    announcements: "Hi! 📢 I see you're browsing announcements. Ask me about any event or announcement you'd like to know more about!",
    faculty: "Hi! 👩‍🏫 I see you're looking for faculty. Tell me a professor's name and I'll help you find their office!",
    feedback: "Hi! 💬 I see you're writing feedback. Want help articulating your thoughts or finding the right category?",
    inquiry: "Hi! ❓ I see you're looking for answers. Ask me anything about UdD campus life, enrollment, or services!",
    'lost-found': "Hi! 🔍 I see you're on the Lost & Found board. Tell me what you lost and I can help you write a clear report!",
  };

  const content =
    greetings[featureId ?? ''] ??
    "Hi! 🦉 I'm OWL, your campus AI assistant. How can I help you today?";

  return {
    id: `greeting-${featureId ?? 'home'}`,
    role: 'ai',
    content,
    timestamp: new Date(),
  };
}

export const OwlAssistantProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentFeatureId, setCurrentFeatureId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DrawerMessage[]>([
    buildGreeting(null),
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  const setFeatureContext = useCallback((featureId: string | null) => {
    setCurrentFeatureId(featureId);
    // Reset messages to a context-aware greeting when moving to a new feature
    setMessages([buildGreeting(featureId)]);
  }, []);

  const openDrawer = useCallback((prefillMessage?: string) => {
    setIsOpen(true);
    if (prefillMessage) setInputValue(prefillMessage);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleDrawer = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsTyping(false);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isTyping) return;

      const userMsg: DrawerMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: text,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);
      setInputValue('');

      // Build feature-aware context prefix for the system prompt
      const featureCtx = getFeatureContext(currentFeatureId);
      const contextPrefix = `CURRENT CONTEXT: ${featureCtx}\n\nAnswer based on this context first, then use your general UdD knowledge.`;

      // Build chat history for the API call (skip the greeting)
      const history: ChatMessage[] = messages
        .filter((m) => m.id !== `greeting-${currentFeatureId ?? 'home'}`)
        .map((m) => ({ role: m.role, content: m.content }));

      abortRef.current = new AbortController();

      try {
        const response = await askOwl(
          `${contextPrefix}\n\nUser question: ${text}`,
          history,
          abortRef.current.signal
        );

        const aiMsg: DrawerMessage = {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          content: response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        const errMsg: DrawerMessage = {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          content: "Sorry, I couldn't reach the server. Please try again! 🦉",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errMsg]);
      } finally {
        setIsTyping(false);
        abortRef.current = null;
      }
    },
    [isTyping, messages, currentFeatureId]
  );

  return (
    <OwlAssistantContext.Provider
      value={{
        isOpen,
        currentFeatureId,
        messages,
        isTyping,
        openDrawer,
        closeDrawer,
        toggleDrawer,
        setFeatureContext,
        sendMessage,
        inputValue,
        setInputValue,
        stopGeneration,
      }}
    >
      {children}
    </OwlAssistantContext.Provider>
  );
};
