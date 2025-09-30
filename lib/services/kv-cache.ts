import Redis from "ioredis";
import { Id } from "@/convex/_generated/dataModel";
import { StorageService } from "./storage";

// Initialize Redis client
let redis: Redis | null = null;

function getRedisClient(): Redis {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redis.on("error", (err) => {
      console.error("Redis connection error:", err);
    });

    redis.on("connect", () => {
      console.log("Redis connected successfully");
    });
  }

  return redis;
}

export interface ClientContext {
  clientId: string;
  clientName: string;
  documents: Array<{
    id: string;
    name: string;
    type: string;
    extractedData?: Record<string, any>;
    content?: string; // For text documents
  }>;
  profile: {
    name: string;
    domain?: string;
    description?: string;
    categories: string[];
  };
  metadata: {
    version: string;
    generatedAt: string;
    documentCount: number;
    totalTokens: number;
  };
}

export class KVCacheService {
  private static redis = getRedisClient();

  /**
   * Generate cache key for a client
   */
  static getCacheKey(clientId: string, version?: string): string {
    return `kv_cache:${clientId}:${version || "latest"}`;
  }

  /**
   * Store client context in Redis cache
   */
  static async setClientContext(
    clientId: string,
    context: ClientContext,
    ttl: number = 86400 // 24 hours default
  ): Promise<void> {
    const key = this.getCacheKey(clientId, context.metadata.version);

    // Store in Redis
    await this.redis.setex(key, ttl, JSON.stringify(context));

    // Also maintain a "latest" pointer
    const latestKey = this.getCacheKey(clientId, "latest");
    await this.redis.setex(latestKey, ttl, JSON.stringify(context));

    // Backup to S3 for cold storage
    await this.backupToS3(clientId, context);

    console.log(`Cached context for client ${clientId}, version ${context.metadata.version}`);
  }

  /**
   * Get client context from cache
   */
  static async getClientContext(
    clientId: string,
    version?: string
  ): Promise<ClientContext | null> {
    const key = this.getCacheKey(clientId, version);

    try {
      const data = await this.redis.get(key);

      if (data) {
        // Refresh TTL on access (keep hot data hot)
        await this.redis.expire(key, 86400);
        return JSON.parse(data);
      }

      // Try loading from S3 backup
      console.log(`Cache miss for ${key}, attempting S3 restore...`);
      return await this.restoreFromS3(clientId, version);
    } catch (error) {
      console.error("Error getting client context:", error);
      return null;
    }
  }

  /**
   * Check if cache exists
   */
  static async cacheExists(clientId: string, version?: string): Promise<boolean> {
    const key = this.getCacheKey(clientId, version);
    const exists = await this.redis.exists(key);
    return exists === 1;
  }

  /**
   * Generate client context from database and cache it
   * This is a background job triggered after document uploads/updates
   */
  static async generateAndCacheClientContext(clientId: Id<"clients">): Promise<ClientContext> {
    // In production, this would:
    // 1. Query Convex for all client data
    // 2. Load document content from S3
    // 3. Format into structured context
    // 4. Calculate version hash
    // 5. Estimate token count

    // Mock implementation
    const context: ClientContext = {
      clientId,
      clientName: "Sample Client",
      documents: [
        {
          id: "doc-1",
          name: "General Liability Policy",
          type: "binded_policy",
          extractedData: {
            namedInsured: "Sample Client Inc.",
            policyNumber: "GL-2025-001",
            premium: 5000,
            effectiveDate: "01/01/2025",
          },
        },
        {
          id: "doc-2",
          name: "Property Quote",
          type: "carrier_quote",
          extractedData: {
            carrier: "Acme Insurance",
            premium: 3000,
            limits: { "Building": "$1,000,000" },
          },
        },
      ],
      profile: {
        name: "Sample Client",
        domain: "sampleclient.com",
        description: "A sample client for demonstration",
        categories: ["Technology", "SaaS"],
      },
      metadata: {
        version: this.generateVersionHash(),
        generatedAt: new Date().toISOString(),
        documentCount: 2,
        totalTokens: 15000, // Estimated
      },
    };

    // Cache it
    await this.setClientContext(clientId, context);

    return context;
  }

  /**
   * Invalidate cache for a client
   * Called when documents are added, updated, or deleted
   */
  static async invalidateCache(clientId: string): Promise<void> {
    const pattern = `kv_cache:${clientId}:*`;
    const keys = await this.redis.keys(pattern);

    if (keys.length > 0) {
      await this.redis.del(...keys);
      console.log(`Invalidated ${keys.length} cache entries for client ${clientId}`);
    }

    // Optionally trigger regeneration
    // await this.generateAndCacheClientContext(clientId);
  }

