# ML Prediction Service

Python Flask service for predicting medicine expiry risk, confidence, and remaining days.

## Features

- Rule-based predictions (default, no training data required)
- ML-based predictions (Random Forest Regressor, requires training)
- Batch prediction support
- RESTful API endpoints

## Setup

### 1. Install Dependencies

```bash
cd ml-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Run the Service

```bash
python app.py
```

The service will start on `http://localhost:5000` by default.

### Environment Variables

- `PORT`: Server port (default: 5000)
- `FLASK_DEBUG`: Enable debug mode (default: false)
- `USE_ML`: Enable ML models (default: false, uses rule-based)
- `MODEL_DIR`: Directory containing trained models (default: models)

## API Endpoints

### Health Check

```bash
GET /health
```

Response:
```json
{
  "status": "healthy",
  "service": "ml-prediction-service",
  "ml_enabled": false
}
```

### Single Prediction

```bash
POST /predict
Content-Type: application/json

{
  "batch_id": "BATCH001",
  "purchase_date": "2024-01-15",
  "expiry_date": "2025-01-15",
  "quantity": 100,
  "storage": "Room"
}
```

Response:
```json
{
  "risk": 45,
  "confidence": 0.75,
  "remaining_days": 120
}
```

### Batch Prediction

```bash
POST /predict-batch
Content-Type: application/json

{
  "medicines": [
    {
      "batch_id": "BATCH001",
      "purchase_date": "2024-01-15",
      "expiry_date": "2025-01-15",
      "quantity": 100,
      "storage": "Room"
    },
    {
      "batch_id": "BATCH002",
      "purchase_date": "2024-02-01",
      "expiry_date": "2024-12-01",
      "quantity": 50,
      "storage": "Cold"
    }
  ]
}
```

Response:
```json
{
  "predictions": [
    {
      "batch_id": "BATCH001",
      "risk": 45,
      "confidence": 0.75,
      "remaining_days": 120
    },
    {
      "batch_id": "BATCH002",
      "risk": 60,
      "confidence": 0.80,
      "remaining_days": 90
    }
  ]
}
```

## Training ML Models

To train ML models on historical data:

1. Prepare training data CSV with columns:
   - `purchase_date`: YYYY-MM-DD
   - `expiry_date`: YYYY-MM-DD
   - `quantity`: integer
   - `storage`: 'Cold' or 'Room'
   - `actual_risk`: 0-100 (known outcome)
   - `actual_remaining_days`: integer (known outcome)

2. Run training script:
```bash
python train.py data/training_data.csv models
```

3. Enable ML mode:
```bash
USE_ML=true python app.py
```

## Prediction Algorithm

### Rule-Based (Default)

- Risk calculation based on days until expiry:
  - Expired (≤0 days): Risk = 100
  - Critical (1-7 days): Risk = 95
  - High (8-30 days): Risk = 80
  - Medium (31-60 days): Risk = 50
  - Low (61-90 days): Risk = 30
  - Very Low (>90 days): Risk = 30 - (days-90)/10

- Adjustments:
  - Higher quantity increases risk
  - Cold storage adds +5 risk

- Confidence based on:
  - Data quality (total shelf life)
  - Proximity to expiry

### ML-Based (When Trained)

- Uses Random Forest Regressor
- Trained on historical data
- Same feature set as rule-based
- Better accuracy with sufficient training data

## Features Used

1. `days_until_expiry`: Days until medicine expires
2. `days_since_purchase`: Days since purchase
3. `total_shelf_life`: Total shelf life duration
4. `quantity`: Current stock quantity
5. `storage_encoded`: 0 (Room) or 1 (Cold)
6. `expiry_ratio`: Ratio of shelf life used
7. `month_of_year`: Current month (1-12) for seasonal patterns

## Error Handling

- Invalid date formats return 400 Bad Request
- Missing required fields return 400 Bad Request
- Invalid storage values return 400 Bad Request
- Prediction errors return 500 Internal Server Error

## Development

### Testing

Test the service locally:

```bash
# Health check
curl http://localhost:5000/health

# Single prediction
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "purchase_date": "2024-01-15",
    "expiry_date": "2025-01-15",
    "quantity": 100,
    "storage": "Room"
  }'
```

### Project Structure

```
ml-service/
├── app.py                 # Flask application
├── predictor.py           # Prediction model class
├── feature_extractor.py   # Feature engineering
├── train.py              # Model training script
├── requirements.txt       # Python dependencies
├── models/               # Saved model files
└── README.md             # This file
```

