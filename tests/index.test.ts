import { MyInvoisClient } from '../src';

describe('MyInvoisClient', () => {
  it('should be importable', () => {
    expect(MyInvoisClient).toBeDefined();
  });

  it('should be instantiable with config', () => {
    const client = new MyInvoisClient({
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      tin: 'test-tin',
      certificatePath: 'test-cert-path',
      privateKeyPath: 'test-key-path',
      privateKeyPassphrase: 'test-passphrase',
      environment: 'sandbox'
    });

    expect(client).toBeInstanceOf(MyInvoisClient);
  });
}); 