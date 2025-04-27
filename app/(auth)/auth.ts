export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
};

export const auth = async () => {
  return {
    user: {
      id: 'user_0',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin' as const,
    },
  };
};
