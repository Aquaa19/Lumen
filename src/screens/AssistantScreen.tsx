import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Keyboard, Platform, Animated, Easing, Modal } from 'react-native';
import { useMockStore } from '../store/mockStore';
import { GlassCard } from '../components/GlassCard';
import GlobalLayout from '../components/GlobalLayout';
import MaterialIcon from '../components/MaterialIcon';
import AIIcon from '../public/assets/icons/AIIcon';
import FingerprintIcon from '../public/assets/icons/FingerprintIcon';
import BiometricService from '../services/BiometricService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DEFAULT_CATEGORIES } from '../utils/constants';
import { GEMINI_API_KEY } from '../config/env';

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

const numpadRows = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
];

export const AssistantScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { 
    transactions, monthlyBudget, userProfile, categories, categoryLimits, goals, customApiKey, pinCode,
    addGoal, setMonthlyBudget, updateCategoryLimit, addTransaction, addFunds
  } = useMockStore();
  
  const activeApiKey = customApiKey || GEMINI_API_KEY;
  const insets = useSafeAreaInsets();
  const bottomMargin = Math.max(insets.bottom, 12);
  const inputPaddingBottom = bottomMargin + 70 + 12; // 70 navbar height + 12 spacing
  const [messages, setMessages] = useState<Message[]>([]);

  // Security Verification State
  const actualPinLength = pinCode ? pinCode.length : 4;
  const [verificationVisible, setVerificationVisible] = useState(false);
  const [verificationPin, setVerificationPin] = useState('');
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    setMessages([
      {
        id: '1',
        sender: 'ai',
        text: `Hi ${userProfile.name}, I am your Lumen AI. You can ask me to analyze your spending, check budgets, update limits, or log payments for you.`
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

  // Security Methods
  const requireVerification = (action: () => void) => {
    // If no security exists, just execute
    if (!pinCode && !userProfile.biometricLock) {
      action();
      return;
    }
    setPendingAction(() => action);
    setVerificationPin('');
    setVerificationError(null);
    setVerificationVisible(true);
  };

  const handleVerificationKeyPress = (num: string) => {
    setVerificationError(null);
    if (verificationPin.length < actualPinLength) {
      const nextPin = verificationPin + num;
      setVerificationPin(nextPin);
      
      if (nextPin.length === actualPinLength) {
        if (nextPin === pinCode) {
          setVerificationVisible(false);
          setVerificationPin('');
          if (pendingAction) {
            const action = pendingAction;
            setPendingAction(null);
            setTimeout(() => action(), 300);
          }
        } else {
          setVerificationError('INCORRECT PIN');
          setVerificationPin('');
        }
      }
    }
  };

  const handleVerificationBackspace = () => {
    setVerificationError(null);
    setVerificationPin(prev => prev.slice(0, -1));
  };

  const handleVerificationBiometric = async () => {
    try {
      const success = await BiometricService.authenticate('Scan fingerprint to verify AI action');
      if (success) {
        setVerificationVisible(false);
        setVerificationPin('');
        if (pendingAction) {
          const action = pendingAction;
          setPendingAction(null);
          setTimeout(() => action(), 300);
        }
      } else {
        setVerificationError('BIOMETRIC VERIFICATION FAILED');
      }
    } catch (error) {
      setVerificationError('BIOMETRIC ERROR');
    }
  };

  const fetchGeminiResponse = async (userMessage: string, chatHistory: { role: string; text: string }[]) => {
    if (!activeApiKey) {
      throw new Error("No API key configured. Please add your Gemini API key in Settings → Custom AI API Key.");
    }

    const systemInstruction = `You are Lumen Assistant, a premium AI personal finance advisor with agentic execution powers.
Today's date is ${new Date().toISOString().split('T')[0]}.
The user's name is ${userProfile.name}.
Monthly Budget: ₹${monthlyBudget}.
Categories available: ${categories.map(c => `${c.name} (Budget: ₹${categoryLimits[c.name] || 0})`).join(', ')}.
Current Active Savings Goals: ${goals && goals.length > 0 ? JSON.stringify(goals, null, 2) : "None"}.

Here are the user's recent transactions:
${JSON.stringify(transactions, null, 2)}

AGENT ACTIONS:
If the user explicitly asks to modify their setup or log data (e.g., set budgets, add expenses), you must provide a friendly confirmation text and ALWAYS append a single line at the very end of your response using this exact JSON format:
ACTION: <ACTION_TYPE> {"param": "value"}

Supported Actions:
1. Set/Update total Monthly Budget: ACTION: UPDATE_BUDGET {"amount": <number>}
2. Set/Update a specific Category Budget limit: ACTION: UPDATE_CATEGORY_LIMIT {"category": "<exact category name>", "amount": <number>}
3. Log an Expense/Payment: ACTION: LOG_PAYMENT {"title": "<string>", "amount": <number>, "source": "cash"|"upi", "category": "<exact category name>"}
4. Add Income/Funds: ACTION: ADD_FUNDS {"amount": <number>, "source": "cash"|"upi"}
5. Add Savings Goal: ACTION: ADD_GOAL {"title": "<string>", "targetAmount": <number>, "deadline": "<string>"}

Example response for logging pizza:
"I have logged ₹500 for Pizza under your Food category using UPI."
ACTION: LOG_PAYMENT {"title": "Pizza", "amount": 500, "source": "upi", "category": "Food"}

CRITICAL: Keep the JSON strictly single-line. Do not add bold symbols around the ACTION line. Provide clear, concise insights. Format currency in ₹ (INR). Use a 24-hour time format when referencing timestamps.`;

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
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeApiKey}`,
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
      const actionMatch = replyText.match(/ACTION:\s*([A-Z_]+)\s*({.*})/);
      
      if (actionMatch) {
        try {
          const actionType = actionMatch[1];
          const actionData = JSON.parse(actionMatch[2]);
          cleanReply = replyText.replace(/ACTION:\s*[A-Z_]+\s*({.*})/, '').trim();

          const executeAgentAction = () => {
            switch(actionType) {
              case 'UPDATE_BUDGET':
                if (actionData.amount) setMonthlyBudget(Number(actionData.amount));
                break;
              case 'UPDATE_CATEGORY_LIMIT':
                if (actionData.category && actionData.amount) updateCategoryLimit(actionData.category, Number(actionData.amount));
                break;
              case 'LOG_PAYMENT':
                if (actionData.title && actionData.amount && actionData.source && actionData.category) {
                  addTransaction(actionData.title, Number(actionData.amount), actionData.source.toLowerCase(), actionData.category, actionData.note);
                }
                break;
              case 'ADD_FUNDS':
                if (actionData.amount && actionData.source) addFunds(Number(actionData.amount), actionData.source.toLowerCase());
                break;
              case 'ADD_GOAL':
                if (actionData.title && actionData.targetAmount) addGoal(actionData.title, Number(actionData.targetAmount), actionData.deadline || 'Next Month');
                break;
            }
          };

          requireVerification(executeAgentAction);

        } catch (e) {
          console.warn("Failed to parse action from AI response:", e);
        }
      }

      setMessages(prev => 
        prev.map(m => m.id === tempAiId ? { ...m, text: cleanReply } : m)
      );
    } catch (err: any) {
      const isConfigError = err?.message?.includes("API key");
      setMessages(prev => 
        prev.map(m => m.id === tempAiId ? { ...m, text: isConfigError ? err.message : `Sorry, I encountered an error while trying to connect to my brain: ${err?.message || err}. Please try again.` } : m)
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
      title="Lumen AI"
    >
      {/* Chat Space */}
      <View className="flex-1 px-6 pt-6">
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
                    className="font-label-caps text-[11px] text-on-surface-variant/80 uppercase"
                  >
                    Proactive Insight
                  </Text>
                  <Text 
                    style={{ fontFamily: 'Montserrat-Bold', fontSize: 16, lineHeight: 22 }}
                  >
                    <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 16, color: isPositive ? '#34d399' : '#f87171' }}>{highlightText}{"\n"}</Text>
                    <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 15, color: 'white' }}>{insightText}</Text>
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
                  style={{ fontFamily: msg.sender === 'user' ? 'Montserrat-SemiBold' : 'Montserrat-Regular', fontSize: 16, lineHeight: 24, color: 'white' }}
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
                <Text style={{ fontFamily: 'Montserrat-Bold', color: '#FFFFFF' }} className="text-xs">
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
            style={{ flex: 1, fontFamily: 'Montserrat-Regular', fontSize: 15, color: 'white', height: '100%' }}
          />
          <TouchableOpacity onPress={handleSend} className="w-10 h-10 items-center justify-center">
            <MaterialIcon name="send" color="#3B82F6" size={20} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* SECURITY VERIFICATION MODAL */}
      <Modal
        visible={verificationVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setVerificationVisible(false)}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}>
          <View className="bg-[#10131a] rounded-t-[32px] border-t border-white/10 p-6 pb-8">
            <View className="items-center mb-6">
              <View className="w-12 h-1.5 bg-white/10 rounded-full mb-4" />
              <Text style={{ fontFamily: 'Montserrat-Bold', color: '#FFFFFF' }} className="text-white text-2xl font-bold text-center">
                Action Verification
              </Text>
              <Text style={{ fontFamily: 'Montserrat-Regular' }} className="text-on-surface-variant text-center mt-2 px-6">
                Please verify your PIN to allow Lumen AI to modify your account data.
              </Text>
            </View>

            <View className="items-center justify-center mb-6">
              <View className="flex-row justify-center mb-2">
                {Array.from({ length: actualPinLength }).map((_, i) => (
                  <View
                    key={i}
                    className={`w-3.5 h-3.5 rounded-full mx-2 border ${
                      verificationPin.length > i 
                        ? 'bg-primary border-primary shadow-[0_0_8px_rgba(59,130,246,0.6)]' 
                        : 'bg-white/5 border-white/20'
                    }`}
                  />
                ))}
              </View>
              {verificationError && (
                <Text style={{ fontFamily: 'Montserrat-Bold' }} className="text-red-400 text-xs font-bold mt-1 uppercase">
                  {verificationError}
                </Text>
              )}
            </View>

            <View className="items-center mb-4">
              <View className="w-full max-w-[260px] gap-3">
                {numpadRows.map((row, rIdx) => (
                  <View key={rIdx} className="flex-row justify-between">
                    {row.map(num => (
                      <TouchableOpacity
                        key={num}
                        onPress={() => handleVerificationKeyPress(num)}
                        activeOpacity={0.8}
                        className="w-[64px] h-[64px] rounded-full bg-white/[0.04] border border-white/[0.08] items-center justify-center"
                      >
                        <Text style={{ fontFamily: 'Montserrat-Bold' }} className="text-white text-xl font-bold">
                          {num}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
                
                <View className="flex-row justify-between">
                  <TouchableOpacity
                    onPress={handleVerificationBiometric}
                    activeOpacity={0.8}
                    className="w-[64px] h-[64px] rounded-full bg-white/[0.04] border border-white/[0.08] items-center justify-center"
                  >
                    <FingerprintIcon color="#3B82F6" size={24} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => handleVerificationKeyPress('0')}
                    activeOpacity={0.8}
                    className="w-[64px] h-[64px] rounded-full bg-white/[0.04] border border-white/[0.08] items-center justify-center"
                  >
                    <Text style={{ fontFamily: 'Montserrat-Bold' }} className="text-white text-xl font-bold">
                      0
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={handleVerificationBackspace}
                    activeOpacity={0.8}
                    className="w-[64px] h-[64px] rounded-full items-center justify-center"
                  >
                    <MaterialIcon name="backspace" color="#ffffff" size={20} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setVerificationVisible(false)}
              className="mt-4 w-full h-12 rounded-xl bg-white/5 border border-white/10 items-center justify-center"
            >
              <Text style={{ fontFamily: 'Montserrat-Bold', color: '#c2c6d6', fontWeight: 'bold' }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </GlobalLayout>
  );
};
export default AssistantScreen;