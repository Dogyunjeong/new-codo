import React, { useRef } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { Pill } from './Pill'
import { theme } from '../../constants/theme'

interface Tab {
  id: string
  label: string
}

interface TabBarProps {
  tabs: Tab[]
  activeTab: string
  onTabPress: (id: string) => void
  scrollable?: boolean
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTab,
  onTabPress,
  scrollable = true,
}) => {
  const scrollViewRef = useRef<ScrollView>(null)

  const content = (
    <>
      {tabs.map((tab, index) => (
        <View key={tab.id} style={index > 0 && styles.tabSpacing}>
          <Pill
            label={tab.label}
            active={activeTab === tab.id}
            onPress={() => onTabPress(tab.id)}
            size="medium"
          />
        </View>
      ))}
    </>
  )

  if (scrollable) {
    return (
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.container}
      >
        {content}
      </ScrollView>
    )
  }

  return (
    <View style={[styles.container, styles.fixedContent]}>
      {content}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 44,
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
  },
  fixedContent: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
  },
  tabSpacing: {
    marginLeft: theme.spacing.sm,
  },
})