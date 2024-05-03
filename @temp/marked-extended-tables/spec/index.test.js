import { marked } from 'marked';
import extendedTable from '../src/index.js';

function trimLines(s) {
  return s.split('\n').map(l => l.trim()).join('\n');
}

describe('extended-table', () => {
  beforeEach(() => {
    marked.setOptions(marked.getDefaults());
  });

  test('Column Spanning', () => {
    marked.use(extendedTable());
    expect(marked(trimLines(`
      | H1      | H2      | H3      |
      |---------|---------|---------|
      | This cell spans 3 columns |||
    `))).toMatchSnapshot();
  });

  test('Row Spanning', () => {
    marked.use(extendedTable());
    expect(marked(trimLines(`
      | H1           | H2      |
      |--------------|---------|
      | This cell    | Cell A  |
      | spans three ^| Cell B  |
      | rows        ^| Cell C  |
    `))).toMatchSnapshot();
  });

  test('Multi-row headers', () => {
    marked.use(extendedTable());
    expect(marked(trimLines(`
      | This header spans two   || Header A |
      | columns *and* two rows ^|| Header B |
      |-------------|------------|----------|
      | Cell A      | Cell B     | Cell C   |
    `))).toMatchSnapshot();
  });
});
