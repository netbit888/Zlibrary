// Pages Functions: 拦截 /api/* 全部请求，复用 worker 的 handleRequest
import { handleRequest, type Env } from "../../server/api/worker";

export const onRequest = async (context: EventContext<Env, string, unknown>) => {
  const fakeCtx = {
    waitUntil: (promise: Promise<any>) => context.waitUntil(promise),
    passThroughOnException: () => {},
  };
  return handleRequest(context.request, context.env, fakeCtx as any);
};
