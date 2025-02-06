type GroupType = {
  drugId: string
  inventories: InventoryType[]
  groupMin: number
  groupMax: number
}

type InventoryType = {
  inventoryId: string
}

type RawQueryInventoryGroupType = {
  groupid: string
  drugid: string
  drugname: string
  drugimage: string
  drugpriority: number
  drugunit: string
  inventoryid: string
  groupmin: number
  groupmax: number
  inventoryposition: number
  inventoryqty: number
  inventoryList?: InventoryListType[]
}

type InventoryGroupType = {
  groupid: string
  drugid: string
  drugname: string
  drugimage: string
  drugpriority: number
  drugunit: string
  groupmin: number
  groupmax: number
  inventoryList?: InventoryListType[]
}

type InventoryListType = {
  inventoryId: string
  inventoryPosition: number
  inventoryQty: number
}

export type { GroupType, InventoryType, RawQueryInventoryGroupType, InventoryGroupType }
