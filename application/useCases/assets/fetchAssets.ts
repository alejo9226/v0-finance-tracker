import { Asset } from '@/domain/entities/Asset'
import { assetRepositoryImpl } from '@/domain/repositories/AssetRepositoryImpl'
/**
 * Use case: Fetch all assets from the repository.
 *
 * @returns A list of assets belonging to the current user.
 * @throws Will throw if the repository fails to fetch the data.
 */
export async function fetchAssets(): Promise<Asset[]> {
  return await assetRepositoryImpl.fetchAssets()
}
