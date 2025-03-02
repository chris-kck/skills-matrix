import neo4j, { Driver } from 'neo4j-driver'
import { env } from '~/env'

let driver: Driver | null = null

export const initNeo4j = () => {
  try {
    driver = neo4j.driver(
      env.NEO4J_URI,
      neo4j.auth.basic(env.NEO4J_USER, env.NEO4J_PASSWORD)
    )
    return driver
  } catch (error) {
    console.error('Error initializing Neo4j:', error)
    throw error
  }
}

export const getDriver = () => {
  if (!driver) {
    return initNeo4j()
  }
  return driver
}

export const closeDriver = async () => {
  if (driver) {
    await driver.close()
    driver = null
  }
}

export type Neo4jRecord = {
  id: string
  properties: Record<string, any>
}

export const recordToObject = (record: any): Neo4jRecord => {
  const node = record.get(0)
  return {
    id: node.identity.toString(),
    properties: node.properties,
  }
}

export const getFirstRecord = (result: any, key: string) => {
  const record = result.records[0]
  if (!record) {
    throw new Error(`No ${key} found`)
  }
  return record.get(key).properties
} 