import bodyParser from 'body-parser';
import express, { Express } from 'express';
import serverless from 'serverless-http';
import routes from './routes';
import connectDB from './services/database/mongodb/connectDatabase';
const app: Express = express();

connectDB();

const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/api', routes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.status(404).send();
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.status(err.status || 500).send();
});

export const handler = serverless(app);
