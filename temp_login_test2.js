(async () => {
  try {
    const body = { email: 'admin@school.com', password: 'Admin123!' };
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    console.log('STATUS', res.status);
    const text = await res.text();
    console.log('BODY', text);
  } catch (err) {
    console.error('ERR', err);
  }
})();
