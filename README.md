<img src="./assets/logo.png" width="500px">

Tiny-nORM is a small, no nonsense, zero dependency persistence solution for NodeJS/Bun and PostgreSQL.

It's easy to use and organizes your code really well with DDD repository pattern.

I've been using something like this in few of my failed bootstrapped startups
(ex: [CrossKeeper](https://crosskeeper.app) and [LambdaQueue](https://lambdaqueue.com)).
It worked really well. Try it out next time you'll have a temptation to use ORM but still remember the N+1 queries and stale object
errors.

Check [this blog post](https://marekpiechut.github.io/post/2024-07-11_postgres-document-store/) for details.

# Features

- ✅ Support for relational and document data model
- ✅ Support for multi-tenancy with Postgres row level security
- ✅ Support for cross-repository transactions
- ✅ SQL templating helper for easy querying
- ✅ Easy to get started and customize

# How to use

## Make sure you have tables in PostgreSQL

```sql
create table table1 (
  id varchar(255) primary key,
  created timestamp not null default now(),
  updated timestamp not null default now(),
  tenant_id varchar(255),
  data jsonb 
);`
```

Tiny-nORM does not manage tables for you, you probably should use different user and access rights for DDL and DML anyway.

## Create your repositories and entity types

```typescript
type Entity = {
  id: string
  name: string
}
class TestRepository extends JsonRepository<Entity> {
  constructor(pool: pg.Pool) {
    super('table1', pool)
  }

  protected clone(): this {
    return new TestRepository(this.pgPool) as this
  }
}
```

## Query, use transactions, do whatever you need

### Without transactions

```typescript
  const repo = new TestRepository(pool)
  const saved = await repo.insert({ id: '1', name: 'test' })
  const fetched = await repo.fetch('1')
  expect(fetched).to.deep.equal(saved)
```

### With transactions

```typescript
const repo = new TestRepository(pool)

await withTx(client, async tx => {
  const txRepo = repo.withTx(tx)
  const saved = await txRepo.insert({ id: '1', name: 'test' })
  const fetched = await txRepo.fetch('1')
  expect(fetched).to.deep.equal(saved)
})
```

# Enable row level security

## Make sure row level security is enabled on table

```sql
`ALTER TABLE table1;`,
`CREATE POLICY TENANT_POLICY on table1 USING (
  tenant_id = current_setting('app.current_tenant', true)
);`,
```

## Query for data that's only accessible by tenant

```typescript
const repo = new TestRepository(pool)
const tenantRepo = repo.withTenant(tennantId)
await tenantRepo.fetch('1')
```

this will also insert new rows with current tenantId.