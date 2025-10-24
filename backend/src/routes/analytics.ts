import { Router } from 'express';

const router = Router();

router.get('/dashboard/:repositoryId', (req, res) => {
  res.json({
    metrics: {},
    roi: {},
    bottlenecks: []
  });
});

router.post('/calculate-roi', (req, res) => {
  res.json({ roi: {} });
});

router.get('/bottlenecks/:repositoryId', (req, res) => {
  res.json({ bottlenecks: [] });
});

export default router;