  /**
   * Append new document to existing cache (incremental update)
   */
  static async appendDocumentToCache(
    clientId: string,
    document: ClientContext["documents"][0]
  ): Promise<void> {
    const context = await this.getClientContext(clientId);

    if (context) {
      // Add new document
      context.documents.push(document);

      // Update metadata
      context.metadata.version = this.generateVersionHash();
      context.metadata.documentCount = context.documents.length;
      context.metadata.generatedAt = new Date().toISOString();

      // Re-cache with new version
      await this.setClientContext(clientId, context);
    } else {
      // No existing cache, generate fresh
      await this.generateAndCacheClientContext(clientId as Id<"clients">);
    }
  }

  /**
   * Get cache statistics
   */
  static async getCacheStats(clientId: string): Promise<{
    exists: boolean;
    size?: number;
    ttl?: number;
    documentCount?: number;
    version?: string;
  }> {
    const key = this.getCacheKey(clientId);
    const exists = await this.cacheExists(clientId);

    if (!exists) {
      return { exists: false };
    }

    const data = await this.redis.get(key);
    const ttl = await this.redis.ttl(key);

    if (data) {
      const context: ClientContext = JSON.parse(data);
      return {
        exists: true,
        size: Buffer.byteLength(data, "utf8"),
        ttl,
        documentCount: context.metadata.documentCount,
        version: context.metadata.version,
      };
    }

    return { exists: false };
  }

  /**
   * Warm up cache for frequently accessed clients
   */
  static async warmUpCache(clientIds: string[]): Promise<void> {
    console.log(`Warming up cache for ${clientIds.length} clients...`);

    const promises = clientIds.map((clientId) =>
      this.generateAndCacheClientContext(clientId as Id<"clients">)
    );

    await Promise.all(promises);

    console.log("Cache warm-up complete");
  }

  /**
   * Backup context to S3 for cold storage
   */
  private static async backupToS3(clientId: string, context: ClientContext): Promise<void> {
    try {
      const key = `cache-backups/kv-cache/${clientId}/${context.metadata.version}.json`;

      await StorageService.uploadFile({
        key,
        body: JSON.stringify(context, null, 2),
        contentType: "application/json",
        metadata: {
          clientId,
          version: context.metadata.version,
          generatedAt: context.metadata.generatedAt,
        },
      });
    } catch (error) {
      console.error("Failed to backup cache to S3:", error);
      // Don't throw - backup is optional
    }
  }

  /**
   * Restore context from S3 backup
   */
  private static async restoreFromS3(
    clientId: string,
    version?: string
  ): Promise<ClientContext | null> {
    try {
      const key = `cache-backups/kv-cache/${clientId}/${version || "latest"}.json`;
      const buffer = await StorageService.getFile(key);
      const context: ClientContext = JSON.parse(buffer.toString("utf8"));

      // Restore to Redis
      await this.setClientContext(clientId, context);

      return context;
    } catch (error) {
      console.error("Failed to restore cache from S3:", error);
      return null;
    }
  }

  /**
   * Generate version hash for cache versioning
   */
  private static generateVersionHash(): string {
    return `v${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Clean up expired caches
   */
  static async cleanupExpiredCaches(): Promise<number> {
    const pattern = "kv_cache:*";
    const keys = await this.redis.keys(pattern);

    let deleted = 0;

    for (const key of keys) {
      const ttl = await this.redis.ttl(key);
      if (ttl === -1 || ttl === -2) {
        // -1: no expiry, -2: doesn't exist
        await this.redis.del(key);
        deleted++;
      }
    }

    console.log(`Cleaned up ${deleted} expired cache entries`);
    return deleted;
  }

  /**
   * Get all cached client IDs
   */
  static async getCachedClientIds(): Promise<string[]> {
    const pattern = "kv_cache:*:latest";
    const keys = await this.redis.keys(pattern);

    return keys.map((key) => key.split(":")[1]);
  }
}

// Export for use in agents
export async function loadClientContextForAgent(clientId: string): Promise<string> {
  const context = await KVCacheService.getClientContext(clientId);

  if (!context) {
    // Generate if not cached
    const newContext = await KVCacheService.generateAndCacheClientContext(
      clientId as Id<"clients">
    );
    return JSON.stringify(newContext, null, 2);
  }

  return JSON.stringify(context, null, 2);
}