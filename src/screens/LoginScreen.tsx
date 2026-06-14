import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { GlassCard } from '../components/GlassCard';
import BackgroundLayout from '../components/BackgroundLayout';
import GlowOrb from '../components/GlowOrb';
import { useMockStore } from '../store/mockStore';

export const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { login, isLoggedIn, hasCompletedSetup } = useMockStore();

  useEffect(() => {
    if (isLoggedIn) {
      if (hasCompletedSetup) {
        navigation.replace('MainApp');
      } else {
        navigation.replace('SetupWizard');
      }
    }
  }, [isLoggedIn, hasCompletedSetup, navigation]);

  const handleGoogleSignIn = async () => {
    await login();
  };

  return (
    <BackgroundLayout>
      {/* Background ambient lights */}
      <GlowOrb size={250} color="#3B82F6" opacity={0.15} style={{ top: '25%', left: '10%' }} gradientId="login-glow-top" />
      <GlowOrb size={380} color="#3B82F6" opacity={0.12} style={{ bottom: '20%', right: '5%' }} gradientId="login-glow-bottom" />

      <View className="flex-1 justify-center items-center px-6 z-10 w-full">

      <View className="w-full max-w-md">
        {/* Logo Header */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/10 justify-center items-center mb-4 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
            <Image 
              source={require('../public/assets/logo/lumen_logo_icon_bgremoved.png')} 
              className="w-full h-full" 
              resizeMode="contain" 
              fadeDuration={0}
            />
          </View>
          <Text 
            style={{ fontSize: 44, fontWeight: '900', fontFamily: 'Montserrat-Bold', color: '#FFFFFF', letterSpacing: 2 }}
            className="text-on-surface text-center"
          >
            LUMEN
          </Text>
        </View>

        {/* Card */}
        <GlassCard active={true} className="p-6">
          <View className="items-center mb-8">
            <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 34, fontWeight: 'bold', color: 'white' }} className="mb-2 text-center">
              Welcome back
            </Text>
            <Text style={{ fontFamily: 'Montserrat-SemiBold', fontSize: 17, color: 'rgba(255,255,255,0.7)' }} className="text-center">
              Manage Cash & UPI independently
            </Text>
          </View>

          {/* Google Button */}
          <TouchableOpacity
            onPress={handleGoogleSignIn}
            activeOpacity={0.85}
            className="w-full h-14 bg-surface-container-high border border-outline-variant rounded-2xl flex-row items-center justify-center gap-3 shadow-md"
          >
            {/* Google Vector Icon */}
            <Svg width="24" height="24" viewBox="0 0 24 24">
              <Path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <Path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <Path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <Path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </Svg>
            <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 17, color: 'white', fontWeight: 'bold' }}>
              Continue with Google
            </Text>
          </TouchableOpacity>

          {/* Terms Footer */}
          <View className="mt-8 text-center">
            <Text style={{ fontFamily: 'Montserrat-Medium', fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 18 }} className="text-center">
              By continuing, you agree to our{' '}
              <Text className="text-primary underline">Terms of Service</Text> and{' '}
              <Text className="text-primary underline">Privacy Policy</Text>.
            </Text>
          </View>
        </GlassCard>
      </View>

      {/* Footer Label */}
      <View className="absolute bottom-6 w-full items-center">
        <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: 1 }}>
          SECURE LOGIN INITIATIVE
        </Text>
      </View>
    </View>
  </BackgroundLayout>
  );
};
export default LoginScreen;
