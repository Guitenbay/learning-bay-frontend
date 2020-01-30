// .eslintrc.js  此配置仅供参考
module.exports = {
  root: true,
  "parserOptions": {
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  extends: [
  ],
  parser: 'typescript-eslint-parser',
  plugins: [
    'react',
    'typescript'
  ],
  'settings': {},
  rules: {
    // 缩进为两个空格
    "indent": ["error", 2]
  }
}