import React, { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import {
  Appbar,
  Card,
  Chip,
  IconButton,
  Searchbar,
  Text,
  useTheme,
} from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { bookingService } from '../../services/bookingService';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { EmptyState } from '../../components/EmptyState';
import { ServiceItem } from '../../types/service';

export const BrowseServicesScreen = ({ navigation }: any) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: services, isLoading, refetch } = useQuery({
    queryKey: ['services'],
    queryFn: () => bookingService.getServices(),
  });

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'cat_1', name: 'Haircuts' },
    { id: 'cat_2', name: 'Styling' },
    { id: 'cat_3', name: 'Coloring' },
    { id: 'cat_4', name: 'Treatment' },
  ];

  const filteredServices = (services || []).filter((s) => {
    const matchesCategory =
      selectedCategory === 'all' || s.categoryId === selectedCategory;
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (isLoading) {
    return <LoadingOverlay message="Loading service catalog..." />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header elevated>
        <Appbar.Content title="Our Services" />
      </Appbar.Header>

      <View style={styles.headerControls}>
        <Searchbar
          placeholder="Search services..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.categoryRow}
          renderItem={({ item }) => (
            <Chip
              mode={selectedCategory === item.id ? 'flat' : 'outlined'}
              selected={selectedCategory === item.id}
              onPress={() => setSelectedCategory(item.id)}
              style={styles.chip}
            >
              {item.name}
            </Chip>
          )}
        />
      </View>

      <FlatList
        data={filteredServices}
        keyExtractor={(item) => item.id}
        refreshing={isLoading}
        onRefresh={refetch}
        contentContainerStyle={
          filteredServices.length === 0 ? styles.emptyList : styles.list
        }
        ListEmptyComponent={
          <EmptyState
            icon="scissors-cutting"
            title="No Services Found"
            description="Try adjusting your search keywords or category filter."
          />
        }
        renderItem={({ item }: { item: ServiceItem }) => (
          <Card
            mode="outlined"
            style={styles.card}
            onPress={() => navigation.navigate('ServiceDetail', { serviceId: item.id, service: item })}
          >
            <Card.Cover source={{ uri: item.imageUrl }} style={styles.cardCover} />
            <Card.Content style={styles.cardContent}>
              <View style={{ flex: 1 }}>
                <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                  {item.title}
                </Text>
                <Text variant="bodySmall" numberOfLines={2} style={{ opacity: 0.7, marginVertical: 4 }}>
                  {item.description}
                </Text>

                <View style={styles.metaRow}>
                  <Chip icon="clock-outline" compact style={{ marginRight: 8 }}>
                    {item.durationMinutes}m
                  </Chip>
                  <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                    ${item.price}
                  </Text>
                </View>
              </View>

              <IconButton
                icon="plus-circle"
                mode="contained-tonal"
                size={28}
                onPress={() => navigation.navigate('BookAppointment', { selectedServiceId: item.id })}
              />
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  headerControls: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchbar: {
    marginBottom: 12,
    borderRadius: 12,
  },
  categoryRow: {
    paddingBottom: 4,
  },
  chip: {
    marginRight: 8,
  },
  list: {
    padding: 16,
    gap: 16,
  },
  emptyList: {
    flexGrow: 1,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardCover: {
    height: 140,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
});
