describe('Function Existence', () => {
const filesToCheck = [
  'services/aiService.js',
  'services/embeddings.js',
  'services/similarity.js',
  'utils/parseAIResponse.js',
];

describe('Function Existence', () => {
  filesToCheck.forEach((file) => {
    test(`${file} should export at least one function`, async () => {
      const mod = await import(`../${file}`);
      const hasFunction = Object.values(mod).some(v => typeof v === 'function');
      expect(hasFunction).toBe(true);
    });
  });
})
});
