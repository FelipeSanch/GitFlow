import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FeatureExtractor:
    """
    Extract features from GitHub PR data for ML model
    """

    def extract_pr_features(self, pr_data):
        """
        Extract features from pull request data

        Args:
            pr_data (dict): Raw PR data from GitHub API or extension

        Returns:
            dict: Extracted features
        """
        try:
            features = {
                'files_changed': pr_data.get('filesChanged', pr_data.get('files_changed', 0)),
                'additions': pr_data.get('additions', 0),
                'deletions': pr_data.get('deletions', 0),
                'branch_age_days': self.calculate_branch_age(pr_data),
                'base_branch_commits_since_branch': pr_data.get('base_branch_commits', 0),
                'author_experience_score': self.calculate_author_experience(pr_data),
                'overlapping_files_ratio': pr_data.get('overlapping_ratio', 0.0),
                'modified_core_files': self.count_core_files(pr_data),
                'avg_file_complexity': self.estimate_complexity(pr_data),
                'recent_conflicts_count': pr_data.get('recent_conflicts', 0)
            }

            logger.info(f"Extracted features for PR: {features}")
            return features

        except Exception as e:
            logger.error(f'Error extracting features: {e}')
            return self.get_default_features()

    def calculate_branch_age(self, pr_data):
        """
        Calculate how long the branch has been active
        """
        created_at = pr_data.get('created_at') or pr_data.get('createdAt')
        if created_at:
            try:
                created = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                age = (datetime.now() - created).days
                return age
            except:
                pass
        return 0

    def calculate_author_experience(self, pr_data):
        """
        Estimate author's experience level (0-1 score)
        Higher score = more experienced = lower conflict risk
        """
        author_data = pr_data.get('author', {})
        contributions = author_data.get('contributions', 0)
        account_age_years = author_data.get('account_age_years', 0)

        # Simple heuristic scoring
        score = min(1.0, (contributions / 100) * 0.5 + (account_age_years / 5) * 0.5)
        return score

    def count_core_files(self, pr_data):
        """
        Count number of core/critical files being modified
        """
        files = pr_data.get('files', [])
        if isinstance(files, list):
            core_patterns = [
                'config',
                'package.json',
                'requirements.txt',
                'Dockerfile',
                'schema',
                'migration',
                'core/',
                'lib/',
                'index'
            ]

            core_count = 0
            for file in files:
                filename = file if isinstance(file, str) else file.get('filename', '')
                if any(pattern in filename.lower() for pattern in core_patterns):
                    core_count += 1

            return core_count
        return 0

    def estimate_complexity(self, pr_data):
        """
        Estimate average complexity of changed files
        Based on file size, type, and change distribution
        """
        files_changed = pr_data.get('filesChanged', pr_data.get('files_changed', 1))
        additions = pr_data.get('additions', 0)
        deletions = pr_data.get('deletions', 0)

        if files_changed == 0:
            return 0

        # Average changes per file
        avg_changes = (additions + deletions) / files_changed

        # Normalize to 0-1 scale (assuming 100 changes = high complexity)
        complexity = min(1.0, avg_changes / 100)

        return complexity

    def get_default_features(self):
        """
        Return default feature values when extraction fails
        """
        return {
            'files_changed': 0,
            'additions': 0,
            'deletions': 0,
            'branch_age_days': 0,
            'base_branch_commits_since_branch': 0,
            'author_experience_score': 0.5,
            'overlapping_files_ratio': 0.0,
            'modified_core_files': 0,
            'avg_file_complexity': 0.0,
            'recent_conflicts_count': 0
        }
