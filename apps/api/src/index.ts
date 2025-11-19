import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth';
import { classesRouter } from './routes/classes';
import { assignmentsRouter } from './routes/assignments';
import { errorHandler } from './middleware/errorHandler';
import { requestId } from './middleware/requestId';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(requestId);

app.use('/auth', authRouter);
app.use('/classes', classesRouter);
app.use('/assignments', assignmentsRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

