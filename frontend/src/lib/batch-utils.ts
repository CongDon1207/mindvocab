// src/lib/batch-utils.ts

/**
 * Batch size for sequential sessions (10 words per batch)
 */
export const BATCH_SIZE = 10

/**
 * Compute current batch index and total batches for a sequential session
 * @param totalWords - Total number of words in the folder
 * @param currentBatchStartIndex - Start index of the current batch (0-based)
 * @returns Object with currentBatchIndex (1-based) and totalBatches
 */
export function computeBatchProgress(
  totalWords: number,
  currentBatchStartIndex: number
): { currentBatchIndex: number; totalBatches: number } {
  const totalBatches = Math.ceil(totalWords / BATCH_SIZE)
  const currentBatchIndex = Math.floor(currentBatchStartIndex / BATCH_SIZE) + 1

  return {
    currentBatchIndex,
    totalBatches
  }
}
