import { Asset } from '@/domain/entities/Asset'
import { assetRepositoryImpl } from '@/domain/repositories/AssetRepositoryImpl'

/**
 * Use case: Fetch all assets from the repository.
 *
 * @returns A list of assets belonging to the current user.
 * @throws Will throw if the repository fails to fetch the data.
 */
export async function getAssets(): Promise<Asset[]> {
  return await assetRepositoryImpl.fetchAssets()
}

/**
 * Use case: Fetch the current value of an asset from the repository.
 *
 * @param id - The id of the asset to fetch.
 * @returns The current value of the asset.
 * @throws Will throw if the repository fails to fetch the data.
 */
export async function getAssetCurrentValue(id: string): Promise<Asset> {
  return await assetRepositoryImpl.fetchAssetCurrentValue(id)
}
