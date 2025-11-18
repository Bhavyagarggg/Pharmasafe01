"""
Expiry prediction model for medicine batches.
Uses rule-based predictions initially, with ML upgrade path.
"""
import numpy as np
from datetime import date
from typing import Dict, Optional
import os
import joblib
from sklearn.ensemble import RandomForestRegressor

from feature_extractor import extract_features, extract_features_raw


class ExpiryPredictor:
    """
    Predicts expiry risk, confidence, and remaining days for medicine batches.
    """
    
    def __init__(self, use_ml: bool = False, model_dir: str = 'models'):
        """
        Initialize predictor.
        
        Args:
            use_ml: Whether to use ML models (requires trained models)
            model_dir: Directory containing saved models
        """
        self.use_ml = use_ml
        self.model_dir = model_dir
        self.risk_model: Optional[RandomForestRegressor] = None
        self.days_model: Optional[RandomForestRegressor] = None
        self.is_trained = False
        
        if use_ml:
            self._load_models()
    
    def _load_models(self):
        """Load trained models from disk if they exist."""
        risk_model_path = os.path.join(self.model_dir, 'risk_model.pkl')
        days_model_path = os.path.join(self.model_dir, 'days_model.pkl')
        
        if os.path.exists(risk_model_path) and os.path.exists(days_model_path):
            try:
                self.risk_model = joblib.load(risk_model_path)
                self.days_model = joblib.load(days_model_path)
                self.is_trained = True
                print(f"Loaded models from {self.model_dir}")
            except Exception as e:
                print(f"Error loading models: {e}. Falling back to rule-based predictions.")
                self.use_ml = False
        else:
            print(f"Models not found in {self.model_dir}. Using rule-based predictions.")
            self.use_ml = False
    
    def predict(self, medicine_data: Dict) -> Dict:
        """
        Predict risk, confidence, and remaining days for a medicine batch.
        
        Args:
            medicine_data: Dictionary containing:
                - purchase_date: str (YYYY-MM-DD)
                - expiry_date: str (YYYY-MM-DD)
                - quantity: int
                - storage: str ('Cold' or 'Room')
        
        Returns:
            Dictionary with:
                - risk: int (0-100)
                - confidence: float (0-1)
                - remaining_days: int
        """
        if self.use_ml and self.is_trained:
            return self._predict_ml(medicine_data)
        else:
            return self._predict_rule_based(medicine_data)
    
    def _predict_ml(self, medicine_data: Dict) -> Dict:
        """Predict using ML models."""
        features = extract_features(medicine_data)
        
        # Predict risk (0-1 scale, then convert to 0-100)
        risk_score = self.risk_model.predict(features)[0]
        risk = max(0, min(100, int(risk_score * 100)))
        
        # Predict remaining days
        remaining_days = int(self.days_model.predict(features)[0])
        
        # Calculate confidence
        raw_features = extract_features_raw(medicine_data)
        confidence = self._calculate_confidence(raw_features, risk)
        
        return {
            'risk': risk,
            'confidence': round(confidence, 2),
            'remaining_days': remaining_days
        }
    
    def _predict_rule_based(self, medicine_data: Dict) -> Dict:
        """Predict using rule-based logic."""
        raw_features = extract_features_raw(medicine_data)
        
        days_until_expiry = raw_features['days_until_expiry']
        quantity = raw_features['quantity']
        storage = raw_features['storage']
        total_shelf_life = raw_features['total_shelf_life']
        
        # Calculate base risk based on days until expiry
        if days_until_expiry <= 0:
            risk = 100  # Expired
        elif days_until_expiry <= 7:
            risk = 95
        elif days_until_expiry <= 30:
            risk = 80
        elif days_until_expiry <= 60:
            risk = 50
        elif days_until_expiry <= 90:
            risk = 30
        else:
            # Very low risk, decrease gradually
            risk = max(0, 30 - (days_until_expiry - 90) / 10)
        
        # Adjust risk based on quantity (higher quantity = higher wastage risk)
        quantity_factor = min(quantity / 100, 1)  # Normalize to 0-1
        risk = min(100, risk + quantity_factor * 10)
        
        # Adjust risk based on storage type
        if storage == 'Cold':
            risk = min(100, risk + 5)  # Slightly higher risk for cold storage
        
        # Calculate confidence
        confidence = self._calculate_confidence(raw_features, risk)
        
        return {
            'risk': int(risk),
            'confidence': round(confidence, 2),
            'remaining_days': days_until_expiry
        }
    
    def _calculate_confidence(self, raw_features: Dict, risk: int) -> float:
        """
        Calculate prediction confidence based on data quality and proximity to expiry.
        
        Args:
            raw_features: Dictionary with raw feature values
            risk: Calculated risk score
        
        Returns:
            Confidence score (0-1)
        """
        days_until_expiry = raw_features['days_until_expiry']
        total_shelf_life = raw_features['total_shelf_life']
        
        # Base confidence based on data quality (total shelf life)
        if total_shelf_life > 180:  # More than 6 months of data
            base_confidence = 0.85
        elif total_shelf_life > 90:  # More than 3 months
            base_confidence = 0.75
        else:
            base_confidence = 0.65
        
        # Adjust confidence based on proximity to expiry
        if days_until_expiry < 0:
            return 1.0  # Expired - 100% confident
        elif days_until_expiry < 30:
            # More confident when close to expiry (more predictable)
            return min(1.0, base_confidence + 0.1)
        elif days_until_expiry < 90:
            return base_confidence
        else:
            # Less confident for far-future predictions
            return max(0.5, base_confidence - 0.1)
    
    def save_models(self, risk_model: RandomForestRegressor, days_model: RandomForestRegressor):
        """Save trained models to disk."""
        os.makedirs(self.model_dir, exist_ok=True)
        
        risk_model_path = os.path.join(self.model_dir, 'risk_model.pkl')
        days_model_path = os.path.join(self.model_dir, 'days_model.pkl')
        
        joblib.dump(risk_model, risk_model_path)
        joblib.dump(days_model, days_model_path)
        
        print(f"Models saved to {self.model_dir}")

