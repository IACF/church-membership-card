import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import LeftStrip from './LeftStrip';

describe('LeftStrip', () => {
  it('renderiza sem quebrar e exibe os filhos (ex.: a foto)', () => {
    const { getByText } = render(
      <LeftStrip height={215}>
        <Text>foto</Text>
      </LeftStrip>,
    );
    expect(getByText('foto')).toBeTruthy();
  });
});
