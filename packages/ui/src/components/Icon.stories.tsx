import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { StyleSheet, Text, View } from 'react-native';
import { color, fontBody } from '../theme';
import { GoogleLogo, Icon, ICON_NAMES } from './Icon';

const meta = {
  title: 'Fundamentos/Íconos',
  component: Icon,
  args: { name: 'cow', size: 24, color: color.text },
  argTypes: { name: { control: 'select', options: ICON_NAMES } },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Uno: Story = {};

export const Todos: Story = {
  render: () => (
    <View style={styles.grid}>
      {ICON_NAMES.map((n) => (
        <View key={n} style={styles.cell}>
          <Icon name={n} size={24} />
          <Text style={styles.name}>{n}</Text>
        </View>
      ))}
      <View style={styles.cell}>
        <GoogleLogo size={24} />
        <Text style={styles.name}>google</Text>
      </View>
    </View>
  ),
};

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, maxWidth: 520 },
  cell: { width: 80, alignItems: 'center', gap: 6, padding: 10, borderRadius: 12, backgroundColor: color.card },
  name: { ...fontBody(), fontSize: 11, color: color.muted },
});
