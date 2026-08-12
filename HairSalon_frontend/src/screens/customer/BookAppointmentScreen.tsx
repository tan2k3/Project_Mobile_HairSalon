import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  Appbar,
  Avatar,
  Button,
  Chip,
  Icon,
  Snackbar,
  Surface,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { DatePickerModal, en, registerTranslation } from 'react-native-paper-dates';
import { useMutation, useQuery } from '@tanstack/react-query';
import { bookingService } from '../../services/bookingService';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { useAppSelector } from '../../store';

registerTranslation('en', en);

export const BookAppointmentScreen = ({ navigation, route }: any) => {
  const theme = useTheme();
  const user = useAppSelector((state) => state.auth.user);

  const initialServiceId = route?.params?.selectedServiceId || 'srv_1';
  const initialStylistId = route?.params?.selectedStylistId || 'usr_stylist_1';

  const upcomingDates = React.useMemo(() => {
    const datesList = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dayLabel =
        i === 0
          ? 'Today'
          : i === 1
          ? 'Tomorrow'
          : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      datesList.push({ label: dayLabel, value: `${yyyy}-${mm}-${dd}` });
    }
    return datesList;
  }, []);

  const [selectedServiceId, setSelectedServiceId] = useState(initialServiceId);
  const [selectedDate, setSelectedDate] = useState(upcomingDates[0].value);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('09:30 AM');
  const [selectedStylistId, setSelectedStylistId] = useState(initialStylistId);
  const [notes, setNotes] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [openDatePicker, setOpenDatePicker] = useState(false);

  const isSlotInPast = React.useCallback((dateStr: string, slotStr: string): boolean => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    if (dateStr !== todayStr) return false;

    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [time, period] = slotStr.split(' ');
    const [hoursStr, minsStr] = time.split(':');
    let hours = parseInt(hoursStr, 10);
    const mins = parseInt(minsStr, 10);
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    const slotMinutes = hours * 60 + mins;
    return slotMinutes <= currentMinutes;
  }, []);

  const { data: services, isLoading: loadingServices } = useQuery({
    queryKey: ['services'],
    queryFn: () => bookingService.getServices(),
  });

  const { data: stylists, isLoading: loadingStylists } = useQuery({
    queryKey: ['stylists'],
    queryFn: () => bookingService.getStylists(),
  });

  const timeSlots = [
    '08:00 AM',
    '08:45 AM',
    '09:30 AM',
    '10:15 AM',
    '11:00 AM',
    '11:45 AM',
    '12:30 PM',
    '01:15 PM',
    '02:00 PM',
    '02:45 PM',
    '03:30 PM',
    '04:15 PM',
    '05:00 PM',
    '05:45 PM',
    '06:30 PM',
    '07:15 PM',
    '08:00 PM',
    '08:45 PM',
  ];

  const chosenService = (services || []).find((s) => s.id === selectedServiceId) || {
    price: 25,
    title: 'Haircut',
  };

  const createMutation = useMutation({
    mutationFn: () =>
      bookingService.createBooking({
        serviceIds: [selectedServiceId],
        stylistId: selectedStylistId,
        bookingDate: selectedDate,
        timeSlot: selectedTimeSlot,
        notes,
        customerName: user?.fullName || 'Alex Johnson',
        customerPhone: user?.phone || '0901234567',
      }),
    onSuccess: () => {
      setSnackbarVisible(true);
      setTimeout(() => {
        navigation.navigate('CustomerMainTabs', { screen: 'MyBookingsTab' });
      }, 1500);
    },
  });

  if (loadingServices || loadingStylists) {
    return <LoadingOverlay message="Preparing booking wizard..." />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Book Appointment" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Step 1: Select Service */}
        <Text variant="titleMedium" style={styles.stepTitle}>
          Step 1: Choose Service
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow}>
          {(services || []).map((srv) => (
            <Chip
              key={srv.id}
              icon="content-cut"
              mode={selectedServiceId === srv.id ? 'flat' : 'outlined'}
              selected={selectedServiceId === srv.id}
              onPress={() => setSelectedServiceId(srv.id)}
              style={styles.chip}
            >
              {srv.title} (${srv.price})
            </Chip>
          ))}
        </ScrollView>

        {/* Step 2: Date Picker */}
        <Text variant="titleMedium" style={styles.stepTitle}>
          Step 2: Choose Date
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow}>
          {upcomingDates.map((d) => (
            <Chip
              key={d.value}
              icon="calendar-today"
              mode={selectedDate === d.value ? 'flat' : 'outlined'}
              selected={selectedDate === d.value}
              onPress={() => setSelectedDate(d.value)}
              style={styles.chip}
            >
              {d.label}
            </Chip>
          ))}
          <Chip
            icon="calendar"
            mode="outlined"
            onPress={() => setOpenDatePicker(true)}
            style={styles.chip}
          >
            Custom Date: {selectedDate}
          </Chip>
        </ScrollView>

        <DatePickerModal
          locale="en"
          mode="single"
          visible={openDatePicker}
          onDismiss={() => setOpenDatePicker(false)}
          date={new Date(selectedDate)}
          validRange={{ startDate: new Date() }}
          onConfirm={(params) => {
            setOpenDatePicker(false);
            if (params.date) {
              const yyyy = params.date.getFullYear();
              const mm = String(params.date.getMonth() + 1).padStart(2, '0');
              const dd = String(params.date.getDate()).padStart(2, '0');
              setSelectedDate(`${yyyy}-${mm}-${dd}`);
            }
          }}
        />

        {/* Step 3: Select Time Slot */}
        <Text variant="titleMedium" style={styles.stepTitle}>
          Step 3: Select Time Slot
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow}>
          {timeSlots.map((slot) => {
            const disabled = isSlotInPast(selectedDate, slot);
            return (
              <Chip
                key={slot}
                icon="clock-outline"
                mode={selectedTimeSlot === slot ? 'flat' : 'outlined'}
                selected={selectedTimeSlot === slot}
                disabled={disabled}
                onPress={() => !disabled && setSelectedTimeSlot(slot)}
                showSelectedCheck={false}
                style={[
                  styles.chip,
                  disabled && { opacity: 0.4, backgroundColor: theme.colors.surfaceDisabled },
                ]}
              >
                {slot} {disabled ? '(Passed)' : ''}
              </Chip>
            );
          })}
        </ScrollView>

        {/* Step 4: Stylist Avatar List */}
        <Text variant="titleMedium" style={styles.stepTitle}>
          Step 4: Select Master Stylist
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow}>
          {(stylists || []).map((st) => {
            const isSelected = selectedStylistId === st.id;
            return (
              <TouchableOpacity
                key={st.id}
                onPress={() => setSelectedStylistId(st.id)}
                style={[
                  styles.stylistCard,
                  isSelected && {
                    borderColor: theme.colors.primary,
                    backgroundColor: theme.colors.primaryContainer,
                  },
                ]}
              >
                <Avatar.Image size={54} source={{ uri: st.avatarUrl }} />
                <Text variant="bodyMedium" style={{ fontWeight: 'bold', marginTop: 6 }}>
                  {st.fullName}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 }}>
                  <Icon source="star" size={14} color="#FFB300" />
                  <Text variant="bodySmall" style={{ opacity: 0.8, color: '#FFB300', fontWeight: 'bold' }}>
                    {st.rating}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Step 5: Special Notes */}
        <Text variant="titleMedium" style={styles.stepTitle}>
          Special Requests / Notes
        </Text>
        <TextInput
          label="Special requests for your haircut"
          mode="outlined"
          left={<TextInput.Icon icon="notebook-edit-outline" />}
          multiline
          numberOfLines={3}
          value={notes}
          onChangeText={setNotes}
          placeholder="e.g. Wash hair after cut, low fade style..."
        />
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <Surface elevation={2} style={styles.bottomBar}>
        <View style={styles.totalRow}>
          <Text variant="bodyMedium">Total Due:</Text>
          <Text variant="titleLarge" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
            ${chosenService.price}
          </Text>
        </View>
        <Button
          mode="contained"
          icon="check"
          onPress={() => createMutation.mutate()}
          loading={createMutation.isPending}
          disabled={createMutation.isPending}
          style={styles.confirmBtn}
          contentStyle={{ paddingVertical: 6 }}
        >
          CONFIRM BOOKING
        </Button>
      </Surface>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
      >
        Appointment booked successfully!
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 110,
  },
  stepTitle: {
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  scrollRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  chip: {
    marginRight: 8,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  timeChip: {
    width: '23%',
    alignItems: 'center',
  },
  stylistCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    marginRight: 12,
    width: 110,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalRow: {
    justifyContent: 'center',
  },
  confirmBtn: {
    borderRadius: 8,
  },
});
