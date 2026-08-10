import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Appbar,
  Avatar,
  Button,
  Card,
  Chip,
  Text,
  useTheme,
} from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { bookingService } from '../../services/bookingService';
import { useAppSelector } from '../../store';

export const CustomerHomeScreen = ({ navigation }: any) => {
  const theme = useTheme();
  const user = useAppSelector((state) => state.auth.user);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: services } = useQuery({
    queryKey: ['services'],
    queryFn: () => bookingService.getServices(),
  });

  const categories = [
    { id: 'all', name: 'All Services' },
    { id: 'cat_1', name: 'Haircuts' },
    { id: 'cat_2', name: 'Styling & Perm' },
    { id: 'cat_3', name: 'Coloring' },
    { id: 'cat_4', name: 'Spa & Care' },
  ];

  const filteredServices = (services || []).filter(
    (s) => selectedCategory === 'all' || s.categoryId === selectedCategory
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header elevated>
        <Appbar.Content
          title={`Hello, ${user?.fullName ? user.fullName.split(' ')[0] : 'Alex'}!`}
          subtitle="Ready for a fresh new look?"
        />
        <Appbar.Action
          icon="bell-outline"
          onPress={() => navigation.navigate('NotificationPanel')}
        />
        <View style={{ paddingRight: 12 }}>
          <Avatar.Image
            size={36}
            source={{
              uri:
                user?.avatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
            }}
          />
        </View>
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Hero Banner Section */}
        <Card mode="contained" style={styles.heroCard}>
          <Card.Content style={styles.heroContent}>
            <Text variant="headlineSmall" style={styles.heroTitle}>
              Need a Haircut?
            </Text>
            <Text variant="bodyMedium" style={styles.heroSubtitle}>
              Book top master stylists in town with zero wait time.
            </Text>
            <Button
              mode="contained"
              icon="calendar-check"
              buttonColor={theme.colors.primary}
              textColor={theme.colors.onPrimary}
              style={styles.heroButton}
              onPress={() => navigation.navigate('BookAppointment')}
            >
              BOOK APPOINTMENT NOW
            </Button>
          </Card.Content>
        </Card>

        {/* Quick Action Grid */}
        <View style={styles.quickGrid}>
          <Button
            mode="outlined"
            icon="scissors-cutting"
            style={styles.quickBtn}
            onPress={() => navigation.navigate('ServicesTab')}
          >
            Services
          </Button>
          <Button
            mode="outlined"
            icon="account-group"
            style={styles.quickBtn}
            onPress={() => navigation.navigate('StylistsTab')}
          >
            Stylists
          </Button>
          <Button
            mode="outlined"
            icon="information-outline"
            style={styles.quickBtn}
            onPress={() => navigation.navigate('AboutSalon')}
          >
            About Us
          </Button>
        </View>

        {/* Category Filter Horizontal Scroll */}
        <Text variant="titleMedium" style={styles.sectionHeader}>
          Popular Categories
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {categories.map((cat) => (
            <Chip
              key={cat.id}
              mode={selectedCategory === cat.id ? 'flat' : 'outlined'}
              selected={selectedCategory === cat.id}
              onPress={() => setSelectedCategory(cat.id)}
              style={styles.chip}
            >
              {cat.name}
            </Chip>
          ))}
        </ScrollView>

        {/* Promotional Carousel Showcase */}
        <Text variant="titleMedium" style={[styles.sectionHeader, { marginTop: 16 }]}>
          Featured Salon Services
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.promoRow}>
          {filteredServices.map((srv) => (
            <Card
              key={srv.id}
              mode="outlined"
              style={styles.promoCard}
              onPress={() => navigation.navigate('ServiceDetail', { serviceId: srv.id, service: srv })}
            >
              <Card.Cover source={{ uri: srv.imageUrl }} style={styles.cardImage} />
              <Card.Content style={{ padding: 12 }}>
                <Text variant="titleSmall" numberOfLines={1} style={{ fontWeight: 'bold' }}>
                  {srv.title}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.primary, marginTop: 4 }}>
                  ${srv.price} • {srv.durationMinutes} mins
                </Text>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  heroCard: {
    backgroundColor: '#1E1B2E',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  heroContent: {
    padding: 20,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  heroSubtitle: {
    color: '#D1CBDD',
    marginVertical: 8,
  },
  heroButton: {
    marginTop: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  quickGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  quickBtn: {
    flex: 1,
    borderRadius: 8,
  },
  sectionHeader: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  chip: {
    marginRight: 8,
  },
  promoRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  promoCard: {
    width: 200,
    marginRight: 12,
    borderRadius: 12,
  },
  cardImage: {
    height: 120,
  },
});
