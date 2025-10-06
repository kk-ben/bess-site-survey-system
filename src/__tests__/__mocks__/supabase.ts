// ============================================================================
// Mock Supabase Client for Testing
// ============================================================================

export const createClient = jest.fn(() => ({
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    then: jest.fn().mockResolvedValue({ data: [], error: null })
  })),
  auth: {
    signIn: jest.fn(),
    signOut: jest.fn(),
    getUser: jest.fn()
  }
}));

export const supabase = createClient();
