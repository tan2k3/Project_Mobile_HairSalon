import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Appbar,
  Button,
  Chip,
  HelperText,
  Menu,
  Snackbar,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '../../services/bookingService';
import { LoadingOverlay } from '../../components/LoadingOverlay';

const staffBookingSchema = z.object({
  customerName: z.string().min(2, 'Customer name is required'),
  customerPhone: z.string().min(9, 'Phone number must be at least 9 digits'),
  serviceId: z.string().min(1, 'Please select a service'),
  stylistId: z.string().min(1, 'Please select a stylist'),
  bookingDate: z.string().min(1, 'Select a date'),
  timeSlot: z.string().min(1, 'Select a time slot'),
  notes: z.string().optional(),
});

type StaffBookingValues = z.infer<typeof staffBookingSchema>;

export const StaffBookingFormScreen = ({ navigation }: any) => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [openDatePicker, setOpenDatePicker] = useState(false);

  const [stylistMenuVisible, setStylistMenuVisible] = useState(false);
  const [serviceMenuVisible, setServiceMenuVisible] = useState(false);

  const { data: services, isLoading: loadingServices } = useQuery({
    queryKey: ['services'],
    queryFn: () => bookingService.getServices(),
  });

  const { data: stylists, isLoading: loadingStylists } = useQuery({
    queryKey: ['stylists'],
    queryFn: () => bookingService.getStylists(),
  });

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

  const timeSlotsList = [
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

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StaffBookingValues>({
    resolver: zodResolver(staffBookingSchema),
    defaultValues: {
      customerName: '',
      customerPhone: '',
      serviceId: 'srv_1',
      stylistId: 'usr_stylist_1',
      bookingDate: upcomingDates[0].value,
      timeSlot: '09:30 AM',
      notes: '',
    },
  });

  const selectedServiceId = watch('serviceId');
  const selectedStylistId = watch('stylistId');
  const selectedBookingDate = watch('bookingDate');
  const selectedTimeSlot = watch('timeSlot');

  const selectedService = (services || []).find((s) => s.id === selectedServiceId);
  const selectedStylist = (stylists || []).find((s) => s.id === selectedStylistId);

  const createMutation = useMutation({
    mutationFn: (values: StaffBookingValues) =>
      bookingService.createStaffBooking({
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        serviceIds: [values.serviceId],
        stylistId: values.stylistId,
        bookingDate: values.bookingDate,
        timeSlot: values.timeSlot,
        notes: values.notes,
        creationType: 'Walk-in',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayBookings'] });
      queryClient.invalidateQueries({ queryKey: ['staffCreatedBookings'] });
      setSnackbarVisible(true);
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    },
  });

  const onSubmit = (values: StaffBookingValues) => {
    createMutation.mutate(values);
  };

  if (loadingServices || loadingStylists) {
    return <LoadingOverlay message="Preparing walk-in booking form..." />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Create Walk-in Booking" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.badgeRow}>
          <Chip icon="account-tie" style={{ backgroundColor: theme.colors.primaryContainer }}>
            CreatedByStaff (Walk-in Entry)
          </Chip>
        </View>

        <Controller
          control={control}
          name="customerName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Customer Full Name"
              mode="outlined"
              left={<TextInput.Icon icon="account" />}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={!!errors.customerName}
              style={styles.input}
            />
          )}
        />
        {errors.customerName && (
          <HelperText type="error">{errors.customerName.message}</HelperText>
        )}

        <Controller
          control={control}
          name="customerPhone"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Customer Phone Number"
              mode="outlined"
              keyboardType="phone-pad"
              left={<TextInput.Icon icon="phone" />}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={!!errors.customerPhone}
              style={styles.input}
            />
          )}
        />
        {errors.customerPhone && (
          <HelperText type="error">{errors.customerPhone.message}</HelperText>
        )}

        {/* Service Picker Dropdown */}
        <Text variant="labelLarge" style={styles.label}>
          Service Selection:
        </Text>
        <Menu
          visible={serviceMenuVisible}
          onDismiss={() => setServiceMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              icon="content-cut"
              onPress={() => setServiceMenuVisible(true)}
              style={styles.pickerBtn}
            >
              {selectedService ? `${selectedService.title} ($${selectedService.price})` : 'Select Service'}
            </Button>
          }
        >
          {(services || []).map((srv) => (
            <Menu.Item
              key={srv.id}
              title={`${srv.title} ($${srv.price})`}
              onPress={() => {
                setValue('serviceId', srv.id);
                setServiceMenuVisible(false);
              }}
            />
          ))}
        </Menu>

        {/* Stylist Picker Dropdown */}
        <Text variant="labelLarge" style={styles.label}>
          Assigned Stylist:
        </Text>
        <Menu
          visible={stylistMenuVisible}
          onDismiss={() => setStylistMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              icon="account-badge"
              onPress={() => setStylistMenuVisible(true)}
              style={styles.pickerBtn}
            >
              {selectedStylist ? selectedStylist.fullName : 'Select Stylist'}
            </Button>
          }
        >
          {(stylists || []).map((st) => (
            <Menu.Item
              key={st.id}
              title={st.fullName}
              onPress={() => {
                setValue('stylistId', st.id);
                setStylistMenuVisible(false);
              }}
            />
          ))}
        </Menu>

        {/* Date Selection */}
        <Text variant="labelLarge" style={styles.label}>
          Appointment Date:
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          {upcomingDates.map((d) => (
            <Chip
              key={d.value}
              mode={selectedBookingDate === d.value ? 'flat' : 'outlined'}
              selected={selectedBookingDate === d.value}
              onPress={() => setValue('bookingDate', d.value)}
              style={{ marginRight: 8 }}
            >
              {d.label}
            </Chip>
          ))}
          <Chip
            icon="calendar"
            mode="outlined"
            onPress={() => setOpenDatePicker(true)}
            style={{ marginRight: 8 }}
          >
            Custom Date: {selectedBookingDate}
          </Chip>
        </ScrollView>

        <DatePickerModal
          locale="en"
          mode="single"
          visible={openDatePicker}
          onDismiss={() => setOpenDatePicker(false)}
          date={new Date(selectedBookingDate)}
          validRange={{ startDate: new Date() }}
          onConfirm={(params) => {
            setOpenDatePicker(false);
            if (params.date) {
              const yyyy = params.date.getFullYear();
              const mm = String(params.date.getMonth() + 1).padStart(2, '0');
              const dd = String(params.date.getDate()).padStart(2, '0');
              setValue('bookingDate', `${yyyy}-${mm}-${dd}`);
            }
          }}
        />

        {/* Time Slot Selection */}
        <Text variant="labelLarge" style={styles.label}>
          Select Time Slot:
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          {timeSlotsList.map((slot) => {
            const disabled = isSlotInPast(selectedBookingDate, slot);
            return (
              <Chip
                key={slot}
                mode={selectedTimeSlot === slot ? 'flat' : 'outlined'}
                selected={selectedTimeSlot === slot}
                disabled={disabled}
                onPress={() => !disabled && setValue('timeSlot', slot)}
                showSelectedCheck={false}
                style={[
                  { marginRight: 8 },
                  disabled && { opacity: 0.4, backgroundColor: theme.colors.surfaceDisabled },
                ]}
              >
                {slot} {disabled ? '(Passed)' : ''}
              </Chip>
            );
          })}
        </ScrollView>

        <Controller
          control={control}
          name="notes"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Receptionist Notes / Requests"
              mode="outlined"
              multiline
              numberOfLines={3}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              style={styles.input}
            />
          )}
        />

        <Button
          mode="contained"
          icon="calendar-plus"
          onPress={handleSubmit(onSubmit)}
          loading={createMutation.isPending}
          disabled={createMutation.isPending}
          style={styles.submitBtn}
          contentStyle={{ paddingVertical: 6 }}
        >
          Create Walk-in Booking
        </Button>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
      >
        Walk-in appointment created successfully!
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  badgeRow: {
    marginBottom: 16,
  },
  input: {
    marginTop: 8,
  },
  label: {
    marginTop: 16,
    marginBottom: 4,
  },
  pickerBtn: {
    borderRadius: 8,
    alignItems: 'flex-start',
  },
  submitBtn: {
    marginTop: 24,
    borderRadius: 8,
  },
});
