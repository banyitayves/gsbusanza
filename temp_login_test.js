const body = { email: 'admin@school.com', password: 'Admin123!' };

fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})
  .then(async (res) => {
    console.log('STATUS', res.status);
    console.log(await res.text());
  })
  .catch((err) => {
    console.error('ERR', err);
  });
