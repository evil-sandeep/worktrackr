const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@worktrackr.com',
      password: 'Admin@123'
    });
    
    const empRes = await axios.get('http://localhost:5000/api/admin/employees', {
      headers: { Authorization: `Bearer ${res.data.token}` }
    });
    
    const users = empRes.data.map(e => ({ name: e.name, role: e.role, empId: e.empId }));
    require('fs').writeFileSync('test_output.json', JSON.stringify(users, null, 2), 'utf8');
  } catch(e) {
    console.error('Error:', e.response ? e.response.data : e.message);
  }
}
test();
