import { render } from '@testing-library/react';
import { Text } from 'react-native';

import { Reorder } from './Reorder';

const SPRING = { stiffness: 300, damping: 30 };

const renderList = (keys: readonly string[]) => (
  <Reorder itemKeys={keys} spring={SPRING}>
    {(key) => <Text testID={`item-${key}`}>{key}</Text>}
  </Reorder>
);

describe('Reorder', () => {
  it('follows a re-ranked key order and survives removed keys without throwing', () => {
    const { rerender, getByTestId, queryByTestId, container } = render(renderList(['a', 'b', 'c']));
    rerender(renderList(['c', 'a']));
    const ids = [...container.querySelectorAll('[data-testid^="item-"]')].map((n) => n.getAttribute('data-testid'));
    expect(ids).toEqual(['item-c', 'item-a']);
    expect(queryByTestId('item-b')).toBeNull();
    expect(getByTestId('reorder')).toBeTruthy();
  });
});
