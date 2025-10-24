import { Router } from 'express';

const router = Router();

router.post('/predict-conflicts', (req, res) => {
  res.json({
    prediction: {},
    confidence: 0
  });
});

router.get('/model-metrics', (req, res) => {
  res.json({
    accuracy: 0,
    version: '1.0.0'
  });
});

export default router;
