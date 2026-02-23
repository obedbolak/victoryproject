// app/onboarding.tsx

import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  StatusBar,
  StyleSheet,
  View,
  ViewToken,
} from "react-native";
import { Button, Text } from "react-native-paper";
import { onboardingSlides } from "../constants/Servers";
import { CustomColors } from "../constants/Theme";
import { useVpn } from "../context/VpnContext";

const { width } = Dimensions.get("window");

export default function OnboardingScreen() {
  const { completeOnboarding } = useVpn();
  const [idx, setIdx] = useState(0);
  const listRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const isLast = idx === onboardingSlides.length - 1;

  const next = () => {
    if (!isLast) {
      listRef.current?.scrollToIndex({ index: idx + 1, animated: true });
    } else {
      completeOnboarding();
    }
  };

  const onViewRef = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setIdx(viewableItems[0].index);
      }
    },
  ).current;

  const viewConfigRef = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  // Render each slide WITHOUT animated scale/opacity to avoid native driver issues
  const renderSlide = ({
    item,
    index,
  }: {
    item: (typeof onboardingSlides)[0];
    index: number;
  }) => {
    return (
      <View style={styles.slide}>
        <View
          style={[styles.outerCircle, { backgroundColor: item.color + "20" }]}
        >
          <View
            style={[styles.innerCircle, { backgroundColor: item.color + "40" }]}
          >
            <MaterialCommunityIcons
              name={item.icon as any}
              size={80}
              color={item.color}
            />
          </View>
        </View>

        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.desc}>{item.description}</Text>
      </View>
    );
  };

  // Custom dot indicator (no Animated width — use static active/inactive)
  const renderDots = () => (
    <View style={styles.dots}>
      {onboardingSlides.map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              width: i === idx ? 30 : 10,
              opacity: i === idx ? 1 : 0.3,
              backgroundColor: onboardingSlides[idx].color,
            },
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />

      {/* Skip */}
      {!isLast && (
        <Button
          mode="text"
          onPress={completeOnboarding}
          style={styles.skip}
          labelStyle={{ color: "#888", fontSize: 16 }}
        >
          Skip
        </Button>
      )}

      {/* Slides — use regular FlatList, NOT Animated.FlatList */}
      <FlatList
        ref={listRef}
        data={onboardingSlides}
        horizontal
        pagingEnabled
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewRef}
        viewabilityConfig={viewConfigRef}
        scrollEventThrottle={16}
        renderItem={renderSlide}
        bounces={false}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />

      {/* Bottom */}
      <View style={styles.bottom}>
        {renderDots()}

        <Button
          mode="contained"
          onPress={next}
          icon={isLast ? "shield-check" : "arrow-right"}
          style={[styles.btn, { backgroundColor: onboardingSlides[idx].color }]}
          contentStyle={{ height: 56, flexDirection: "row-reverse" }}
          labelStyle={{ fontSize: 18, fontWeight: "700", color: "#FFF" }}
        >
          {isLast ? "Get Started" : "Next"}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: CustomColors.background,
  },
  skip: {
    position: "absolute",
    top: 50,
    right: 16,
    zIndex: 10,
  },
  slide: {
    width,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  outerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 50,
  },
  innerCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFF",
    textAlign: "center",
    marginBottom: 16,
  },
  desc: {
    fontSize: 16,
    color: "#AAA",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  bottom: {
    paddingBottom: 60,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    height: 10,
    borderRadius: 5,
  },
  btn: {
    width: "100%",
    borderRadius: 16,
    elevation: 5,
  },
});
