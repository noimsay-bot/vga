require.extensions[".css"] = (module) => {
  module.exports = new Proxy(
    {},
    {
      get: (_target, property) => (property === "__esModule" ? false : String(property)),
    },
  );
};

