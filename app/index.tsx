import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MembershipCard from '@/ui/card/MembershipCard';
import { memberFixture } from '@/model/member.fixture';
import { colors } from '@/theme/theme';

export default function CarteirinhaScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <MembershipCard member={memberFixture} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
