import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useMockStore } from '../store/mockStore';
import { GlassCard } from '../components/GlassCard';
import GlobalLayout from '../components/GlobalLayout';
import MaterialIcon from '../components/MaterialIcon';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  transactions?: any[];
}

export const AssistantScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { transactions } = useMockStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'user',
      text: 'Show me all my ₹15 payments.'
    },
    {
      id: '2',
      sender: 'ai',
      text: 'I found 3 payments of ₹15 in June:',
      transactions: transactions.filter(t => t.amount === 15)
    }
  ]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const getCategoryIcon = (category: string): 'restaurant' | 'directions_car' | 'menu_book' | 'local_mall' | 'movie' | 'category' => {
    switch (category) {
      case 'Food': return 'restaurant';
      case 'Travel': return 'directions_car';
      case 'Stationery': return 'menu_book';
      case 'Shopping': return 'local_mall';
      case 'Entertainment': return 'movie';
      default: return 'category';
    }
  };

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

      if (query.includes('food')) {
        filteredTxs = transactions.filter(t => t.category === 'Food');
        const spent = filteredTxs.reduce((sum, t) => sum + t.amount, 0);
        replyText = `You spent a total of ₹${spent.toFixed(2)} on Food across ${filteredTxs.length} payments:`;
      } else if (query.includes('15')) {
        filteredTxs = transactions.filter(t => t.amount === 15);
        replyText = `I found ${filteredTxs.length} payments of ₹15 in June:`;
      } else {
        replyText = `I can help you filter transactions. Try asking me "What did I spend on Food?" or "Show me my ₹15 payments."`;
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
        <View className="mb-6">
          <GlassCard className="flex-row items-center gap-4 bg-white/5 border border-emerald-500/20">
            <View className="w-10 h-10 rounded-full bg-emerald-500/10 items-center justify-center border border-emerald-500/20">
              <MaterialIcon name="trending_up" color="#34d399" size={18} />
            </View>
            <View>
              <Text className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                Proactive Insight
              </Text>
              <Text className="font-title-md text-body-sm text-emerald-400 font-semibold mt-0.5">
                You are 15% under budget this week!
              </Text>
            </View>
          </GlassCard>
        </View>

        {/* Scrollable messages list */}
        <ScrollView 
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {messages.map(msg => (
            <View 
              key={msg.id}
              className={`flex-row mb-6 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <View className="w-8 h-8 rounded-full bg-surface-variant items-center justify-center border border-white/10 mr-2 self-end mb-2">
                  <MaterialIcon name="smart_toy" color="#3B82F6" size={16} />
                </View>
              )}
              
              <View 
                className={`max-w-[80%] rounded-2xl p-4 border ${
                  msg.sender === 'user'
                    ? 'bg-primary/10 border-primary/20 rounded-tr-none'
                    : 'bg-white/5 border-white/10 rounded-tl-none'
                }`}
              >
                <Text className="font-body-lg text-body-lg text-white">
                  {msg.text}
                </Text>

                {/* Filtered transactions card list inside bubble */}
                {msg.transactions && msg.transactions.length > 0 && (
                  <View className="mt-4 gap-2">
                    {msg.transactions.map((tx, idx) => (
                      <View 
                        key={tx.id} 
                        className={`flex-row items-center justify-between py-2 ${
                          idx !== msg.transactions!.length - 1 ? 'border-b border-white/5' : ''
                        }`}
                      >
                        <View className="flex-row items-center gap-2">
                          <View className="w-8 h-8 rounded-full bg-white/5 items-center justify-center">
                            <MaterialIcon name={getCategoryIcon(tx.category)} size={16} color="#e1e2ec" />
                          </View>
                          <View>
                            <Text className="font-body-sm text-[12px] text-white font-medium">{tx.title}</Text>
                            <Text className="font-label-caps text-[9px] text-on-surface-variant uppercase">
                              {tx.date}, {tx.timestamp}
                            </Text>
                          </View>
                        </View>
                        <Text className="font-body-sm text-[12px] text-white font-bold">
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
      <View className="px-6 pt-4 pb-[84px] border-t border-white/5 bg-background">
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
      </View>
    </GlobalLayout>
  );
};
export default AssistantScreen;
