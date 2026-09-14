/** SSR/prerender stub — avoids @metagptx/web-sdk browser-only init in Node. */
export function createClient() {
  const noop = async () => ({ data: null, status: 200 });
  const entityApi = {
    query: noop,
    queryAll: noop,
    get: noop,
    create: noop,
    update: noop,
    delete: noop,
    deleteBatch: noop,
    createBatch: noop,
    updateBatch: noop,
  };

  return {
    auth: {
      login: noop,
      me: async () => ({ data: null, status: 401 }),
      logout: noop,
    },
    entities: new Proxy(
      {},
      {
        get: () => entityApi,
      },
    ),
    integrations: new Proxy(
      {},
      {
        get: () =>
          new Proxy(
            {},
            {
              get: () => noop,
            },
          ),
      },
    ),
    frame: {
      createPage: () => {},
    },
    utils: {
      openUrl: () => {},
    },
  };
}
