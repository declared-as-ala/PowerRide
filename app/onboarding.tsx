import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Pressable,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { useStore } from '@/store/useStore';
import {
  ChevronRight,
  CircleCheck as CheckCircle,
  Thermometer,
  Wifi as WifiIcon,
  BellRing,
} from 'lucide-react-native';

const OnboardingScreen = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const { width } = useWindowDimensions();
  const { completeOnboarding } = useStore();
  const { colors } = useTheme();

  const onboardingSteps = [
    {
      title: 'Welcome to PowerRide',
      description:
        'Your smart temperature monitoring solution for real-time data tracking and alerts.',
      image:
        'https://images.pexels.com/photos/3912372/pexels-photo-3912372.jpeg?auto=compress&cs=tinysrgb&w=800',
      icon: <Thermometer size={64} color={colors.primary} />,
    },
    {
      title: 'Temperature Monitoring',
      description:
        'Connect to your ESP32 sensor to monitor temperature readings in real-time with precision and reliability.',
      image:
        'https://images.pexels.com/photos/8105063/pexels-photo-8105063.jpeg?auto=compress&cs=tinysrgb&w=800',
      icon: <WifiIcon size={64} color={colors.primary} />,
    },
    {
      title: 'Smart Alerts',
      description:
        'Get instant notifications when temperatures reach critical levels, helping you respond quickly to potential issues.',
      image:
        'https://images.pexels.com/photos/3761509/pexels-photo-3761509.jpeg?auto=compress&cs=tinysrgb&w=800',
      icon: <BellRing size={64} color={colors.primary} />,
    },
  ];

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
      router.replace('/(tabs)/home');
    }
  };

  const handleSkip = () => {
    completeOnboarding();
    router.replace('/(tabs)/home');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Skip button */}
      {currentStep < onboardingSteps.length - 1 && (
        <Pressable style={styles.skipButton} onPress={handleSkip}>
          <Text
            style={[styles.skipButtonText, { color: colors.textSecondary }]}
          >
            Skip
          </Text>
        </Pressable>
      )}

      {/* Progress indicators */}
      <View style={styles.progressContainer}>
        {onboardingSteps.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              {
                backgroundColor:
                  index === currentStep ? colors.primary : colors.border,
                width: index === currentStep ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View
          key={`step-${currentStep}`}
          entering={FadeIn.duration(400)}
          exiting={FadeOut.duration(400)}
          style={styles.stepContainer}
        >
          <View style={styles.iconContainer}>
            {onboardingSteps[currentStep].icon}
          </View>

          <View style={styles.imageContainer}>
            <Image
              source={{ uri: onboardingSteps[currentStep].image }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>

          <Text
            style={[
              styles.title,
              { color: colors.text, fontFamily: 'Poppins-Bold' },
            ]}
          >
            {onboardingSteps[currentStep].title}
          </Text>

          <Text
            style={[
              styles.description,
              { color: colors.textSecondary, fontFamily: 'Poppins-Regular' },
            ]}
          >
            {onboardingSteps[currentStep].description}
          </Text>
        </Animated.View>
      </ScrollView>

      <Pressable
        style={[styles.nextButton, { backgroundColor: colors.primary }]}
        onPress={handleNext}
      >
        {currentStep === onboardingSteps.length - 1 ? (
          <>
            <Text
              style={[styles.nextButtonText, { fontFamily: 'Poppins-Bold' }]}
            >
              Get Started
            </Text>
            <CheckCircle size={24} color="white" />
          </>
        ) : (
          <>
            <Text
              style={[styles.nextButtonText, { fontFamily: 'Poppins-Bold' }]}
            >
              Next
            </Text>
            <ChevronRight size={24} color="white" />
          </>
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  stepContainer: {
    alignItems: 'center',
    width: '100%',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    gap: 8,
  },
  progressDot: {
    height: 8,
    borderRadius: 4,
  },
  iconContainer: {
    marginBottom: 20,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 32,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 28,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 24,
    marginBottom: 40,
    gap: 8,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
  },
  skipButtonText: {
    fontSize: 16,
  },
});

export default OnboardingScreen;
