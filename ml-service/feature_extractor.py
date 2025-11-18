"""
Feature extraction module for medicine expiry prediction.
Extracts and normalizes features from medicine data.
"""
from datetime import datetime, date
from typing import Dict, List
import numpy as np


def extract_features(medicine_data: Dict) -> np.ndarray:
    """
    Extract features from medicine data for ML model input.
    
    Args:
        medicine_data: Dictionary containing:
            - purchase_date: str (YYYY-MM-DD format)
            - expiry_date: str (YYYY-MM-DD format)
            - quantity: int
            - storage: str ('Cold' or 'Room')
    
    Returns:
        numpy array of normalized features:
        [days_until_expiry, days_since_purchase, total_shelf_life,
         quantity, storage_encoded, expiry_ratio, month_of_year]
    """
    today = date.today()
    
    # Parse dates
    purchase = datetime.strptime(medicine_data['purchase_date'], '%Y-%m-%d').date()
    expiry = datetime.strptime(medicine_data['expiry_date'], '%Y-%m-%d').date()
    
    # Calculate time-based features
    days_until_expiry = (expiry - today).days
    days_since_purchase = (today - purchase).days
    total_shelf_life = (expiry - purchase).days
    
    # Calculate expiry ratio (how much of shelf life has passed)
    expiry_ratio = days_since_purchase / total_shelf_life if total_shelf_life > 0 else 0
    
    # Encode storage type: 0 = Room, 1 = Cold
    storage_encoded = 1 if medicine_data['storage'] == 'Cold' else 0
    
    # Get current month (1-12) for seasonal patterns
    month_of_year = today.month
    
    # Normalize features
    # Days until expiry: normalize to 0-1 (assuming max 2 years = 730 days)
    normalized_days_until_expiry = max(-1, min(1, days_until_expiry / 730))
    
    # Days since purchase: normalize to 0-1 (assuming max 2 years)
    normalized_days_since_purchase = max(0, min(1, days_since_purchase / 730))
    
    # Total shelf life: normalize to 0-1 (assuming max 3 years = 1095 days)
    normalized_total_shelf_life = max(0, min(1, total_shelf_life / 1095))
    
    # Quantity: normalize to 0-1 (assuming max 1000 units)
    normalized_quantity = max(0, min(1, medicine_data['quantity'] / 1000))
    
    # Expiry ratio: already 0-1
    normalized_expiry_ratio = max(0, min(1, expiry_ratio))
    
    # Month: normalize to 0-1 (1-12 -> 0-1)
    normalized_month = (month_of_year - 1) / 11
    
    # Return feature vector
    return np.array([[
        normalized_days_until_expiry,
        normalized_days_since_purchase,
        normalized_total_shelf_life,
        normalized_quantity,
        storage_encoded,
        normalized_expiry_ratio,
        normalized_month
    ]])


def extract_features_raw(medicine_data: Dict) -> Dict:
    """
    Extract raw (non-normalized) features for rule-based calculations.
    
    Args:
        medicine_data: Dictionary containing medicine data
    
    Returns:
        Dictionary with raw feature values
    """
    today = date.today()
    
    purchase = datetime.strptime(medicine_data['purchase_date'], '%Y-%m-%d').date()
    expiry = datetime.strptime(medicine_data['expiry_date'], '%Y-%m-%d').date()
    
    days_until_expiry = (expiry - today).days
    days_since_purchase = (today - purchase).days
    total_shelf_life = (expiry - purchase).days
    expiry_ratio = days_since_purchase / total_shelf_life if total_shelf_life > 0 else 0
    
    return {
        'days_until_expiry': days_until_expiry,
        'days_since_purchase': days_since_purchase,
        'total_shelf_life': total_shelf_life,
        'expiry_ratio': expiry_ratio,
        'quantity': medicine_data['quantity'],
        'storage': medicine_data['storage'],
        'month_of_year': today.month
    }

