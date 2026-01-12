import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  Vibration,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

interface Props {
  email: string;
  onLogout: () => void;
}

interface EmergencyType {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

interface Contact {
  id: string;
  name: string;
  phone: string;
  isPrimary: boolean;
}

interface AlertHistory {
  id: string;
  type: string;
  timestamp: Date;
  location: string;
  status: 'sent' | 'received' | 'resolved';
}

const emergencyTypes: EmergencyType[] = [
  { id: 'medical', name: 'Medical Emergency', icon: 'heart', color: '#DC2626' },
  { id: 'fire', name: 'Fire', icon: 'flame', color: '#EA580C' },
  { id: 'crime', name: 'Crime/Threat', icon: 'shield', color: '#7C3AED' },
  { id: 'accident', name: 'Accident', icon: 'car', color: '#D97706' },
  { id: 'natural', name: 'Natural Disaster', icon: 'thunderstorm', color: '#7C3AED' },
  { id: 'other', name: 'Other Emergency', icon: 'warning', color: '#D97706' },
];

type TabType = 'emergency' | 'iot' | 'contacts' | 'history' | 'settings';

export default function UserDashboard({ email, onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('emergency');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedEmergency, setSelectedEmergency] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [alertHistory, setAlertHistory] = useState<AlertHistory[]>([]);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [iotConnected, setIotConnected] = useState(false);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Location permission denied');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(loc);
    } catch (error) {
      setLocationError('Unable to get location');
    }
  };

  const sendEmergencyAlert = async (type: string) => {
    if (contacts.length === 0) {
      Alert.alert('No Contacts', 'Please add emergency contacts before sending alerts.');
      return;
    }

    setSelectedEmergency(type);
    setIsSending(true);
    Vibration.vibrate(200);

    setTimeout(() => {
      setIsSending(false);
      setSelectedEmergency(null);
      
      const newAlert: AlertHistory = {
        id: Date.now().toString(),
        type,
        timestamp: new Date(),
        location: location ? `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}` : 'Unknown',
        status: 'sent',
      };
      setAlertHistory(prev => [newAlert, ...prev]);

      Alert.alert(
        '✓ Alert Sent',
        `Your ${type} alert has been sent to ${contacts.length} emergency contact(s). Help is on the way.`,
        [{ text: 'OK' }]
      );
    }, 2000);
  };

  const handleEmergencyPress = (type: EmergencyType) => {
    if (contacts.length === 0) {
      Alert.alert(
        'Add Contacts First',
        'Please add emergency contacts before sending alerts.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      `${type.name}`,
      `Send ${type.name.toLowerCase()} alert to your emergency contacts?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send Alert', 
          style: 'destructive',
          onPress: () => sendEmergencyAlert(type.name)
        },
      ]
    );
  };

  const handleSOSPress = () => {
    Vibration.vibrate(300);
    Alert.alert(
      '🚨 SOS Emergency',
      'This will send an urgent alert to ALL emergency contacts and nearby responders. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'SEND SOS', 
          style: 'destructive',
          onPress: () => sendEmergencyAlert('SOS')
        },
      ]
    );
  };

  const addContact = () => {
    if (!newContactName.trim() || !newContactPhone.trim()) {
      Alert.alert('Error', 'Please enter both name and phone number.');
      return;
    }

    const newContact: Contact = {
      id: Date.now().toString(),
      name: newContactName.trim(),
      phone: newContactPhone.trim(),
      isPrimary: contacts.length === 0,
    };

    setContacts(prev => [...prev, newContact]);
    setNewContactName('');
    setNewContactPhone('');
    Alert.alert('Success', 'Contact added successfully.');
  };

  const deleteContact = (id: string) => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to delete this contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => setContacts(prev => prev.filter(c => c.id !== id))
        },
      ]
    );
  };

  const tabs: { id: TabType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { id: 'emergency', label: 'Emergency', icon: 'location' },
    { id: 'iot', label: 'IoT Device', icon: 'radio' },
    { id: 'contacts', label: 'Contacts', icon: 'people' },
    { id: 'history', label: 'History', icon: 'time' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  const renderEmergencyTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* GPS Status Card */}
      <View style={styles.gpsCard}>
        <View style={styles.gpsHeader}>
          <Ionicons name="navigate" size={24} color="#059669" />
          <Text style={styles.gpsTitle}>GPS Status</Text>
          <View style={[styles.gpsBadge, { backgroundColor: location ? '#D1FAE5' : '#FEE2E2' }]}>
            <Text style={[styles.gpsBadgeText, { color: location ? '#059669' : '#DC2626' }]}>
              {location ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
        {location ? (
          <View style={styles.gpsDetails}>
            <Text style={styles.gpsCoord}>Lat: {location.coords.latitude.toFixed(6)}</Text>
            <Text style={styles.gpsCoord}>Long: {location.coords.longitude.toFixed(6)}</Text>
            <Text style={styles.gpsCoord}>Accuracy: ±{location.coords.accuracy?.toFixed(0) || 10}m</Text>
          </View>
        ) : (
          <Text style={styles.gpsError}>{locationError || 'Getting location...'}</Text>
        )}
        <View style={styles.gpsNote}>
          <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
          <Text style={styles.gpsNoteText}>Using simulated GPS location</Text>
        </View>
      </View>

      {/* Emergency Alert Section */}
      <Text style={styles.sectionTitle}>Emergency Alert</Text>
      <Text style={styles.sectionSubtitle}>Select emergency type to send alert</Text>

      {/* Warning if no contacts */}
      {contacts.length === 0 && (
        <View style={styles.warningCard}>
          <Ionicons name="warning" size={20} color="#D97706" />
          <Text style={styles.warningText}>Please add emergency contacts before sending alerts</Text>
        </View>
      )}

      {/* Emergency Grid */}
      <View style={styles.emergencyGrid}>
        {emergencyTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.emergencyCard,
              { backgroundColor: type.color },
              selectedEmergency === type.name && styles.emergencyCardActive
            ]}
            onPress={() => handleEmergencyPress(type)}
            disabled={isSending}
          >
            <Ionicons name={type.icon} size={32} color="#FFF" />
            <Text style={styles.emergencyName}>{type.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick SOS */}
      <Text style={styles.sectionTitle}>Quick SOS</Text>
      <TouchableOpacity
        style={styles.sosButton}
        onPress={handleSOSPress}
        disabled={isSending}
      >
        <View style={styles.sosInner}>
          <Ionicons name="alert-circle" size={48} color="#FFF" />
          <Text style={styles.sosText}>SOS</Text>
          <Text style={styles.sosSubtext}>Press for immediate help</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderIoTTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>IoT Panic Button</Text>
      
      <View style={styles.iotCard}>
        <View style={styles.iotIconContainer}>
          <Ionicons name="radio" size={48} color={iotConnected ? '#059669' : '#9CA3AF'} />
        </View>
        <Text style={styles.iotStatus}>
          {iotConnected ? 'Device Connected' : 'No Device Connected'}
        </Text>
        <Text style={styles.iotDescription}>
          Connect your IoT panic button device to send emergency alerts with a single press.
        </Text>
        <TouchableOpacity
          style={[styles.iotButton, iotConnected && styles.iotButtonDisconnect]}
          onPress={() => setIotConnected(!iotConnected)}
        >
          <Text style={styles.iotButtonText}>
            {iotConnected ? 'Disconnect Device' : 'Scan for Devices'}
          </Text>
        </TouchableOpacity>
      </View>

      {iotConnected && (
        <View style={styles.iotInfoCard}>
          <Ionicons name="checkmark-circle" size={24} color="#059669" />
          <View style={styles.iotInfoContent}>
            <Text style={styles.iotInfoTitle}>Panic Button Ready</Text>
            <Text style={styles.iotInfoText}>Press the physical button to send an SOS alert.</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );

  const renderContactsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Emergency Contacts</Text>
      <Text style={styles.sectionSubtitle}>Add people to notify during emergencies</Text>

      {/* Add Contact Form */}
      <View style={styles.addContactForm}>
        <TextInput
          style={styles.input}
          placeholder="Contact Name"
          value={newContactName}
          onChangeText={setNewContactName}
          placeholderTextColor="#9CA3AF"
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={newContactPhone}
          onChangeText={setNewContactPhone}
          keyboardType="phone-pad"
          placeholderTextColor="#9CA3AF"
        />
        <TouchableOpacity style={styles.addButton} onPress={addContact}>
          <Ionicons name="add" size={20} color="#FFF" />
          <Text style={styles.addButtonText}>Add Contact</Text>
        </TouchableOpacity>
      </View>

      {/* Contact List */}
      {contacts.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No contacts added yet</Text>
        </View>
      ) : (
        contacts.map((contact) => (
          <View key={contact.id} style={styles.contactCard}>
            <View style={styles.contactAvatar}>
              <Text style={styles.contactInitial}>{contact.name[0].toUpperCase()}</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.contactPhone}>{contact.phone}</Text>
            </View>
            {contact.isPrimary && (
              <View style={styles.primaryBadge}>
                <Text style={styles.primaryText}>Primary</Text>
              </View>
            )}
            <TouchableOpacity onPress={() => deleteContact(contact.id)}>
              <Ionicons name="trash-outline" size={20} color="#DC2626" />
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderHistoryTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Alert History</Text>
      
      {alertHistory.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="time-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No alerts sent yet</Text>
        </View>
      ) : (
        alertHistory.map((alert) => (
          <View key={alert.id} style={styles.historyCard}>
            <View style={styles.historyIcon}>
              <Ionicons name="alert-circle" size={24} color="#DC2626" />
            </View>
            <View style={styles.historyInfo}>
              <Text style={styles.historyType}>{alert.type}</Text>
              <Text style={styles.historyLocation}>📍 {alert.location}</Text>
              <Text style={styles.historyTime}>
                {alert.timestamp.toLocaleString()}
              </Text>
            </View>
            <View style={[styles.statusBadge, 
              { backgroundColor: alert.status === 'resolved' ? '#D1FAE5' : '#FEF3C7' }
            ]}>
              <Text style={[styles.statusText,
                { color: alert.status === 'resolved' ? '#059669' : '#D97706' }
              ]}>
                {alert.status}
              </Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderSettingsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Settings</Text>

      <View style={styles.settingsCard}>
        <Text style={styles.settingsLabel}>Account</Text>
        <Text style={styles.settingsValue}>{email}</Text>
      </View>

      <View style={styles.settingsCard}>
        <Text style={styles.settingsLabel}>Contacts</Text>
        <Text style={styles.settingsValue}>{contacts.length} saved</Text>
      </View>

      <View style={styles.settingsCard}>
        <Text style={styles.settingsLabel}>Alerts Sent</Text>
        <Text style={styles.settingsValue}>{alertHistory.length}</Text>
      </View>

      <View style={styles.settingsCard}>
        <Text style={styles.settingsLabel}>IoT Device</Text>
        <Text style={styles.settingsValue}>{iotConnected ? 'Connected' : 'Not Connected'}</Text>
      </View>

      <View style={styles.settingsCard}>
        <Text style={styles.settingsLabel}>App Version</Text>
        <Text style={styles.settingsValue}>1.0.0</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Ionicons name="log-out-outline" size={20} color="#FFF" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Main Content */}
      {activeTab === 'emergency' && renderEmergencyTab()}
      {activeTab === 'iot' && renderIoTTab()}
      {activeTab === 'contacts' && renderContactsTab()}
      {activeTab === 'history' && renderHistoryTab()}
      {activeTab === 'settings' && renderSettingsTab()}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={styles.navItem}
            onPress={() => setActiveTab(tab.id)}
          >
            <Ionicons
              name={tab.icon}
              size={24}
              color={activeTab === tab.id ? '#DC2626' : '#9CA3AF'}
            />
            <Text style={[
              styles.navLabel,
              { color: activeTab === tab.id ? '#DC2626' : '#9CA3AF' }
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  gpsCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  gpsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  gpsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  gpsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  gpsBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  gpsDetails: {
    gap: 4,
  },
  gpsCoord: {
    fontSize: 14,
    color: '#4B5563',
  },
  gpsError: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  gpsNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  gpsNoteText: {
    fontSize: 12,
    color: '#6B7280',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 4,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
  },
  emergencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  emergencyCard: {
    width: (width - 44) / 2,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyCardActive: {
    opacity: 0.7,
  },
  emergencyName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginTop: 8,
    textAlign: 'center',
  },
  sosButton: {
    backgroundColor: '#DC2626',
    borderRadius: 24,
    marginBottom: 24,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  sosInner: {
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  sosText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 8,
  },
  sosSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  iotCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  iotIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iotStatus: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  iotDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  iotButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  iotButtonDisconnect: {
    backgroundColor: '#DC2626',
  },
  iotButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  iotInfoCard: {
    flexDirection: 'row',
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  iotInfoContent: {
    flex: 1,
  },
  iotInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 4,
  },
  iotInfoText: {
    fontSize: 14,
    color: '#047857',
  },
  addContactForm: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    color: '#1F2937',
  },
  addButton: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  contactAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInitial: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  contactPhone: {
    fontSize: 14,
    color: '#6B7280',
  },
  primaryBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  primaryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  historyIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  historyLocation: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  historyTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  settingsCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingsLabel: {
    fontSize: 16,
    color: '#1F2937',
  },
  settingsValue: {
    fontSize: 16,
    color: '#6B7280',
  },
  logoutButton: {
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: 20,
    paddingTop: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navLabel: {
    fontSize: 10,
    marginTop: 4,
  },
});
