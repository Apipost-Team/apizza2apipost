import Apizza2Apipost from '../src/Apizza2Apipost';
let fs = require('fs');
let path = require('path');

describe('works', () => {

  let Apizza2Apipost1=new Apizza2Apipost();
  const json = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/apizza.json'), 'utf-8'));

  it('Apizza2Apipost1 success', () => {
    expect(Apizza2Apipost1.convert(json).status).toBe('success');
  });

});

