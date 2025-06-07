export const MANAGED = Symbol('[MANAGED_MARKER]')

export type TenantId = string
export type Managed = { [MANAGED]: true }
export type MaybeManaged = { [MANAGED]?: boolean }
export type Unmanaged = { [MANAGED]: false | undefined }
export type HasId = { id: Id }
export type Id = string

export type Entity = {
	id: Id
}

export type SavedEntity<T extends Entity> = T & {
	id: Id
	created: Date
	updated: Date
	[MANAGED]: boolean
}

export type PagedResult<T> = {
	items: T[]
	nextCursor?: string
}
