import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Appbar,
  Button,
  Card,
  Divider,
  List,
  Snackbar,
  Surface,
  Text,
  useTheme,
} from 'react-native-paper';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '../../services/bookingService';
import {
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
  BookingStatus,
} from '../../constants/bookingStatus';
import { Booking } from '../../types/booking';

export const BookingDetailScreen = ({ navigation, route }: any) => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const booking: Booking = route?.params?.booking || {
    id: 'bk_1',
    bookingCode: 'BK-8892',
    customerName: 'Alex Johnson',
    customerPhone: '0901234567',
    stylistName: 'David Miller',
    services: [
      {
        id: 'srv_1',
        title: 'Executive Gentleman Haircut',
        price: 25,
        durationMinutes: 45,
      },
    ],
    bookingDate: '2026-08-10',
    timeSlot: '09:00 AM',
    status: BookingStatus.PENDING,
    totalAmount: 25,
    paymentStatus: 'UNPAID',
  };

  const cancelMutation = useMutation({
    mutationFn: () => bookingService.cancelBooking(booking.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      setSnackbarMessage('Appointment cancelled successfully.');
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    },
  });

  const statusColor = BOOKING_STATUS_COLORS[booking.status] || '#757575';
  const canModify =
    booking.status === BookingStatus.PENDING ||
    booking.status === BookingStatus.CONFIRMED;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={`Booking #${booking.bookingCode}`} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Banner Card */}
        <Surface
          style={[styles.banner, { backgroundColor: statusColor + '20' }]}
          elevation={1}
        >
          <Text variant="titleMedium" style={{ color: statusColor, fontWeight: 'bold' }}>
            STATUS: {BOOKING_STATUS_LABELS[booking.status].toUpperCase()}
          </Text>
          <Text variant="bodySmall" style={{ opacity: 0.8, marginTop: 4 }}>
            Appointment Code: {booking.bookingCode}
          </Text>
        </Surface>

        {/* Appointment Details */}
        <Card mode="outlined" style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionHeader}>
              Appointment Information
            </Text>
            <List.Item
              title="Customer Name"
              description={booking.customerName}
              left={(p) => <List.Icon {...p} icon="account" />}
            />
            <List.Item
              title="Assigned Stylist"
              description={booking.stylistName}
              left={(p) => <List.Icon {...p} icon="account-badge-outline" />}
            />
            <List.Item
              title="Scheduled Date & Time"
              description={`${booking.bookingDate} at ${booking.timeSlot}`}
              left={(p) => <List.Icon {...p} icon="calendar-clock" />}
            />
            {booking.notes ? (
              <List.Item
                title="Customer Notes"
                description={booking.notes}
                left={(p) => <List.Icon {...p} icon="note-text-outline" />}
              />
            ) : null}
          </Card.Content>
        </Card>

        {/* Itemized Services Breakdown */}
        <Card mode="outlined" style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionHeader}>
              Itemized Service List
            </Text>
            {booking.services.map((srv, idx) => (
              <List.Item
                key={idx}
                title={srv.title}
                description={`${srv.durationMinutes || 30} mins`}
                right={() => (
                  <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                    ${srv.price}
                  </Text>
                )}
              />
            ))}
            <Divider style={{ marginVertical: 12 }} />
            <View style={styles.totalRow}>
              <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                Final Total:
              </Text>
              <Text
                variant="headlineSmall"
                style={{ color: theme.colors.primary, fontWeight: 'bold' }}
              >
                ${booking.totalAmount}
              </Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Contextual Bottom Actions */}
      {canModify && (
        <Surface elevation={2} style={styles.bottomBar}>
          <Button
            mode="contained-tonal"
            icon="calendar-sync"
            style={{ flex: 1 }}
            onPress={() => navigation.navigate('BookAppointment')}
          >
            Reschedule
          </Button>
          <Button
            mode="contained"
            buttonColor={theme.colors.error}
            icon="close-circle"
            style={{ flex: 1 }}
            loading={cancelMutation.isPending}
            disabled={cancelMutation.isPending}
            onPress={() => cancelMutation.mutate()}
          >
            Cancel
          </Button>
        </Surface>
      )}

      <Snackbar
        visible={!!snackbarMessage}
        onDismiss={() => setSnackbarMessage('')}
        duration={2000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 90,
  },
  banner: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  card: {
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
});
