import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Dashboard() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back 👋</Text>
          <Text style={styles.userName}>Alex Morgan</Text>
        </View>
        <TouchableOpacity style={styles.avatarContainer}>
          <Ionicons name="person-circle-outline" size={44} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Quick Stats Grid */}
      <Text style={styles.sectionTitle}>Overview</Text>
      <View style={styles.statsGrid}>
        <View style={[styles.card, { backgroundColor: '#E3F2FD' }]}>
          <Ionicons name="wallet-outline" size={24} color="#1E88E5" />
          <Text style={styles.cardValue}>$12,450</Text>
          <Text style={styles.cardLabel}>Balance</Text>
        </View>

        <View style={[styles.card, { backgroundColor: '#E8F5E9' }]}>
          <Ionicons name="trending-up-outline" size={24} color="#43A047" />
          <Text style={styles.cardValue}>+18.5%</Text>
          <Text style={styles.cardLabel}>Growth</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtn}>
          <View style={styles.actionIconBg}>
            <Ionicons name="bar-chart-outline" size={22} color="#6200EE" />
          </View>
          <Text style={styles.actionText}>Analytics</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <View style={styles.actionIconBg}>
            <Ionicons name="notifications-outline" size={22} color="#6200EE" />
          </View>
          <Text style={styles.actionText}>Alerts</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <View style={styles.actionIconBg}>
            <Ionicons name="settings-outline" size={22} color="#6200EE" />
          </View>
          <Text style={styles.actionText}>Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Activity */}
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      <View style={styles.activityList}>
        <View style={styles.activityItem}>
          <Ionicons name="arrow-down-circle" size={28} color="#4CAF50" />
          <View style={styles.activityTextContainer}>
            <Text style={styles.activityTitle}>Payment Received</Text>
            <Text style={styles.activitySubtitle}>Today, 2:15 PM</Text>
          </View>
          <Text style={styles.activityAmount}>+$250.00</Text>
        </View>

        <View style={styles.activityItem}>
          <Ionicons name="arrow-up-circle" size={28} color="#F44336" />
          <View style={styles.activityTextContainer}>
            <Text style={styles.activityTitle}>Subscription Fee</Text>
            <Text style={styles.activitySubtitle}>Yesterday, 11:30 AM</Text>
          </View>
          <Text style={styles.activityAmount}>-$12.99</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  content: { padding: 20, paddingTop: 60 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: { fontSize: 14, color: '#666' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#111' },
  avatarContainer: { padding: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 12, marginTop: 16 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    justifyContent: 'center',
  },
  cardValue: { fontSize: 20, fontWeight: 'bold', color: '#111', marginTop: 8 },
  cardLabel: { fontSize: 12, color: '#666', marginTop: 2 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 },
  actionBtn: { alignItems: 'center', flex: 1 },
  actionIconBg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EDE7F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionText: { fontSize: 12, color: '#444', fontWeight: '500' },
  activityList: { backgroundColor: '#FFF', borderRadius: 16, padding: 8, elevation: 1 },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  activityTextContainer: { flex: 1, marginLeft: 12 },
  activityTitle: { fontSize: 14, fontWeight: '600', color: '#222' },
  activitySubtitle: { fontSize: 12, color: '#888', marginTop: 2 },
  activityAmount: { fontSize: 14, fontWeight: '600', color: '#222' },
});