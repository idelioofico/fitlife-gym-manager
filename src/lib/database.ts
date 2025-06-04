
// Simplified mock database for browser compatibility
interface QueryResult {
  rows: any[];
}

class MockPool {
  async query(text: string, params: any[] = []): Promise<QueryResult> {
    console.log('Mock database query:', text, params);
    
    // For demo purposes, return mock data based on the query
    if (text.includes('SELECT * FROM profiles WHERE email')) {
      // Mock user for demo
      if (params[0] === 'admin@fitlife.com') {
        return {
          rows: [{
            id: '1',
            email: 'admin@fitlife.com',
            password: await this.mockHash('admin123'),
            name: 'Admin User',
            role: 'admin',
            status: 'active'
          }]
        };
      }
      return { rows: [] };
    }
    
    if (text.includes('INSERT INTO profiles')) {
      return {
        rows: [{
          id: params[0],
          email: params[1],
          password: params[2],
          name: params[3],
          role: params[4],
          status: params[5]
        }]
      };
    }
    
    // Return empty result for other queries
    return { rows: [] };
  }
  
  private async mockHash(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'fitlife-salt');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

const pool = new MockPool();

export default pool;
