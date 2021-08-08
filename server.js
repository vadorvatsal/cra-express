const express = require('express');
const { exec } = require('child_process');
const bodyParser = require('body-parser');const { stderr } = require('process');
const app = express();
const port = process.env.PORT || 5000;app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/api/hello', (req, res) => {
  res.send({ express: 'Hello From Express' });
});

app.post('/api/world', (req, res) => {
  console.log(req.body);
  res.send(
    `I received your POST request. This is what you sent me: ${req.body.post}`,
  );
});

app.post('/redeploy', validateSecret, (req,res) => {
  exec('git pull && yarn run produce', (err, stdout, stderr) => {
    if (err) {
      console.log({ error: err})
    }
    else {
      console.log({ stdout: stdout, stderr: stderr});
      res.status(200).send(`Auto deploy completed ${stdout} ${stderr}`);
    }
  });
});

function validateSecret(req, res, next){
  const payload = JSON.stringify(req.body);
  if(!payload){
    return next('Request body empty');
  }

  let sig = 'sha1=' + crypto
            .createHmac('sha1', process.env.WEBHOOK_SECRET)
            .update(payload)
            .digest('hex');
  if (req.headers['x-hub-signature'] == sig) {
    return next();
  }
  else {
    return next('Signature did not match');
  }
}

app.listen(port, () => console.log(`Listening on port ${port}`));