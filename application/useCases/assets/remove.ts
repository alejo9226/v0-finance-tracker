import { assetRepositoryImpl } from '@/domain/repositories/AssetRepositoryImpl'

/**
 * Use case: Remove an asset in the repository.
 *
 * @param id - The id of the asset to remove.
 * @throws Will throw if the repository fails to remove the data.
 */
export async function removeAsset(id: string): Promise<void> {
  await assetRepositoryImpl.deleteAsset(id)
}
