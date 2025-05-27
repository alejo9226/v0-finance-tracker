import { Asset } from '@/domain/entities/Asset'
import { assetRepositoryImpl } from '@/domain/repositories/AssetRepositoryImpl'

/**
 * Use case: Update an asset in the repository.
 *
 * @param id - The id of the asset to update.
 * @param asset - The asset to update.
 * @throws Will throw if the repository fails to update the data.
 */
export async function updateAsset(id: string, body: Partial<Omit<Asset, 'id' | 'user_id'>>): Promise<void> {
  await assetRepositoryImpl.updateAsset(id, body)
}
