import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import TopBar from "../../src/components/common/TopBar";
import BottomNav from "../../src/components/common/BottomNav";
import { useRole } from "../../src/context/RoleContext";
import { useTheme } from "../../src/context/ThemeContext";

const { width } = Dimensions.get("window");
const ALERT_RED = "#EF4444";
const ACTIVE_GREEN = "#10B981";

export default function TrackingScreen() {
  const { role } = useRole();
  const { theme } = useTheme();
  const isLender = role === "lender";

  const [vehicleLocation, setVehicleLocation] = useState({ lat: 19.076, lng: 72.8777 });
  const [isOutOfBoundary, setIsOutOfBoundary] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const GEOFENCE_RADIUS_KM = 50;
  const CENTER_POINT = { lat: 19.076, lng: 72.8777 };

  // Calculate Distance (Haversine Formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  const currentDistance = calculateDistance(
    CENTER_POINT.lat, CENTER_POINT.lng, 
    vehicleLocation.lat, vehicleLocation.lng
  );

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    
    // Continuous pulse animation for the "Live" indicator
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (currentDistance > GEOFENCE_RADIUS_KM && !isOutOfBoundary) {
      setIsOutOfBoundary(true);
      Alert.alert(
        "🚨 Boundary Warning",
        isLender ? "Vehicle has exited the allowed zone." : "You've crossed the boundary. Return to avoid penalties."
      );
    } else if (currentDistance <= GEOFENCE_RADIUS_KM && isOutOfBoundary) {
      setIsOutOfBoundary(false);
    }
  }, [vehicleLocation]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TopBar />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          
          {/* ✅ Status Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.title, { color: theme.text }]}>
                {isLender ? "Fleet Control" : "Trip Tracker"}
              </Text>
              <View style={styles.liveIndicator}>
                <Animated.View style={[styles.pulseDot, { opacity: pulseAnim }]} />
                <Text style={[styles.liveText, { color: theme.subText }]}>LIVE TELEMETRY</Text>
              </View>
            </View>
            <TouchableOpacity style={[styles.mapToggle, { backgroundColor: theme.card }]}>
              <Ionicons name="map-outline" size={20} color={theme.primary} />
            </TouchableOpacity>
          </View>

          {/* ✅ Distance Gauge Card */}
          <View style={[styles.gaugeCard, { backgroundColor: theme.card }]}>
            <View style={styles.gaugeInfo}>
              <Text style={[styles.gaugeLabel, { color: theme.subText }]}>Distance from Origin</Text>
              <Text style={[styles.gaugeValue, { color: isOutOfBoundary ? ALERT_RED : theme.text }]}>
                {currentDistance.toFixed(1)} <Text style={styles.unitText}>KM</Text>
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { 
                    width: `${Math.min((currentDistance / GEOFENCE_RADIUS_KM) * 100, 100)}%`,
                    backgroundColor: isOutOfBoundary ? ALERT_RED : theme.primary 
                  }
                ]} 
              />
            </View>
            <Text style={[styles.limitText, { color: theme.subText }]}>Limit: {GEOFENCE_RADIUS_KM} km</Text>
          </View>

          {/* ✅ Vehicle Info Section */}
          <View style={[styles.detailSection, { backgroundColor: isOutOfBoundary ? ALERT_RED + "10" : theme.card }]}>
            <View style={styles.detailHeader}>
              <View style={[styles.iconCircle, { backgroundColor: isOutOfBoundary ? ALERT_RED + "20" : theme.primary + "15" }]}>
                <MaterialCommunityIcons 
                  name={isOutOfBoundary ? "car-off" : "car-connected"} 
                  size={28} 
                  color={isOutOfBoundary ? ALERT_RED : theme.primary} 
                />
              </View>
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={[styles.carName, { color: theme.text }]}>Tata Nexon EV</Text>
                <Text style={[styles.vinText, { color: theme.subText }]}>ID: #NX-9920-B1</Text>
              </View>
              {isOutOfBoundary && (
                <View style={styles.errorTag}>
                  <Text style={styles.tagText}>BREACH</Text>
                </View>
              )}
            </View>

            <View style={styles.coordRow}>
              <View style={styles.coordItem}>
                <Text style={styles.coordLabel}>LATITUDE</Text>
                <Text style={[styles.coordVal, { color: theme.text }]}>{vehicleLocation.lat.toFixed(4)}</Text>
              </View>
              <View style={styles.verticalDivider} />
              <View style={styles.coordItem}>
                <Text style={styles.coordLabel}>LONGITUDE</Text>
                <Text style={[styles.coordVal, { color: theme.text }]}>{vehicleLocation.lng.toFixed(4)}</Text>
              </View>
            </View>
          </View>

          {/* ✅ Security Log */}
          <View style={[styles.logCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.logTitle, { color: theme.text }]}>Security Log</Text>
            <LogItem 
              icon="shield-check" 
              text="Blockchain Handshake Verified" 
              time="2m ago" 
              color={ACTIVE_GREEN} 
              theme={theme} 
            />
            <LogItem 
              icon={isOutOfBoundary ? "alert-circle" : "check-circle"} 
              text={isOutOfBoundary ? "Boundary Breach Detected" : "Within Geofence"} 
              time="Just now" 
              color={isOutOfBoundary ? ALERT_RED : theme.subText} 
              theme={theme} 
            />
          </View>

          <TouchableOpacity
            style={[styles.simulateBtn, { backgroundColor: theme.primary }]}
            onPress={() => setVehicleLocation({ lat: 20.5, lng: 73.0 })}
          >
            <Ionicons name="flask-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.simulateText}>Simulate Breach</Text>
          </TouchableOpacity>

        </Animated.View>
      </ScrollView>

      <BottomNav currentTab="Tracking" />
    </View>
  );
}

