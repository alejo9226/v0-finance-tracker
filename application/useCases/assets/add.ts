import { Asset } from '@/domain/entities/Asset'
import { assetRepositoryImpl } from '@/domain/repositories/AssetRepositoryImpl'

/**
 * Use case: Add an asset to the repository.
 *
 * @param asset - The asset to add.
 * @throws Will throw if the repository fails to add the data.
 */
export async function addAsset(asset: Omit<Asset, 'id'>): Promise<void> {
  return await assetRepositoryImpl.createAsset(asset)
}

/**
 * Use case: Add multiple assets to the repository.
 *
 * @param assets - The assets to add.
 * @throws Will throw if the repository fails to add the data.
 */
export async function addMultipleAssets(assets: Omit<Asset, 'id' | 'currency'>[]): Promise<void> {
  return await assetRepositoryImpl.createMultipleAssets(assets)
}
