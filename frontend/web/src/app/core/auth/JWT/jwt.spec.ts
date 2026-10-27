import { Jwt } from './jwt';

describe('Jwt', () => {
  it('decodes the supplied token payload', () => {
    const jwt = new Jwt(`${btoa('{"typ":"JWT"}')}.${btoa('{"sub":"test-user"}')}.signature`);
    expect(jwt.payload().sub).toBe('test-user');
  });
});
