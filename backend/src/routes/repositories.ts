import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ repositories: [] });
});

router.get('/:id', (req, res) => {
  res.json({ repository: null });
});

router.post('/:id/sync', (req, res) => {
  res.json({ message: 'Repository sync started' });
});

export default router;
