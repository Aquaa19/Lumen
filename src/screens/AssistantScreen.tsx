import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Keyboard, Platform, Animated, Easing } from 'react-native';
import { useMockStore } from '../store/mockStore';
import { GlassCard } from '../components/GlassCard';
import GlobalLayout from '../components/GlobalLayout';
import MaterialIcon from '../components/MaterialIcon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DEFAULT_CATEGORIES } from '../utils/constants';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  transactions?: any[];
}

export const AssistantScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { transactions, monthlyBudget, userProfile, categories } = useMockStore();
  const insets = useSafeAreaInsets();
  const bottomMargin = Math.max(insets.bottom, 12);
  const inputPaddingBottom = bottomMargin + 70 + 12; // 70 navbar height + 12 spacing
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    setMessages([
      {
        id: '1',
        sender: 'ai',
        text: `Hi ${userProfile.name}, I am your Lumen Assistant. You can ask me to filter your ledger or analyze your spending (e.g., "What did I spend on Food?" or "Show payments under ₹100").`
      }
    ]);
  }, [userProfile.name]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const [isKeyboardActive, setIsKeyboardActive] = useState(false);
  const keyboardOffsetAnim = useRef(new Animated.Value(0)).current;

  // Start the animation at the default resting padding
  const paddingAnim = useRef(new Animated.Value(inputPaddingBottom)).current;

  useEffect(() => {
    const showListener = Keyboard.addListener(
      Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow',
      (e) => {
        setIsKeyboardActive(true);
        Animated.timing(paddingAnim, {
          toValue: Platform.OS === 'android' ? e.endCoordinates.height + 30 : 30,
          duration: 250,
          easing: Easing.out(Easing.ease), // Native deceleration feel
          useNativeDriver: false,
        }).start();
      }
    );
    const hideListener = Keyboard.addListener(
      Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide',
      () => {
        setIsKeyboardActive(false);
        Animated.timing(paddingAnim, {
          toValue: inputPaddingBottom, // Smoothly animate back to the large navbar padding
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }).start();
      }
    );

    return () => { showListener.remove(); hideListener.remove(); };
  }, [inputPaddingBottom]);





  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: inputText
    };

    setMessages(prev => [...prev, userMessage]);
    const query = inputText.toLowerCase();
    setInputText('');

    // Process reply
    setTimeout(() => {
      let replyText = '';
      let filteredTxs: any[] | undefined = undefined;

      const matchedCategory = categories.find(c => query.includes(c.name.toLowerCase()));
      if (matchedCategory) {
        filteredTxs = transactions.filter(t => t.category === matchedCategory.name && t.type === 'expense');
        const spent = filteredTxs.reduce((sum, t) => sum + (t.amount ?? 0), 0);
        replyText = `You spent a total of ₹${spent.toFixed(2)} on ${matchedCategory.name} across ${filteredTxs.length} payments:`;
      } else if (query.includes('under') || query.includes('<') || query.includes('less than')) {
        const match = query.match(/\d+/);
        if (match) {
          const limitAmt = parseInt(match[0], 10);
          filteredTxs = transactions.filter(t => (t.amount ?? 0) < limitAmt && t.type === 'expense');
          replyText = `I found ${filteredTxs.length} payments under ₹${limitAmt}:`;
        } else {
          replyText = `I can help you filter transactions. Try asking me "What did I spend on Food?" or "Show payments under ₹100".`;
        }
      } else if (query.includes('over') || query.includes('>') || query.includes('more than')) {
        const match = query.match(/\d+/);
        if (match) {
          const limitAmt = parseInt(match[0], 10);
          filteredTxs = transactions.filter(t => (t.amount ?? 0) > limitAmt && t.type === 'expense');
          replyText = `I found ${filteredTxs.length} payments over ₹${limitAmt}:`;
        } else {
          replyText = `I can help you filter transactions. Try asking me "What did I spend on Food?" or "Show payments over ₹100".`;
        }
      } else {
        replyText = `I can help you filter transactions. Try asking me "What did I spend on Food?" or "Show payments under ₹100".`;
      }

      const aiMessage: Message = {
        id: Math.random().toString(),
        sender: 'ai',
        text: replyText,
        transactions: filteredTxs
      };

      setMessages(prev => [...prev, aiMessage]);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 800);
  };

  return (
    <GlobalLayout
      activeTab="assistant"
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
                    style={{ fontFamily: 'Montserrat-Bold', fontSize: 21, lineHeight: 26 }}
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
                  <MaterialIcon name="smart_toy" color="#3B82F6" size={18} />
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
