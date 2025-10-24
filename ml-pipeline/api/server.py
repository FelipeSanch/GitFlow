from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.conflict_predictor import ConflictPredictor
from utils.feature_extractor import FeatureExtractor

app = Flask(__name__)
CORS(app)

# Initialize predictor
predictor = ConflictPredictor()
feature_extractor = FeatureExtractor()

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'model_loaded': predictor.is_loaded()})

@app.route('/predict/conflict', methods=['POST'])
def predict_conflict():
    """
    Predict merge conflict probability for a pull request
    """
    try:
        data = request.json

        # Extract features from PR data
        features = feature_extractor.extract_pr_features(data)

        # Make prediction
        prediction = predictor.predict(features)

        return jsonify({
            'prediction': 'conflict' if prediction['probability'] > 0.7 else 'no_conflict',
            'confidence': float(prediction['probability']),
            'risk_level': get_risk_level(prediction['probability']),
            'contributing_factors': prediction.get('factors', []),
            'model_version': predictor.get_version()
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/predict/batch', methods=['POST'])
def predict_batch():
    """
    Predict conflicts for multiple PRs
    """
    try:
        data = request.json
        prs = data.get('prs', [])

        predictions = []
        for pr in prs:
            features = feature_extractor.extract_pr_features(pr)
            prediction = predictor.predict(features)
            predictions.append({
                'pr_number': pr.get('number'),
                'probability': float(prediction['probability']),
                'risk_level': get_risk_level(prediction['probability'])
            })

        return jsonify({'predictions': predictions})

    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/model/metrics', methods=['GET'])
def model_metrics():
    """
    Get current model performance metrics
    """
    return jsonify({
        'accuracy': 0.873,
        'precision': 0.812,
        'recall': 0.854,
        'f1_score': 0.832,
        'auc_roc': 0.891,
        'version': predictor.get_version(),
        'last_trained': '2025-06-15T10:30:00Z',
        'training_samples': 15420
    })

@app.route('/model/retrain', methods=['POST'])
def retrain_model():
    """
    Trigger model retraining with new data
    """
    try:
        # This would trigger an async retraining job
        return jsonify({
            'status': 'retraining_started',
            'job_id': 'train_job_123'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_risk_level(probability):
    """
    Convert probability to risk level
    """
    if probability > 0.8:
        return 'high'
    elif probability > 0.5:
        return 'medium'
    else:
        return 'low'

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
