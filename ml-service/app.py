"""
Flask API server for medicine expiry predictions.
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from predictor import ExpiryPredictor
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js frontend

# Initialize predictor (rule-based by default, can be upgraded to ML)
use_ml = os.getenv('USE_ML', 'false').lower() == 'true'
model_dir = os.getenv('MODEL_DIR', 'models')
predictor = ExpiryPredictor(use_ml=use_ml, model_dir=model_dir)


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'service': 'ml-prediction-service',
        'ml_enabled': predictor.use_ml and predictor.is_trained
    })


@app.route('/predict', methods=['POST'])
def predict():
    """
    Predict expiry risk for a single medicine batch.
    
    Request body:
    {
        "batch_id": "BATCH001",
        "purchase_date": "2024-01-15",
        "expiry_date": "2025-01-15",
        "quantity": 100,
        "storage": "Room"
    }
    
    Response:
    {
        "risk": 45,
        "confidence": 0.75,
        "remaining_days": 120
    }
    """
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['purchase_date', 'expiry_date', 'quantity', 'storage']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            return jsonify({
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400
        
        # Validate storage value
        if data['storage'] not in ['Cold', 'Room']:
            return jsonify({
                'error': "storage must be 'Cold' or 'Room'"
            }), 400
        
        # Validate quantity
        if not isinstance(data['quantity'], int) or data['quantity'] <= 0:
            return jsonify({
                'error': 'quantity must be a positive integer'
            }), 400
        
        # Make prediction
        result = predictor.predict(data)
        
        return jsonify(result)
    
    except ValueError as e:
        return jsonify({'error': f'Invalid date format: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500


@app.route('/predict-batch', methods=['POST'])
def predict_batch():
    """
    Predict expiry risk for multiple medicine batches.
    
    Request body:
    {
        "medicines": [
            {
                "batch_id": "BATCH001",
                "purchase_date": "2024-01-15",
                "expiry_date": "2025-01-15",
                "quantity": 100,
                "storage": "Room"
            },
            ...
        ]
    }
    
    Response:
    {
        "predictions": [
            {
                "batch_id": "BATCH001",
                "risk": 45,
                "confidence": 0.75,
                "remaining_days": 120
            },
            ...
        ]
    }
    """
    try:
        data = request.json
        
        if 'medicines' not in data:
            return jsonify({'error': 'Missing required field: medicines'}), 400
        
        if not isinstance(data['medicines'], list):
            return jsonify({'error': 'medicines must be a list'}), 400
        
        predictions = []
        
        for medicine in data['medicines']:
            # Validate required fields
            required_fields = ['batch_id', 'purchase_date', 'expiry_date', 'quantity', 'storage']
            missing_fields = [field for field in required_fields if field not in medicine]
            
            if missing_fields:
                predictions.append({
                    'batch_id': medicine.get('batch_id', 'unknown'),
                    'error': f'Missing required fields: {", ".join(missing_fields)}'
                })
                continue
            
            try:
                # Make prediction
                result = predictor.predict(medicine)
                predictions.append({
                    'batch_id': medicine['batch_id'],
                    **result
                })
            except Exception as e:
                predictions.append({
                    'batch_id': medicine['batch_id'],
                    'error': str(e)
                })
        
        return jsonify({'predictions': predictions})
    
    except Exception as e:
        return jsonify({'error': f'Batch prediction failed: {str(e)}'}), 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'false').lower() == 'true'
    
    print(f"Starting ML Prediction Service on port {port}")
    print(f"ML Mode: {'Enabled' if predictor.use_ml and predictor.is_trained else 'Disabled (Rule-based)'}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)

