"""
Training script for ML models.
Trains Random Forest models on historical data.
"""
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import os
from predictor import ExpiryPredictor
from feature_extractor import extract_features


def load_training_data(csv_path: str) -> pd.DataFrame:
    """
    Load training data from CSV file.
    
    Expected CSV format:
    purchase_date,expiry_date,quantity,storage,actual_risk,actual_remaining_days
    
    Where:
    - actual_risk: 0-100 (known outcome)
    - actual_remaining_days: actual days until expiry (known outcome)
    """
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Training data not found: {csv_path}")
    
    df = pd.read_csv(csv_path)
    
    # Validate required columns
    required_cols = ['purchase_date', 'expiry_date', 'quantity', 'storage', 
                     'actual_risk', 'actual_remaining_days']
    missing_cols = [col for col in required_cols if col not in df.columns]
    
    if missing_cols:
        raise ValueError(f"Missing required columns: {missing_cols}")
    
    return df


def prepare_features_and_labels(df: pd.DataFrame):
    """
    Prepare features and labels from training data.
    
    Returns:
        X: Feature matrix
        y_risk: Risk labels (0-1 scale)
        y_days: Remaining days labels
    """
    X = []
    y_risk = []
    y_days = []
    
    for _, row in df.iterrows():
        medicine_data = {
            'purchase_date': str(row['purchase_date']),
            'expiry_date': str(row['expiry_date']),
            'quantity': int(row['quantity']),
            'storage': str(row['storage'])
        }
        
        # Extract features
        features = extract_features(medicine_data)
        X.append(features[0])  # Flatten to 1D array
        
        # Normalize risk to 0-1 scale
        y_risk.append(row['actual_risk'] / 100.0)
        y_days.append(row['actual_remaining_days'])
    
    return np.array(X), np.array(y_risk), np.array(y_days)


def train_models(csv_path: str, model_dir: str = 'models', test_size: float = 0.2):
    """
    Train risk and days prediction models.
    
    Args:
        csv_path: Path to training data CSV
        model_dir: Directory to save models
        test_size: Proportion of data to use for testing
    """
    print("Loading training data...")
    df = load_training_data(csv_path)
    print(f"Loaded {len(df)} training samples")
    
    print("Preparing features and labels...")
    X, y_risk, y_days = prepare_features_and_labels(df)
    
    # Split data
    X_train, X_test, y_risk_train, y_risk_test, y_days_train, y_days_test = train_test_split(
        X, y_risk, y_days, test_size=test_size, random_state=42
    )
    
    print(f"Training set: {len(X_train)} samples")
    print(f"Test set: {len(X_test)} samples")
    
    # Train risk model
    print("\nTraining risk prediction model...")
    risk_model = RandomForestRegressor(
        n_estimators=100,
        max_depth=10,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    risk_model.fit(X_train, y_risk_train)
    
    # Evaluate risk model
    y_risk_pred = risk_model.predict(X_test)
    risk_mse = mean_squared_error(y_risk_test, y_risk_pred)
    risk_r2 = r2_score(y_risk_test, y_risk_pred)
    
    print(f"Risk Model - MSE: {risk_mse:.4f}, R²: {risk_r2:.4f}")
    
    # Train days model
    print("\nTraining remaining days prediction model...")
    days_model = RandomForestRegressor(
        n_estimators=100,
        max_depth=10,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    days_model.fit(X_train, y_days_train)
    
    # Evaluate days model
    y_days_pred = days_model.predict(X_test)
    days_mse = mean_squared_error(y_days_test, y_days_pred)
    days_r2 = r2_score(y_days_test, y_days_pred)
    
    print(f"Days Model - MSE: {days_mse:.4f}, R²: {days_r2:.4f}")
    
    # Save models
    print(f"\nSaving models to {model_dir}...")
    os.makedirs(model_dir, exist_ok=True)
    
    predictor = ExpiryPredictor()
    predictor.save_models(risk_model, days_model)
    
    print("Training complete!")
    print("\nTo use ML models, set USE_ML=true environment variable when starting the service.")


if __name__ == '__main__':
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python train.py <training_data.csv> [model_dir]")
        print("\nExample:")
        print("  python train.py data/training_data.csv models")
        sys.exit(1)
    
    csv_path = sys.argv[1]
    model_dir = sys.argv[2] if len(sys.argv) > 2 else 'models'
    
    train_models(csv_path, model_dir)

