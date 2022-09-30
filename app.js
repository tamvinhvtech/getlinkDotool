var http = require('http');
const express = require('express');
const app = express();
var fs = require('fs');
const config = require('./configs/config');
const server = http.createServer(app);

const port = (process.env.PORT || config.port);


// Import Router
const route_pikbest = require('./routers/pikbest');
const route_pngtree = require('./routers/pngtree');


// Use Router
app.get('/', (req, res) => {
  const ipInfo = req.ipInfo;
  res.status(200).json({
    server: "work",
    //message: `Hey, you are browsing from ${ipInfo.city}, ${ipInfo.country}`,
    ipInfo
  });
});
app.use('/api/pikbest', route_pikbest);
app.use('/api/pngtree', route_pngtree);

app.use(function(req, res, next) {
  res.send('404');
});

server.listen(port, () => console.log(`Server listening on port ${port}!`));