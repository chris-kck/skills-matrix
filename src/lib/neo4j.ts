import type { Driver, Node, Record as Neo4jRecord, Integer, QueryResult } from 'neo4j-driver'
import neo4j from 'neo4j-driver'
import { env } from '~/env'

// Define a more specific type for Neo4j Node with properties
interface NodeWithProperties extends Node {
  properties: Record<string, unknown>
}

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

export interface DbRecord {
  id: Integer
  properties: Record<string, unknown>
}

export const recordToObject = (record: Neo4jRecord): DbRecord => {
  const node = record.get(0) as NodeWithProperties
  return {
    id: node.identity,
    properties: node.properties as Record<string, unknown>,
  }
}

export const getFirstRecord = <T>(result: QueryResult, key: string): T => {
  if (!result?.records) {
    throw new Error(`No result found`)
  }
  
  const [record] = result.records
  if (!record) {
    throw new Error(`No ${key} found`)
  }
  
  const node = record.get(key) as NodeWithProperties | null
  if (!node?.properties) {
    throw new Error(`Invalid ${key} record`)
  }
  
  return node.properties as T
} 