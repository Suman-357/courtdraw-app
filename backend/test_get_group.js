fetch('http://localhost:5000/api/v1/groups/6a259003d652eeccf75c3d36')
  .then(res => res.json())
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(err => console.error(err.message));
