// Pages Functions: 拦截 /api/* 全部请求，复用 worker 的 handleRequest
import { handleRequest, type Env } from "../../server/api/worker";

export const onRequest = (context: EventContext<Env, string, unknown>) => {
  return handleRequest(context.request, context.env, context);
};
