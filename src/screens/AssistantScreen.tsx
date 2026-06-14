import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Keyboard, Platform, Animated, Easing } from 'react-native';
import { useMockStore } from '../store/mockStore';
import { GlassCard } from '../components/GlassCard';
import GlobalLayout from '../components/GlobalLayout';
import MaterialIcon from '../components/MaterialIcon';
import AIIcon from '../public/assets/icons/AIIcon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DEFAULT_CATEGORIES } from '../utils/constants';
import { GEMINI_API_KEY } from '@env';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  transactions?: any[];
}

const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-flash', 'gemini-1.5-pro'];

const PRESETS = [
  { label: 'Analyze budget', prompt: 'Analyze my budget and suggest savings.' },
  { label: 'Top categories', prompt: 'Which categories did I spend the most on?' },
  { label: 'Cash payments', prompt: 'Show me my recent Cash payments.' },
  { label: 'UPI transactions', prompt: 'List my recent UPI transactions.' },
  { label: 'Warning check', prompt: 'Am I close to exceeding any category budget?' }
];

export const AssistantScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { transactions, monthlyBudget, userProfile, categories, categoryLimits, addGoal, goals } = useMockStore();
  const insets = useSafeAreaInsets();
  const bottomMargin = Math.max(insets.bottom, 12);
  const inputPaddingBottom = bottomMargin + 70 + 12; // 70 navbar height + 12 spacing
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    setMessages([
      {
        id: '1',
        sender: 'ai',
        text: `Hi ${userProfile.name}, I am your Lumen Assistant. You can ask me to analyze your spending, check budgets, or filter your ledger.`
      }
    ]);
  }, [userProfile.name]);

  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const [isKeyboardActive, setIsKeyboardActive] = useState(false);
  const paddingAnim = useRef(new Animated.Value(inputPaddingBottom)).current;

  useEffect(() => {
    const showListener = Keyboard.addListener(
      Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow',
      (e) => {
        setIsKeyboardActive(true);
        Animated.timing(paddingAnim, {
          toValue: Platform.OS === 'android' ? e.endCoordinates.height + 30 : 30,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }).start();
      }
    );
    const hideListener = Keyboard.addListener(
      Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide',
      () => {
        setIsKeyboardActive(false);
        Animated.timing(paddingAnim, {
          toValue: inputPaddingBottom,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }).start();
      }
    );

    return () => { showListener.remove(); hideListener.remove(); };
  }, [inputPaddingBottom]);

  const fetchGeminiResponse = async (userMessage: string, chatHistory: { role: string; text: string }[]) => {
    if (!GEMINI_API_KEY) {
      throw new Error("Gemini API key is not configured. Please check your .env file and restart Metro with 'npm start -- --clear-cache'.");
    }

    const systemInstruction = `You are Lumen Assistant, a premium AI personal finance advisor.
Today's date is 2026-06-14.
The user's name is ${userProfile.name}.
Monthly Budget: ₹${monthlyBudget}.
Categories available: ${categories.map(c => `${c.name} (Budget: ₹${categoryLimits[c.name] || 0})`).join(', ')}.
Current Active Savings Goals: ${goals && goals.length > 0 ? JSON.stringify(goals, null, 2) : "None"}.

Here are the user's recent transactions:
${JSON.stringify(transactions, null, 2)}

If the user wants to set or add a financial goal (e.g. "Save ₹5000 for a trip next month"), provide a friendly confirmation response and ALWAYS append a single line at the very end of your response with this format:
ACTION: ADD_GOAL {"title": "<goal name>", "targetAmount": <number>, "deadline": "<deadline string>"}
Example: ACTION: ADD_GOAL {"title": "Trip to Goa", "targetAmount": 5000, "deadline": "Next Month"}
Keep the title concise. Do not add any extra characters to this ACTION line.

Provide clear, helpful, and concise insights. Format currency in ₹ (INR). Use a 24-hour time format when referencing transaction timestamps. Keep replies direct and under 4-5 sentences unless detail is needed. Do not use markdown bold symbols (** or *) excessively, keep text clean and readable.`;

    const contents = [
      ...chatHistory.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      })),
      {
        role: 'user',
        parts: [{ text: userMessage }]
      }
    ];

    for (const model of GEMINI_MODELS) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents,
              systemInstruction: {
                parts: [{ text: systemInstruction }]
              }
            })
          }
        );

        if (!response.ok) {
          throw new Error(`Model ${model} returned status ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return text;
        }
        throw new Error(`Empty response from model ${model}`);
      } catch (error) {
        console.warn(`Failed with model ${model}:`, error);
      }
    }
    throw new Error("All models failed to generate content.");
  };

  const executeSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: textToSend
    };

    setMessages(prev => [...prev, userMessage]);
    
    const tempAiId = Math.random().toString();
    const tempAiMessage: Message = {
      id: tempAiId,
      sender: 'ai',
      text: 'Analyzing...'
    };
    setMessages(prev => [...prev, tempAiMessage]);
    scrollViewRef.current?.scrollToEnd({ animated: true });

    try {
      const chatHistory = messages
        .filter(m => m.text !== 'Analyzing...')
        .map(m => ({
          role: m.sender,
          text: m.text
        }));

      const replyText = await fetchGeminiResponse(textToSend, chatHistory);

      let cleanReply = replyText;
      const actionMatch = replyText.match(/ACTION:\s*ADD_GOAL\s*({.*})/);
      if (actionMatch) {
        try {
          const goalData = JSON.parse(actionMatch[1]);
          if (goalData && goalData.title && goalData.targetAmount) {
            addGoal(goalData.title, goalData.targetAmount, goalData.deadline || 'Next Month');
          }
          cleanReply = replyText.replace(/ACTION:\s*ADD_GOAL\s*({.*})/, '').trim();
        } catch (e) {
          console.warn("Failed to parse goal from AI response:", e);
        }
      }

      setMessages(prev => 
        prev.map(m => m.id === tempAiId ? { ...m, text: cleanReply } : m)
      );
    } catch (err: any) {
      const isConfigError = err?.message?.includes("Gemini API key");
      setMessages(prev => 
        prev.map(m => m.id === tempAiId ? { ...m, text: isConfigError ? err.message : "Sorry, I encountered an error while trying to connect to my brain. Please try again." } : m)
      );
    }
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    executeSend(inputText);
    setInputText('');
  };

  return (
    <GlobalLayout
      activeTab="none"
      showBack={true}
      hideAssistant={true}
      navigation={navigation}
      title="FINANCE INTELLIGENCE"
    >
      {/* Chat Space */}
      <View className="flex-1 px-6 pt-6">
        {/* Proactive Insight banner */}
        {/* Proactive Insight Card */}
        {(() => {
          const totalSpent = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

          let insightText = '';
          let highlightText = '';
          let isPositive = true;
          let iconName = 'trending_down';
          let iconColor = '#34d399';
          let iconBg = 'bg-emerald-500/10';
          let iconBorder = 'border-emerald-500/30';
          let cardBorder = 'border-emerald-500/20';

          if (monthlyBudget === 0) {
            highlightText = 'Set your monthly budget';
            insightText = ' to get proactive insights!';
            isPositive = false;
            iconName = 'info';
            iconColor = '#adc6ff';
            iconBg = 'bg-primary/10';
            iconBorder = 'border-primary/30';
            cardBorder = 'border-primary/20';
          } else if (totalSpent < monthlyBudget) {
            const percentUnder = Math.round(((monthlyBudget - totalSpent) / monthlyBudget) * 100);
            highlightText = `You are ${percentUnder}% under budget`;
            insightText = ' this month!';
            isPositive = true;
            iconName = 'trending_down';
            iconColor = '#34d399';
            iconBg = 'bg-emerald-500/10';
            iconBorder = 'border-emerald-500/30';
            cardBorder = 'border-emerald-500/20';
          } else {
            const percentOver = Math.round(((totalSpent - monthlyBudget) / monthlyBudget) * 100);
            highlightText = `You are ${percentOver}% over budget`;
            insightText = ' this month!';
            isPositive = false;
            iconName = 'trending_up';
            iconColor = '#ef4444';
            iconBg = 'bg-red-500/10';
            iconBorder = 'border-red-500/30';
            cardBorder = 'border-red-500/20';
          }

          return (
            <View className="mb-6">
              <GlassCard 
                className={`border ${cardBorder}`}
                contentClassName="flex-row items-center gap-4 p-5"
              >
                <View className={`w-12 h-12 rounded-full ${iconBg} items-center justify-center border ${iconBorder}`}>
                  <MaterialIcon name={iconName} color={iconColor} size={24} />
                </View>
                <View className="flex-1">
                  <Text 
                    style={{ fontFamily: 'Montserrat-Bold', letterSpacing: 0.8, color: "white" }} 
                    className="font-label-caps text-[11px] text-on-surface-variant/80 uppercase font-bold"
                  >
                    Proactive Insight
                  </Text>
                  <Text 
                    style={{ fontFamily: 'Montserrat-Bold', fontSize: 16, lineHeight: 22 }}
                    className="font-bold mt-1.5"
                  >
                    <Text className={isPositive ? "text-emerald-400" : "text-red-400"}>{highlightText}{"\n"}</Text>
                    <Text className="text-white">{insightText}</Text>
                  </Text>
                </View>
              </GlassCard>
            </View>
          );
        })()}

        {/* Scrollable messages list */}
        <ScrollView 
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map(msg => (
            <View 
              key={msg.id}
              className={`flex-row mb-6 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <View className="w-9 h-9 rounded-full bg-surface-variant items-center justify-center border border-white/10 mr-2 self-end mb-2">
                  <AIIcon size={18} />
                </View>
              )}
              
              <View 
                className={`max-w-[88%] rounded-2xl p-5 border ${
                  msg.sender === 'user'
                    ? 'bg-primary/10 border-primary/20 rounded-tr-none'
                    : 'bg-white/5 border-white/10 rounded-tl-none'
                }`}
              >
                <Text 
                  style={{ fontFamily: 'Montserrat-Bold', fontSize: 17, lineHeight: 24 }}
                  className="text-white font-bold"
                >
                  {msg.text}
                </Text>

                {/* Filtered transactions card list inside bubble */}
                {msg.transactions && msg.transactions.length > 0 && (
                  <View className="mt-4 gap-2">
                    {msg.transactions.map((tx, idx) => (
                      <View 
                        key={tx.id} 
                        className={`flex-row items-center justify-between py-2.5 ${
                          idx !== msg.transactions!.length - 1 ? 'border-b border-white/5' : ''
                        }`}
                      >
                        <View className="flex-row items-center gap-3">
                          {(() => {
                            const catConfig = categories.find(c => c.name === tx.category) || { color: '#94a3b8', bgColor: 'rgba(148, 163, 184, 0.1)', icon: 'category' };
                            return (
                              <View 
                                style={{ backgroundColor: catConfig.bgColor, borderColor: catConfig.color + '33' }}
                                className="w-8 h-8 rounded-full border items-center justify-center"
                              >
                                <MaterialIcon name={catConfig.icon as any} size={16} color={catConfig.color} />
                              </View>
                            );
                          })()}
                          <View>
                            <Text style={{ fontFamily: 'Montserrat-Bold' }} className="font-body-sm text-[15px] text-white font-bold">{tx.title}</Text>
                            <Text style={{ fontFamily: 'Montserrat-Regular' }} className="font-label-caps text-[12px] text-on-surface-variant uppercase">
                              {tx.date}, {tx.timestamp}
                            </Text>
                          </View>
                        </View>
                        <Text style={{ fontFamily: 'Montserrat-Bold' }} className="font-body-sm text-[15px] text-white font-bold">
                          ₹{tx.amount.toFixed(2)}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Input bar */}
      <Animated.View 
        style={{ paddingBottom: paddingAnim }}
        className="px-6 pt-4 border-t border-white/5 bg-background"
      >
        {/* Preset Prompt Buttons */}
        <View className="mb-3">
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {PRESETS.map((preset, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => executeSend(preset.prompt)}
                className="px-4 py-2.5 rounded-full bg-white/5 border border-white/10"
                activeOpacity={0.8}
              >
                <Text style={{ fontFamily: 'Montserrat-Bold', color: '#FFFFFF' }} className="text-xs font-bold">
                  {preset.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View className="flex-row items-center gap-2 h-14 bg-white/5 border border-white/10 rounded-2xl px-4">
          <TextInput
            placeholder="Ask assistant..."
            placeholderTextColor="rgba(225, 226, 236, 0.3)"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
            className="flex-1 h-full text-white font-body"
          />
          <TouchableOpacity onPress={handleSend} className="w-10 h-10 items-center justify-center">
            <MaterialIcon name="send" color="#3B82F6" size={20} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </GlobalLayout>
  );
};
export default AssistantScreen;
