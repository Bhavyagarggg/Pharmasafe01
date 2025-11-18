/**
 * ML Service Client
 * Utility functions to interact with the Python ML prediction service
 */

export interface MedicineData {
  batch_id: string
  purchase_date: string // YYYY-MM-DD
  expiry_date: string // YYYY-MM-DD
  quantity: number
  storage: 'Cold' | 'Room'
}

export interface PredictionResult {
  batch_id: string
  risk: number // 0-100
  confidence: number // 0-1
  remaining_days: number
  error?: string
}

export interface BatchPredictionResponse {
  predictions: PredictionResult[]
}

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000'

/**
 * Call ML service health check endpoint
 */
export async function checkMLServiceHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      return false
    }

    const data = await response.json()
    return data.status === 'healthy'
  } catch (error) {
    console.error('[ML Client] Health check failed:', error)
    return false
  }
}

/**
 * Predict expiry risk for multiple medicine batches
 * @param medicines Array of medicine data
 * @returns Array of predictions with batch_id, risk, confidence, and remaining_days
 */
export async function predictBatch(
  medicines: MedicineData[]
): Promise<PredictionResult[]> {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/predict-batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        medicines: medicines.map((m) => ({
          batch_id: m.batch_id,
          purchase_date: m.purchase_date,
          expiry_date: m.expiry_date,
          quantity: m.quantity,
          storage: m.storage,
        })),
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`ML service error: ${response.status} - ${errorText}`)
    }

    const data: BatchPredictionResponse = await response.json()
    return data.predictions
  } catch (error) {
    console.error('[ML Client] Batch prediction failed:', error)
    throw error
  }
}

/**
 * Predict expiry risk for a single medicine batch
 * @param medicine Medicine data
 * @returns Prediction with risk, confidence, and remaining_days
 */
export async function predictSingle(
  medicine: MedicineData
): Promise<Omit<PredictionResult, 'batch_id'>> {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        purchase_date: medicine.purchase_date,
        expiry_date: medicine.expiry_date,
        quantity: medicine.quantity,
        storage: medicine.storage,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`ML service error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    return {
      risk: data.risk,
      confidence: data.confidence,
      remaining_days: data.remaining_days,
    }
  } catch (error) {
    console.error('[ML Client] Single prediction failed:', error)
    throw error
  }
}

