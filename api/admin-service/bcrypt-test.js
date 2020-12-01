const bcrypt = require('bcryptjs');

generate_password = () =>{
  console.log('generating a password');
  const pass = bcrypt.hashSync('skipthedishes2night', 10);
  const main = bcrypt.hashSync('Q323dsaD', 10);
  const hendrix = bcrypt.hashSync('skipthedishes2night', 10);
  console.log(pass);
  console.log(main);
  console.log(hendrix);
}

generate_password();