import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../../styles/theme';

const CardTypeFilter = React.memo(({ cardTypes, selectedType, onSelectType }) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScrollContent}
      >
        {cardTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.filterButton,
              selectedType === type.id && styles.filterButtonSelected
            ]}
            onPress={() => onSelectType(type.id)}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={type.icon} 
              size={20} 
              color={selectedType === type.id ? colors.white : colors.primary} 
            />
            <Text 
              style={[
                styles.filterText,
                selectedType === type.id && styles.filterTextSelected
              ]}
            >
              {type.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    paddingBottom: 15,
  },
  filterScrollContent: {
    paddingHorizontal: 20,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.3)',
  },
  filterButtonSelected: {
    backgroundColor: colors.primary,
  },
  filterText: {
    color: colors.primary,
    fontWeight: '500',
    fontSize: fonts.sizes.medium,
    marginLeft: 6,
  },
  filterTextSelected: {
    color: colors.white,
  },
});

export default CardTypeFilter;