const LogItem = ({ icon, text, time, color, theme }) => (
  <View style={styles.logItem}>
    <MaterialCommunityIcons name={icon} size={18} color={color} />
    <Text style={[styles.logText, { color: theme.text }]}>{text}</Text>
    <Text style={[styles.logTime, { color: theme.subText }]}>{time}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 120 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 25 },
  title: { fontSize: 26, fontWeight: "900", letterSpacing: -0.5 },
  liveIndicator: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: ACTIVE_GREEN, marginRight: 6 },
  liveText: { fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  mapToggle: { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center", elevation: 2 },

  gaugeCard: { borderRadius: 24, padding: 20, marginBottom: 15, elevation: 3 },
  gaugeInfo: { marginBottom: 15 },
  gaugeLabel: { fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
  gaugeValue: { fontSize: 32, fontWeight: "900" },
  unitText: { fontSize: 16, fontWeight: "600" },
  progressBarBg: { height: 8, backgroundColor: "#00000010", borderRadius: 4, overflow: "hidden" },
  progressBarFill: { height: "100%", borderRadius: 4 },
  limitText: { fontSize: 11, marginTop: 8, textAlign: "right", fontWeight: "600" },

  detailSection: { borderRadius: 24, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: "#00000005" },
  detailHeader: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  iconCircle: { width: 56, height: 56, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  carName: { fontSize: 18, fontWeight: "800" },
  vinText: { fontSize: 12, marginTop: 2 },
  errorTag: { backgroundColor: ALERT_RED, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tagText: { color: "#FFF", fontSize: 10, fontWeight: "900" },

  coordRow: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#00000008", paddingTop: 15 },
  coordItem: { flex: 1, alignItems: "center" },
  coordLabel: { fontSize: 9, fontWeight: "800", color: "#94A3B8", marginBottom: 4 },
  coordVal: { fontSize: 14, fontWeight: "700", fontFamily: "monospace" },
  verticalDivider: { width: 1, backgroundColor: "#00000008" },

  logCard: { borderRadius: 24, padding: 20 },
  logTitle: { fontSize: 15, fontWeight: "800", marginBottom: 15 },
  logItem: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  logText: { flex: 1, fontSize: 13, marginLeft: 10, fontWeight: "500" },
  logTime: { fontSize: 11 },

  simulateBtn: { 
    marginTop: 20, 
    height: 56, 
    borderRadius: 16, 
    flexDirection: "row", 
    justifyContent: "center", 
    alignItems: "center",
    elevation: 4,
    shadowColor: ALERT_RED,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 }
  },
  simulateText: { color: "#FFF", fontWeight: "800", fontSize: 15 },
});