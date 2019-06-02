import express from 'express';
import bodyParser from 'body-parser';
import { filterImageFromURL, deleteLocalFiles } from './util/util';

async function getFilteredImage(req: express.Request, res: express.Response) {
  try {
    const imgPath = await filterImageFromURL(req.query.image_url);
    const readFilePromise = require('util').promisify(require('fs').readFile);
    const filteredpath = await readFilePromise(imgPath);
    res.header('content-type', 'image/jpeg').send(filteredpath);
    deleteLocalFiles([imgPath]);
  } catch (err) {
    //validate image url using jimp 
    if (err.code && err.code == 'ERR_BAD_URL')
      res.status(422).send({
        error: true,
        message: 'Cannot Process Specified URL'
      })
    else
      res.status(500).send({
        error: true,
        message: 'Internal Server Error'
      })
  }
}
(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  app.get("/filteredimage", (req, res) => {
    getFilteredImage(req, res)
  });


  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();