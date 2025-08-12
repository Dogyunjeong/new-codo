module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    overrides: [
      {
        test: /\.mts$/,
        plugins: [
          [
            '@babel/plugin-transform-typescript',
            {
              isTSX: false,
              allowDeclareFields: true,
              allowNamespaces: true,
            },
          ],
        ],
      },
    ],
  };
};
