import { Asset } from '@/domain/entities/Asset'

export interface AssetRepository {
  fetchAssets: () => Promise<Asset[]>

  fetchAssetCurrentValue: (id: string) => Promise<Asset>

  createAsset: (body: Omit<Asset, 'id'>) => Promise<void>

  createMultipleAssets: (body: Omit<Asset, 'id' | 'currency'>[]) => Promise<void>

  updateAsset: (id: string, body: Partial<Omit<Asset, 'id' | 'user_id'>>) => Promise<void>

  deleteAsset: (id: string) => Promise<void>
}
