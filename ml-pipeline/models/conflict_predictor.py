import os
import joblib
import numpy as np
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ConflictPredictor:
    """
    Machine learning model for predicting merge conflicts
    Uses historical repository data and engineering metrics
    """

    def __init__(self, model_path=None):
        self.model_path = model_path or os.getenv('MODEL_PATH', 'models')
        self.model = None
        self.scaler = None
        self.version = '1.0.0'
        self.load_model()

    def load_model(self):
        """
        Load trained model from disk or initialize new one
        """
        try:
            model_file = os.path.join(self.model_path, 'conflict_predictor.pkl')
            scaler_file = os.path.join(self.model_path, 'scaler.pkl')

            if os.path.exists(model_file) and os.path.exists(scaler_file):
                self.model = joblib.load(model_file)
                self.scaler = joblib.load(scaler_file)
                logger.info(f'Model loaded from {model_file}')
            else:
                logger.warning('No pre-trained model found, initializing new model')
                self.initialize_model()

        except Exception as e:
            logger.error(f'Error loading model: {e}')
            self.initialize_model()

    def initialize_model(self):
        """
        Initialize a new model with default parameters
        """
        # Using Gradient Boosting for better performance on imbalanced data
        self.model = GradientBoostingClassifier(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=5,
            min_samples_split=20,
            min_samples_leaf=10,
            subsample=0.8,
            random_state=42
        )
        self.scaler = StandardScaler()
        logger.info('Initialized new Gradient Boosting model')

    def predict(self, features):
        """
        Predict merge conflict probability

        Args:
            features (dict): Extracted features from PR data

        Returns:
            dict: Prediction results with probability and contributing factors
        """
        try:
            # Convert features to array
            feature_vector = self.features_to_vector(features)

            # If model is trained, make prediction
            if hasattr(self.model, 'feature_importances_'):
                # Scale features
                if self.scaler and hasattr(self.scaler, 'mean_'):
                    scaled_features = self.scaler.transform([feature_vector])
                else:
                    scaled_features = [feature_vector]

                # Get probability
                probability = self.model.predict_proba(scaled_features)[0][1]

                # Get feature importance
                factors = self.get_contributing_factors(features, feature_vector)

                return {
                    'probability': probability,
                    'factors': factors
                }
            else:
                # Model not trained, use heuristic
                return self.heuristic_prediction(features)

        except Exception as e:
            logger.error(f'Error making prediction: {e}')
            return self.heuristic_prediction(features)

    def heuristic_prediction(self, features):
        """
        Fallback heuristic-based prediction when model is not trained
        """
        # Calculate risk based on known indicators
        risk_score = 0.0

        # Large number of file changes increases risk
        if features.get('files_changed', 0) > 20:
            risk_score += 0.3
        elif features.get('files_changed', 0) > 10:
            risk_score += 0.15

        # Large code changes increase risk
        total_changes = features.get('additions', 0) + features.get('deletions', 0)
        if total_changes > 500:
            risk_score += 0.25
        elif total_changes > 200:
            risk_score += 0.15

        # Long-lived branches increase risk
        if features.get('branch_age_days', 0) > 7:
            risk_score += 0.2
        elif features.get('branch_age_days', 0) > 3:
            risk_score += 0.1

        # High activity in base branch increases risk
        if features.get('base_branch_commits_since_branch', 0) > 50:
            risk_score += 0.25

        # Overlapping file changes with recent PRs
        if features.get('overlapping_files_ratio', 0) > 0.5:
            risk_score += 0.3

        probability = min(risk_score, 0.95)

        factors = []
        if features.get('files_changed', 0) > 10:
            factors.append('High number of file changes')
        if total_changes > 200:
            factors.append('Large code changes')
        if features.get('branch_age_days', 0) > 3:
            factors.append('Long-lived feature branch')
        if features.get('base_branch_commits_since_branch', 0) > 20:
            factors.append('Many commits in base branch')

        return {
            'probability': probability,
            'factors': factors
        }

    def features_to_vector(self, features):
        """
        Convert feature dictionary to numpy array
        """
        return np.array([
            features.get('files_changed', 0),
            features.get('additions', 0),
            features.get('deletions', 0),
            features.get('branch_age_days', 0),
            features.get('base_branch_commits_since_branch', 0),
            features.get('author_experience_score', 0),
            features.get('overlapping_files_ratio', 0),
            features.get('modified_core_files', 0),
            features.get('avg_file_complexity', 0),
            features.get('recent_conflicts_count', 0)
        ])

    def get_contributing_factors(self, features, feature_vector):
        """
        Identify top contributing factors to the prediction
        """
        factors = []

        if hasattr(self.model, 'feature_importances_'):
            importance = self.model.feature_importances_
            feature_names = [
                'Files changed',
                'Additions',
                'Deletions',
                'Branch age',
                'Base branch commits',
                'Author experience',
                'Overlapping files',
                'Core files modified',
                'File complexity',
                'Recent conflicts'
            ]

            # Get top 3 features
            top_indices = np.argsort(importance)[-3:][::-1]
            for idx in top_indices:
                if importance[idx] > 0.1:
                    factors.append(feature_names[idx])

        return factors

    def is_loaded(self):
        """
        Check if model is loaded
        """
        return self.model is not None

    def get_version(self):
        """
        Get model version
        """
        return self.version

    def save_model(self):
        """
        Save model to disk
        """
        try:
            os.makedirs(self.model_path, exist_ok=True)
            model_file = os.path.join(self.model_path, 'conflict_predictor.pkl')
            scaler_file = os.path.join(self.model_path, 'scaler.pkl')

            joblib.dump(self.model, model_file)
            joblib.dump(self.scaler, scaler_file)
            logger.info(f'Model saved to {model_file}')

        except Exception as e:
            logger.error(f'Error saving model: {e}')
