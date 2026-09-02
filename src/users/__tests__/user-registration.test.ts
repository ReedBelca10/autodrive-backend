import { UsersService } from '../users.service';

describe('UsersService.create', () => {
  it('passes the raw password to the schema so it is hashed only once', async () => {
    let capturedPassword: string | undefined;

    class MockUserModel {
      constructor(data: any) {
        Object.assign(this, data);
        capturedPassword = data.password;
      }

      static findOne() {
        return { exec: async () => null };
      }

      async save() {
        return { ...this, toObject: () => ({ ...this }) };
      }
    }

    const service = new UsersService(MockUserModel as any);

    const result = await service.create({
      fullName: 'Alice Example',
      email: 'alice@example.com',
      password: 'Secret123',
    });

    expect(capturedPassword).toBe('Secret123');
    expect(result.password).toBe('Secret123');
  });
});
