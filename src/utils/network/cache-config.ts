export const CACHE_TIMEOUT = 1000 * 60 * 15;

export const defaultCacheConfig = {
  // only cache 200
  cachePredicate: {
    responseMatch: ({ data }: { data: any }) => {
      // only caches if the response is not fallback
      const isFallback = !!data?.metadata?.isFallback;
      return !isFallback;
    },
    statusCheck: (status: number) => status >= 200 && status < 300,
  },
  // If we should return a old (possibly expired) cache when the current request failed
  // to get a valid response because of a network error, invalid status or etc.
  staleIfError: false,
  // 15 minutes lifespan as average session is ~ 3 min.
  ttl: CACHE_TIMEOUT,
};
