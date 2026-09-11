export const customer360QueryKeys = {
  workspace: (userId?: string | null) => ['customer-360', 'workspace', userId] as const,
};
