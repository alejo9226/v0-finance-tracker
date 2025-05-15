"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Check, CreditCard, DollarSign, Landmark, Wallet } from "lucide-react"

import { useAuth } from "@/contexts/auth-context"
import { AuthCheck } from "@/components/auth-check"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { createMultipleAssets } from "@/lib/supabase/data-services/assets"
import { createMultipleLiabilities } from "@/lib/supabase/data-services/liabilities"
import { getProfileOnboardingStatus, updateProfileOnboardingStatus } from "@/lib/supabase/data-services/profiles"

type AssetType = {
  id: string
  type: string
  name: string
  value: number
}

type LiabilityType = {
  id: string
  type: string
  name: string
  value: number
}

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [assets, setAssets] = useState<AssetType[]>([])
  const [liabilities, setLiabilities] = useState<LiabilityType[]>([])
  const [newAsset, setNewAsset] = useState({ type: "bank", name: "", value: "" })
  const [newLiability, setNewLiability] = useState({ type: "credit", name: "", value: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) return

      const profile = await getProfileOnboardingStatus(user.id)

      if (profile && profile.is_onboarded) {
        router.push("/dashboard")
      }
    }

    checkOnboardingStatus()
  }, [user, router])

  const handleAddAsset = () => {
    if (newAsset.name && newAsset.value) {
      setAssets([
        ...assets,
        {
          id: Math.random().toString(36).substr(2, 9),
          type: newAsset.type,
          name: newAsset.name,
          value: Number.parseFloat(newAsset.value),
        },
      ])
      setNewAsset({ type: "bank", name: "", value: "" })
    }
  }

  const handleAddLiability = () => {
    if (newLiability.name && newLiability.value) {
      setLiabilities([
        ...liabilities,
        {
          id: Math.random().toString(36).substr(2, 9),
          type: newLiability.type,
          name: newLiability.name,
          value: Number.parseFloat(newLiability.value),
        },
      ])
      setNewLiability({ type: "credit", name: "", value: "" })
    }
  }

  const handleRemoveAsset = (id: string) => {
    setAssets(assets.filter((asset) => asset.id !== id))
  }

  const handleRemoveLiability = (id: string) => {
    setLiabilities(liabilities.filter((liability) => liability.id !== id))
  }

  const handleComplete = async () => {
    if (!user) return

    setIsSubmitting(true)

    try {
      // Save assets to Supabase
      if (assets.length > 0) {
        await createMultipleAssets(
          assets.map((asset) => ({
            user_id: user.id,
            type: asset.type,
            name: asset.name,
            value: asset.value,
            // currency: "USD", TODO: Add currency to onboarding
          })),
        )
      }

      // Save liabilities to Supabase
      if (liabilities.length > 0) {
        await createMultipleLiabilities(
          liabilities.map((liability) => ({
            user_id: user.id,
            type: liability.type,
            name: liability.name,
            value: liability.value,
          })),
        )
      }

      // Update user profile as onboarded
      await updateProfileOnboardingStatus(user.id, true)

      toast({
        title: "Setup complete",
        description: "Your financial profile has been set up successfully",
      })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getAssetIcon = (type: string) => {
    switch (type) {
      case "bank":
        return <Landmark className="h-4 w-4" />
      case "investment":
        return <DollarSign className="h-4 w-4" />
      case "cash":
        return <Wallet className="h-4 w-4" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  const getLiabilityIcon = (type: string) => {
    switch (type) {
      case "credit":
        return <CreditCard className="h-4 w-4" />
      case "loan":
        return <Landmark className="h-4 w-4" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  return (
    <AuthCheck>
      <div className="container max-w-3xl py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Financial Setup</h1>
          <p className="text-muted-foreground mt-2">Let&apos;s set up your financial profile</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= 1 ? "bg-green-500 text-white" : "bg-gray-200"}`}
              >
                {step > 1 ? <Check className="h-4 w-4" /> : 1}
              </div>
              <span className="text-sm font-medium">Assets</span>
            </div>
            <Separator className="w-24" />
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= 2 ? "bg-green-500 text-white" : "bg-gray-200"}`}
              >
                {step > 2 ? <Check className="h-4 w-4" /> : 2}
              </div>
              <span className="text-sm font-medium">Liabilities</span>
            </div>
            <Separator className="w-24" />
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= 3 ? "bg-green-500 text-white" : "bg-gray-200"}`}
              >
                {step > 3 ? <Check className="h-4 w-4" /> : 3}
              </div>
              <span className="text-sm font-medium">Summary</span>
            </div>
          </div>
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Assets</CardTitle>
              <CardDescription>Add your bank accounts, investments, cash, and other assets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="asset-type">Type</Label>
                  <select
                    id="asset-type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newAsset.type}
                    onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
                  >
                    <option value="bank">Bank Account</option>
                    <option value="investment">Investment</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="asset-name">Name</Label>
                  <Input
                    id="asset-name"
                    placeholder="Checking Account"
                    value={newAsset.name}
                    onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="asset-value">Value ($)</Label>
                  <Input
                    id="asset-value"
                    type="number"
                    placeholder="10000"
                    value={newAsset.value}
                    onChange={(e) => setNewAsset({ ...newAsset, value: e.target.value })}
                  />
                </div>
              </div>
              <Button type="button" onClick={handleAddAsset} variant="outline" className="w-full">
                Add Asset
              </Button>

              {assets.length > 0 && (
                <div className="rounded-md border">
                  <div className="p-4">
                    <h3 className="font-medium">Your Assets</h3>
                  </div>
                  <div className="divide-y">
                    {assets.map((asset) => (
                      <div key={asset.id} className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                            {getAssetIcon(asset.type)}
                          </div>
                          <div>
                            <p className="font-medium">{asset.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {asset.type.charAt(0).toUpperCase() + asset.type.slice(1)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-medium">${asset.value.toLocaleString()}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveAsset(asset.id)}
                            className="h-8 w-8 p-0"
                          >
                            <span className="sr-only">Remove</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                            >
                              <path d="M18 6 6 18" />
                              <path d="m6 6 12 12" />
                            </svg>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between border-t p-4">
                    <p className="font-medium">Total Assets</p>
                    <p className="font-bold">${assets.reduce((sum, asset) => sum + asset.value, 0).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => router.push("/")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={() => setStep(2)}>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Liabilities</CardTitle>
              <CardDescription>Add your credit cards, loans, and other debts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="liability-type">Type</Label>
                  <select
                    id="liability-type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newLiability.type}
                    onChange={(e) => setNewLiability({ ...newLiability, type: e.target.value })}
                  >
                    <option value="credit">Credit Card</option>
                    <option value="loan">Loan</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="liability-name">Name</Label>
                  <Input
                    id="liability-name"
                    placeholder="Credit Card"
                    value={newLiability.name}
                    onChange={(e) => setNewLiability({ ...newLiability, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="liability-value">Value ($)</Label>
                  <Input
                    id="liability-value"
                    type="number"
                    placeholder="5000"
                    value={newLiability.value}
                    onChange={(e) => setNewLiability({ ...newLiability, value: e.target.value })}
                  />
                </div>
              </div>
              <Button type="button" onClick={handleAddLiability} variant="outline" className="w-full">
                Add Liability
              </Button>

              {liabilities.length > 0 && (
                <div className="rounded-md border">
                  <div className="p-4">
                    <h3 className="font-medium">Your Liabilities</h3>
                  </div>
                  <div className="divide-y">
                    {liabilities.map((liability) => (
                      <div key={liability.id} className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                            {getLiabilityIcon(liability.type)}
                          </div>
                          <div>
                            <p className="font-medium">{liability.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {liability.type.charAt(0).toUpperCase() + liability.type.slice(1)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-medium">${liability.value.toLocaleString()}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveLiability(liability.id)}
                            className="h-8 w-8 p-0"
                          >
                            <span className="sr-only">Remove</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                            >
                              <path d="M18 6 6 18" />
                              <path d="m6 6 12 12" />
                            </svg>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between border-t p-4">
                    <p className="font-medium">Total Liabilities</p>
                    <p className="font-bold">
                      ${liabilities.reduce((sum, liability) => sum + liability.value, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={() => setStep(3)}>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
              <CardDescription>Review your financial information before completing setup</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-md border p-4">
                <h3 className="font-medium mb-4">Assets</h3>
                {assets.length > 0 ? (
                  <div className="space-y-2">
                    {assets.map((asset) => (
                      <div key={asset.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">
                            {getAssetIcon(asset.type)}
                          </div>
                          <span>{asset.name}</span>
                        </div>
                        <span className="font-medium">${asset.value.toLocaleString()}</span>
                      </div>
                    ))}
                    <Separator className="my-2" />
                    <div className="flex items-center justify-between font-bold">
                      <span>Total Assets</span>
                      <span>${assets.reduce((sum, asset) => sum + asset.value, 0).toLocaleString()}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No assets added</p>
                )}
              </div>

              <div className="rounded-md border p-4">
                <h3 className="font-medium mb-4">Liabilities</h3>
                {liabilities.length > 0 ? (
                  <div className="space-y-2">
                    {liabilities.map((liability) => (
                      <div key={liability.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                            {getLiabilityIcon(liability.type)}
                          </div>
                          <span>{liability.name}</span>
                        </div>
                        <span className="font-medium">${liability.value.toLocaleString()}</span>
                      </div>
                    ))}
                    <Separator className="my-2" />
                    <div className="flex items-center justify-between font-bold">
                      <span>Total Liabilities</span>
                      <span>${liabilities.reduce((sum, liability) => sum + liability.value, 0).toLocaleString()}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No liabilities added</p>
                )}
              </div>

              <div className="rounded-md bg-green-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-green-800">Your Equity</h3>
                    <p className="text-sm text-green-700">Assets - Liabilities</p>
                  </div>
                  <div className="text-2xl font-bold text-green-800">
                    $
                    {(
                      assets.reduce((sum, asset) => sum + asset.value, 0) -
                      liabilities.reduce((sum, liability) => sum + liability.value, 0)
                    ).toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleComplete} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Complete Setup"}
                <Check className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </AuthCheck>
  )
}
