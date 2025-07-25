import { Role } from '@prisma/client'

type UserType = {
  id: string
  username: string
  password: string
  display: string
  role: Role
  picture?: string
  status: boolean
  comment?: string
  createdAt: Date
  updatedAt: Date
  biometrics: string
}

type BiometricsType = {
  id: string
  type: string
  featureData: string
  description?: string
  createdAt: Date
  userId: string
}

type UserFingerprintType = {
  userId: string,
  featureData: string
  description: string
}

type UserLoginWithFingerType = {
  bid: string
}

export type { UserType, BiometricsType, UserFingerprintType, UserLoginWithFingerType }
