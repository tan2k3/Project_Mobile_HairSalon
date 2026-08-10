import React, { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import {
  Appbar,
  Card,
  Chip,
  Text,
  useTheme,
} from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { bookingService } from '../../services/bookingService';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { EmptyState } from '../../components/EmptyState';
import { Booking } from '../../types/booking';
import {
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
} from '../../constants/bookingStatus';

export const MyBookingsScreen = ({ navigation }: any) => {
  const theme = useTheme();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: bookings, isLoading, refetch } = useQuery({
    queryKey: ['myBookings'],
    queryFn: () => bookingService.getMyBookings(),
  });

  const filteredBookings = (bookings || []).filter(
    (b) => statusFilter === 'all' || b.status === statusFilter
  );

  if (isLoading) {
    return <LoadingOverlay message="Fetching your appointment history..." />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header elevated>
        {navigation.canGoBack() && (
          <Appbar.BackAction onPress={() => navigation.goBack()} />
        )}
        <Appbar.Content title="My Appointments" />
        <Appbar.Action
          icon="home-outline"
          onPress={() => navigation.navigate('CustomerMainTabs', { screen: 'HomeTab' })}
        />
      </Appbar.Header>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { value: 'all', label: 'All' },
            { value: 'pending', label: 'Pending' },
            { value: 'confirmed', label: 'Confirmed' },
            { value: 'completed', label: 'Completed' },
            { value: 'canceled', label: 'Canceled' },
          ].map((item) => (
            <Chip
              key={item.value}
              mode={statusFilter === item.value ? 'flat' : 'outlined'}
              selected={statusFilter === item.value}
              onPress={() => setStatusFilter(item.value)}
              showSelectedCheck={false}
              style={{ marginRight: 8 }}
            >
              {item.label}
            </Chip>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.id}
        refreshing={isLoading}
        onRefresh={refetch}
        contentContainerStyle={
          filteredBookings.length === 0 ? styles.emptyList : styles.list
        }
        ListEmptyComponent={
          <EmptyState
            icon="calendar-blank"
            title="No Bookings Found"
            description="You don't have any appointments matching this filter."
            actionLabel="Book Haircut Now"
            onAction={() => navigation.navigate('BookAppointment')}
          />
        }
        renderItem={({ item }: { item: Booking }) => {
          const statusColor = BOOKING_STATUS_COLORS[item.status] || '#757575';
          return (
            <Card
              mode="outlined"
              style={styles.card}
              onPress={() => navigation.navigate('BookingDetail', { booking: item })}
            >
              <Card.Title
                title={`Code: ${item.bookingCode}`}
                subtitle={`Date: ${item.bookingDate} • ${item.timeSlot}`}
                right={() => (
                  <Chip
                    compact
                    style={{
                      backgroundColor: statusColor + '20',
                      marginRight: 16,
                    }}
                    textStyle={{ color: statusColor, fontWeight: 'bold' }}
                  >
                    {BOOKING_STATUS_LABELS[item.status]}
                  </Chip>
                )}
              />
              <Card.Content>
                <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                  Stylist: {item.stylistName}
                </Text>
                <Text variant="bodySmall" style={{ opacity: 0.7, marginTop: 2 }}>
                  Services: {item.services.map((s) => s.title).join(', ')}
                </Text>
                <Text
                  variant="titleMedium"
                  style={{
                    color: theme.colors.primary,
                    fontWeight: 'bold',
                    marginTop: 8,
                  }}
                >
                  Total Price: ${item.totalAmount}
                </Text>
              </Card.Content>
            </Card>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  emptyList: {
    flexGrow: 1,
  },
  card: {
    borderRadius: 16,
  },
});
