import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Appbar, Card, Chip, Text, useTheme } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { bookingService } from '../../services/bookingService';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { Stylist } from '../../types/service';

export const BrowseStylistsScreen = ({ navigation }: any) => {
  const theme = useTheme();

  const { data: stylists, isLoading, refetch } = useQuery({
    queryKey: ['stylists'],
    queryFn: () => bookingService.getStylists(),
  });

  if (isLoading) {
    return <LoadingOverlay message="Loading stylists..." />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header elevated>
        {navigation.canGoBack() && (
          <Appbar.BackAction onPress={() => navigation.goBack()} />
        )}
        <Appbar.Content title="Our Master Stylists" />
      </Appbar.Header>

      <FlatList
        data={stylists || []}
        keyExtractor={(item) => item.id}
        numColumns={2}
        refreshing={isLoading}
        onRefresh={refetch}
        contentContainerStyle={styles.list}
        renderItem={({ item }: { item: Stylist }) => (
          <View style={styles.gridItem}>
            <Card
              mode="outlined"
              style={styles.card}
              onPress={() => navigation.navigate('StylistProfileDetail', { stylist: item })}
            >
              <Card.Cover source={{ uri: item.avatarUrl }} style={styles.cardCover} />
              <Card.Content style={{ padding: 12 }}>
                <Text variant="titleSmall" style={styles.name} numberOfLines={1}>
                  {item.fullName}
                </Text>

                <Chip compact style={{ marginVertical: 6 }}>
                  {item.specialty}
                </Chip>

                <Text variant="bodySmall" style={{ color: '#FFB300', fontWeight: 'bold' }}>
                  ★ {item.rating} ({item.experienceYears} Yrs Exp)
                </Text>
              </Card.Content>
            </Card>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 8,
  },
  gridItem: {
    flex: 0.5,
    padding: 8,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardCover: {
    height: 140,
  },
  name: {
    fontWeight: 'bold',
  },
});
